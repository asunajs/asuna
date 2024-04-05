export interface Garden<T = any> {
  msg: null | string
  result: null | T
  success: boolean
}

interface BaseResult {
  msg: string
  code: number
}

export type SignInfo = Garden<{
  todayCheckin: number
  yestodayTimes: number
}>

/**
 * 1 签到成功
 * -1 今日已签到
 */
export type SignIn = Garden<BaseResult>

export type InitTree = Garden<{
  collectWater: number
  growing: number
  nickName: string
  provCode: number
  treeLevel: number
  treeWater: number
  uid: number
  upgradeAward: number
  userIcon: string
  userMobile: string
}>

/**
 * 1 领取成功
 * -1 -2 请勿重复领取
 */
export type CartoonResult = Garden<BaseResult>

/**
 * 1 参与任务成功
 * -1 已参与过该任务
 */
export type TaskResult = Garden<{
  summary: string
  jumpurl: null | string
  code: number
}>

/**
 * 0 未完成
 * 1 领取成功
 */
export type GivenTask = Garden<BaseResult & { water: number }>

export type TaskList = Garden<
  {
    clientType: string
    jumpUrl: string
    taskIcon: string
    taskId: number
    taskIntro: string
    taskName: string
    /**
     * 0 未完成
     * 1 已完成未领取
     * 2 已领取奖励
     */
    taskState: 0 | 1 | 2
    taskType: string
    uid: number
    waterNum: number
  }[]
>

export type Cartoons = Garden<Array<CartoonType>>

export type CartoonType = 'color' | 'cloud' | 'widget' | 'mail'
