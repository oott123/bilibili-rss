import * as Debug from 'debug'
import * as https from 'https'
import { getSubmitVideos } from './fetch'
import { generateRss } from './rss'
;(https.globalAgent as any).options.secureProtocol = 'TLSv1_method'
const debug = Debug('bilibili-rss:app')
;(async () => {
  const videos = await getSubmitVideos(673816, 2)
  console.log(await generateRss(videos))
})().catch(debug)
