import type { Http } from '@asign/types'
import { marketUrl } from '../constant/index.js'
import type { BaseType } from '../types.js'

type BackupGift = BaseType<{
  nextMonth: 200
  curMonth: 200 | 400
  /**
   *  1 已领取
   *
   *  0 未领取
   *
   * -1 未开启备份
   */
  state: 0 | 1 | -1
}>

export function createBackupGiftApi(http: Http) {
  return {
    getBackupGift() {
      return http.get<BackupGift>(`${marketUrl}/backupgift/info`)
    },
    receiveBackupGift() {
      return http.get<BaseType<200>>(`${marketUrl}/backupgift/receive`)
    },
  }
}
