import * as Debug from 'debug'
import * as express from 'express'
import * as https from 'https'
import { getSubmitVideos } from './fetch'
import { generateAtom } from './rss'
;(https.globalAgent as any).options.secureProtocol = 'TLSv1_method'

const debug = Debug('bilibili-rss:server')

const app = express()
app.get('/submits/:id', async (req, res, next) => {
  try {
    const videos = await getSubmitVideos(req.params.id, 1)
    const xml = await generateAtom(
      videos[0].author.name,
      'submits/' + req.params.id,
      videos
    )
    res.set('Content-Type', 'application/atom+xml; charset=utf-8')
    res.end(xml)
  } catch (err) {
    next(err)
  }
})

app.listen(process.env.PORT || 8989)
