import type { LoggerType } from '@asign/types'
import type { ApiType } from './api.js'
import type { Ecloud } from './options.js'

export interface M {
  api: ApiType
  logger: LoggerType
  sleep: (time: number) => Promise<number>
  rsaEncrypt?: (pubKey: string, username: string, password: string) => {
    password: string
    username: string
  }
  md5: (data: string) => string
  config: Ecloud
  store?: {
    AccessToken?: string
  }
}

export interface BaseResult<T = unknown> {
  result: number
  data: T
}

export interface BaseError {
  errorCode?: string
  errorMsg?: string
  success?: null
}

export interface BaseResp {
  res_code: number
  res_message: string
}

export type EncryptConf = BaseResult<{
  upSmsOn: string
  pre: string // {NRP}
  preDomain: string // card.e.189.cn
  pubKey: string
}>

export type AppConf = BaseResult<{
  paramId: string
  returnUrl: string
}>

export type ListGrow =
  & BaseError
  & BaseResp
  & {
    growList: { changeTime: number; changeValue: number; taskName: '每日签到送空间' | '天翼云盘50M空间' }[]
  }

export type AccessToken = BaseError & {
  /** 一个月 */
  expiresIn: number
  accessToken: string
}

export type UserBrief = BaseError & BaseResp & {
  sessionKey: string
}

export type PrizeMarket = BaseError & {
  prizeId: 'SIGNIN_CLOUD_50M'
  prizeName: '天翼云盘50M空间'
  prizeGrade: number
  prizeType: number
  description: string
  useDate: string
  userId: number
  isUsed: number
  activityId: 'ACT_SIGNIN'
  prizeStatus: number
  showPriority: number
}

export type UserSign = BaseError & {
  userSignId: string
  userId: number
  signTime: string
  netdiskBonus: number
  isSign: boolean
}
