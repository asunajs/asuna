import type { M } from '../types.js'
import { request } from '../utils/index.js'

export async function backupGiftTask($: M) {
  $.logger.start(`------【备份好礼】------`)
  try {
    const { state, curMonth } = await request($, $.api.getBackupGift, 'backupGiftTask')
    if (!curMonth) return
    switch (state) {
      case -1:
        $.logger.warn('未开启备份，请前往 APP 手动开启')
        return
      case 1:
        $.logger.success('本月已领取')
        return
      case 0:
        $.logger.info('领取备份奖励')
        const result = await request($, $.api.receiveBackupGift, 'backupGiftTask')
        if (typeof result === 'number') {
          $.logger.success('领取成功，获得云朵', result)
        }
        return
      default:
        $.logger.warn('未知状态', state)
    }
  } catch (error) {
    $.logger.error('备份好礼', error)
  }
}
