import { readFile } from 'fs/promises'

type PlaywrightCookie = {
  name: string
  value: string
  domain?: string
  path?: string
  expires?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

const cookies = JSON.parse(await readFile('./cookies.json', 'utf-8')) as PlaywrightCookie[]

const cookieString = cookies.reduce((cookie, cur) => cookie + `${cur.name}=${cur.value}; `, '').slice(0, -2)
