export interface WpsResponse {
  /** 获取响应的 HTTP 状态码 */
  status: number
  /** 获取响应的 HTTP 状态 */
  statusText: string
  /** 获取响应的 header */
  headers: {
    'set-cookie': string[]
    [key: string]: string | string[]
  }
  /** 获取服务器返回的文本 Body */
  text(): string
  /** 	将服务器返回的 json 类型的 Body 转化为结构体 */
  json(): Record<string, any> | Array<any> | null | number | string | boolean
  /** 获取服务器返回的二进制结构的 Body */
  binary(): Buffer
}

export interface RequestOption {
  timeout?: number
  body?: Record<string, any> | string
  headers?: {
    'content-type'?: string
    'user-agent'?: string
    'cookie'?: string
    'accept'?: string
    'host'?: string
    'referer'?: string
    'origin'?: string
    'accept-encoding'?: string
    'accept-language'?: string
    'cache-control'?: string
    'pragma'?: string
    'upgrade-insecure-requests'?: string
    'x-requested-with'?: string
    'authorization'?: string
    'x-csrf-token'?: string
    'x-forwarded-for'?: string
    'x-forwarded-host'?: string
    'x-device-id'?: string
    [key: string]: string
  }
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

declare global {
  const HTTP: {
    get(url: string, options?: RequestOption): WpsResponse
    post(url: string, body: RequestOption['body'], options?: RequestOption): WpsResponse
    fetch(url: string, options?: RequestOption): WpsResponse
    delete(url: string, options?: RequestOption): WpsResponse
    put(url: string, body: RequestOption['body'], options?: RequestOption): WpsResponse
  }
  const ActiveSheet: any
  const Time: { sleep: (time: number) => Promise<number> }
  const Application: any
  const SMTP: any
  const Crypto: any
}

export {}
