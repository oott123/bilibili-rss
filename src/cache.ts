import * as fs from 'fs'
import { promisify } from 'util'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const existsAsync = promisify(fs.exists)
const unlinkAsync = promisify(fs.unlink)

export interface ICache {
  get<T>(key: string): Promise<T>
  set<T>(key: string, value: T, ttl: number): Promise<void>
}

interface ICacheEntry<T> {
  expires: number
  data: T
}

export class Cache implements ICache {
  private path: string
  constructor(path: string) {
    this.path = path
  }
  public async get<T>(key: string): Promise<T> {
    const filename = this.getFilename(key)
    if (!await existsAsync(filename)) {
      return null
    }
    const entry: ICacheEntry<T> = JSON.parse(
      (await readFileAsync(filename)).toString()
    )
    const now = Date.now()
    if (entry.expires >= now) {
      return entry.data
    }
    await unlinkAsync(filename)
    return null
  }
  public async set<T>(
    key: string,
    value: T,
    ttl: number = 5 * 60 * 1000
  ): Promise<void> {
    const filename = this.getFilename(key)
    const entry: ICacheEntry<T> = {
      expires: Date.now() + ttl,
      data: value
    }
    await writeFileAsync(filename, JSON.stringify(entry))
  }
  private getFilename(key: string) {
    return `${this.path}/${key.replace(/[/]/g, '--').substr(0, 252)}`
  }
}

export const cache = new Cache('/tmp')
