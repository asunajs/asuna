import { Method } from '@asign/types'

export { Method }

export interface ApiData {
  method?: Method
  headers?: Record<string, string>
  timeout?: number
  url: string
  data?: Record<string, any>
}

export interface Email {
  pass: string
  from: string
  port?: number
  host: string
  to?: string
}

export interface WorkWeixin {
  msgtype: 'text' | 'markdown' | 'textcard' | 'mpnews'
  touser: string
  agentid: number
  corpsecret: string
  corpid: string
  [x: string]: any
}

export interface WorkWeixinBot {
  url: string
  msgtype: 'text' | 'markdown'
  [x: string]: any
}

export interface ApiOptions {
  http: {
    fetch: any
  }
  logger: {
    info: any
    debug: any
    error: any
  }
}

export interface Bark {
  key: string
  level: 'active' | 'passive' | 'timeSensitive'
  [x: string]: any
}

export interface TwoIm {
  key: string
  sid: string
  query?: {
    plat?: 'ding'
    group?: string
    icon?: number | string
  }
  msgtype?: 'text' | 'markdown'
}

export interface TgBot {
  apiHost?: string
  token: string
  chat_id: string | number
  disable_web_page_preview?: boolean
  proxy?: string
  agent?: any
  [x: string]: any
}
