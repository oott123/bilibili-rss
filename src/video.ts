export interface IVideo {
  title: string
  subtitle?: string
  description: string
  url: string
  coverUrl: string
  author: {
    name: string
    url: string
  }
  duration: string
  created: number
}
