import type { LoggerType } from '@asign/types'
import type { ApiType } from './api.js'
import type { Ecloud } from './options.js'

export interface M {
  api: ApiType
  logger: LoggerType
  sleep: (time: number) => Promise<number>
  rsaEncrypt: (pubKey: string, data: string) => string
  config: Ecloud
}

export interface BaseResult<T = unknown> {
  result: number
  data: T
}

export type EncryptConf = BaseResult<{
  upSmsOn: string
  pre: string // {NRP}
  preDomain: string // card.e.189.cn
  pubKey: string
}>
