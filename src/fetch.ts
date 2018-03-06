import axios from 'axios'
import * as Debug from 'debug'
import * as _ from 'lodash'
import * as NavyBird from 'navybird'
import { cache } from './cache'
import { IVideo } from './video'

const debug = Debug('bilibili-rss:fetch')

export async function getSubmitVideos(
  authorId: number,
  page: number = 1
): Promise<IVideo[]> {
  let rawData
  const cacheKey = `submits:${authorId}:${page}`
  const submitsCache = await cache.get(cacheKey)
  if (submitsCache) {
    debug(`videos cache hit for ${authorId}'s page ${page}`)
    rawData = submitsCache
  } else {
    const url = `https://space.bilibili.com/ajax/member/getSubmitVideos?mid=${authorId}&page=${page}&pagesize=25`
    debug(`fetching submit video list, url: ${url}`)
    const resp = await axios.get(url, {
      responseType: 'json'
    })
    rawData = resp.data
    if (!rawData.status) {
      throw new Error(rawData.data)
    }
    await cache.set(cacheKey, rawData)
  }
  const masterVideos: IVideo[] = rawData.data.vlist.map(item => {
    const video: IVideo = {
      title: `${item.title}${item.subtitle ? ' ' + item.subtitle : ''}`,
      description: item.description,
      url: `https://www.bilibili.com/video/av${item.aid}/`,
      coverUrl: item.pic,
      author: {
        name: item.author,
        url: `https://space.bilibili.com/${item.mid}`
      },
      duration: item.length,
      created: new Date(item.created * 1000)
    }
    return video
  })
  debug(
    `fetched ${masterVideos.length} master videos, try to extract sub videos`
  )
  const videos = _.flatten(
    await NavyBird.map(masterVideos, getSubVideos, {
      concurrency: 3
    })
  )
  debug(`extracted ${videos.length} videos.`)
  return videos
}

export async function getSubVideos(video: IVideo): Promise<IVideo[]> {
  const cacheKey = `subvideos:${video.url}`
  const cachedVideos = await cache.get<IVideo[]>(cacheKey)
  if (cachedVideos) {
    debug(`${video.title}: cache hit`)
    return cachedVideos
  }
  debug(`${video.title}: checking subvideos`)
  const entryRegex = /<option value='(\/video\/av\d+\/index_\d+\.html)' cid='\d+'>([^<]+)<\/option>/
  const listRegex = /<div id="plist">((?:.|\n|\r)*)<\/div>/
  const resp = await axios.get(video.url, { responseType: 'text' })
  const rawHtml: string = resp.data
  const listMatches = listRegex.exec(rawHtml)
  const resultList = []
  if (!listMatches) {
    resultList.push(video)
  } else {
    listMatches[1].replace(entryRegex, ($0, subUrl, subTitle) => {
      const subVideo = _.cloneDeep(video)
      subVideo.subtitle = subTitle
      subVideo.url = `https://www.bilibili.com${subUrl}`
      resultList.push(subVideo)
      return ''
    })
  }
  debug(`${video.title}: ${resultList.length} sub videos`)
  await cache.set(cacheKey, resultList)
  return resultList
}
