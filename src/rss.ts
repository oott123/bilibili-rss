import * as _ from 'lodash'
import { IVideo } from './video'

export async function generateAtom(
  title: string,
  id: string,
  videos: IVideo[]
) {
  return genAtomDoc(title, id, videos)
}

function genAtomDoc(title: string, id: string, entries: IVideo[]) {
  entries = _.orderBy(entries, 'created', 'desc')
  if (!entries.length) {
    return ''
  }
  return `
<?xml version="1.0" encoding="utf-8"?>
<?xml-stylesheet type="text/xsl" href="atom-to-html.xsl"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${title}</title>
  <link rel="self" type="text/html" href="https://www.bilibili.com" />
  <generator uri="https://best33.com/">Bilibili RSS</generator>
  <updated>${new Date(entries[0].created).toISOString()}</updated>
  <id>${id}</id>
  ${entries.map(genEntry).join('\n')}
</feed>`.trim()
}

function genEntry(video: IVideo) {
  const desc = _.escape(video.description).replace(/\r\n|\r|\n/g, '<br>')
  let title = video.title
  if (video.subtitle) {
    title = video.subtitle + ' - ' + video.title
  }
  return `
<entry>
	<id>${video.url}</id>
	<link href="${video.url}" rel="alternate" type="text/html" />
	<title type="html">${_.escape(title)}</title>
	<summary type="html"><![CDATA[<p>${desc}</p>]]></summary>
	<content type="html"><![CDATA[
    <p><img src="${video.coverUrl}" /></p>
    <p>${desc}</p>
  ]]></content>
	<updated>${new Date(video.created).toISOString()}</updated>
  <author>
    <name>${video.author.name}</name>
  </author>
	<source>
		<id>${video.url}</id>
		<link rel="self" href="${video.url}"/>
		<updated>${new Date(video.created).toISOString()}</updated>
    <title>${_.escape(title)}</title>
  </source>
</entry>
`
}
