import type { Http } from '@asign/types'
import { marketUrl } from '../constant/index.js'
import type { BaseType } from '../types.js'

type MsgPushStatus = BaseType<{
  /* 是否开启消息推送 */
  pushOn: 1 | 0
  firstTaskStatus: 1 | 2 | 3
  secondTaskStatus: 1 | 2 | 3
  onDuaration: number
  total: 31
}>

type MsgPushObtain = BaseType<{
  obtainCode: number
  description: string
}>

export function createMsgPushApi(http: Http) {
  return {
    getMsgPushOn() {
      return http.get<MsgPushStatus>(`${marketUrl}/msgPushOn/task/status`)
    },
    obtainMsgPushOn() {
      return http.post<MsgPushObtain>(`${marketUrl}/msgPushOn/task/obtain`, {
        type: 2,
      })
    },
  }
}
