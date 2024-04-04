import type { Http } from '@asign/types'
import type { BaseType } from '../types.js'

type ReceiveTaskExpansion = BaseType<{
  cloudCount: number
}>

type TaskExpansion = BaseType<{
  curMonthBackup: boolean
  preMonthBackup: boolean
  curMonthTaskRecordCount: number
  curMonthBackupTaskAccept: boolean
  nextMonthTaskRecordCount: number
  acceptDate: string
}>

export function createSignInApi(http: Http) {
  const caiyunUrl = 'https://caiyun.feixin.10086.cn/market/signin/'

  return {
    getTaskExpansion() {
      return http.get<TaskExpansion>(`${caiyunUrl}page/taskExpansion`)
    },
    receiveTaskExpansion(acceptDate: string) {
      return http.get<ReceiveTaskExpansion>(
        `${caiyunUrl}page/receiveTaskExpansion?acceptDate=${acceptDate}`,
      )
    },
  }
}
