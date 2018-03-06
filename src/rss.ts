import * as _ from 'lodash'
import { IVideo } from './video'

export async function generateRss(videos: IVideo[]) {
  return genMeta('谜之声', 'submit/videos/som', videos.map(genEntry).join('\n'))
}

function genMeta(title: string, id: string, entries: string) {
  return `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="atom-to-html.xsl"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${title}</title>
  <generator uri="https://best33.com/">Bilibili RSS</generator>
  <updated>${new Date().toISOString()}</updated>
  <id>${id}</id>
  ${entries}
</feed>`
}

function genEntry(video: IVideo) {
  const desc = _.escape(video.description).replace(/\r\n|\r|\n/g, '<br>')
  let title = video.title
  if (video.subtitle) {
    title = video.subtitle + ' - ' + video.title
  }
  return `
<entry>
	<id>bilibili,${video.url}</id>
	<link href="${video.url}" rel="alternate" type="text/html" />
	<title type="html">${_.escape(title)}</title>
	<summary type="html"><![CDATA[<p>${desc}</p>]]></summary>
	<content type="html"><![CDATA[
    <p><img src="${video.coverUrl}" /></p>
    <p>${desc}</p>
  ]]></content>
	<updated>${video.created.toISOString()}</updated>
  <author>
    <name>${video.author.name}</name>
    <url>${video.author.url}</url>
  </author>
	<source>
		<id>${video.url}</id>
		<link rel="self" href="${video.url}"/>
		<updated>${video.created.toISOString()}</updated>
    <title>${_.escape(title)}</title>
  </source>
</entry>
`
}
