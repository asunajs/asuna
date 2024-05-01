import type { LoggerType } from '@asign/types'
import type { ApiType } from './api.js'

export interface M {
  api: ApiType
  logger: LoggerType
  sleep: (time: number) => Promise<number>
}

export interface BaseResult<T = unknown> {
  status: number
  code: number
  message: string
  timestamp: number
  data: T
  metadata?: {}
  req_id?: string
}

export type Info = BaseResult<{
  'member_type': string
  'use_capacity': number
  'cap_growth': {
    lost_total_cap: number
    cur_total_cap: number
    cur_total_sign_day: number
  }
  '88VIP': boolean
  'member_status': {
    SUPER_VIP: string
    Z_VIP: string
    VIP: string
    MINI_VIP: string
  }
  'cap_sign': {
    sign_daily: boolean
    sign_target: number
    sign_daily_reward: number
    sign_progress: number
    sign_rewards: {
      name: string
      reward_cap: number
      highlight?: string
    }[]
  }
  'cap_composition': {
    other: number
    member_own: number
    sign_reward: number
  }
  'total_capacity': number
}>

export type SignResult = BaseResult<{
  sign_daily_reward: number
}>
