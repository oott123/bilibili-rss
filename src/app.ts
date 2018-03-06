import * as Debug from 'debug'
import * as https from 'https'
import { getSubmitVideos } from './fetch'
;(https.globalAgent as any).options.secureProtocol = 'TLSv1_method'
const debug = Debug('bilibili-rss:app')
;(async () => {
  debug(await getSubmitVideos(673816, 2))
})().catch(debug)
