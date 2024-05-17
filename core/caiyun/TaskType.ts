interface ItemBaseType {
  id: number
  marketname: 'sign_in_3' | 'newsign_139mail'
  groupid: 'day' | 'month' | 'new' | 'time' | 'hiddenabc' | 'hidden' | 'beiyong1'
  enable: number
  name: string
  description: string
  rule?: string
  icon: string
  steps: any[]
  starttime: string
  endtime: string
  sort: number
  limitType: LimitType
  prov: string
  whiteList: number
  hasNda: number
  hasBak: number
  stepTypeSet: string[]
  state: StateType
  currstep: number
  process: number
  lastupdate: number
  recordid: number
  show?: {
    minCloudTaskUa: string
  }
}

type ResultItem<T> = ({
  button: T & { [key: string]: any }
  buttonProperty: T
} & ItemBaseType)[]

export interface TaskList {
  msg: string
  result: {
    new: ResultItem<{
      app: {
        popBtn?: string
        itemBg: string
        link: string
        action: string
        btnBg: string
        text: string
      }
      out: {
        itemBg: string
        btnBg: string
        text: string
      }
      appcard: Appcard
    }>
    month: ResultItem<{
      app: App2
      mini?: App2
      out: TextPrue
      appcard: Appcard
    }>
    hidden: ResultItem<{ app: TextPrue }>
    hiddenabc: ResultItem<{
      app: TextPrue
      out: TextPrue
    }>
    time: ResultItem<{
      app: {
        descColor?: string
        textBtnColor?: string
        itemBg?: string
        link: string
        icon?: string
        action: string
        text: string
      }
      mini?: {
        descColor: string
        textBtnColor: string
        itemBg: string
        link: string
        icon: string
        action: string
        text: string
      }
      appcard?: Appcard
      out?: {
        link?: string
        action?: string
        text: string
      }
    }>
    day: ResultItem<{
      app: {
        popBtn?: string
        link?: string
        action?: string
        text: string
      }
      out: TextPrue
      appcard: Appcard
      mini?: TextPrue
    }>
    beiyong1: ResultItem<{
      app: {
        link: string
        action: string
        text: string
      }
      out: TextPrue
      appcard: Appcard
    }>
  }
  code: number
  groupState: {
    new: GroupState
    month: GroupState
    hidden: GroupState
    hiddenabc: GroupState
    time: GroupState
    day: GroupState
    beiyong1: GroupState
  }
}

export interface GroupState {
  taskFinishState: number
}

export interface TextPrue {
  text: string
}

export interface App2 {
  link?: string
  action: string
  text: string
  popBtn?: string
}

export interface Appcard {
  link: string
  text: string
}

type LimitType = 'DAY' | 'MONTH' | 'EVER'

type StateType = 'FINISH' | 'WAIT'
