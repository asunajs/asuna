import type { Method } from '@asign/types'

export type { Method }

export type * from './options.d.js'

export interface ApiData {
  method?: Method
  headers?: Record<string, string>
  timeout?: number
  url: string
  data?: Record<string, any>
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
