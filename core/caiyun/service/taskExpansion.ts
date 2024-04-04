import type { M } from '../types.js'
import { request } from '../utils/index.js'

export async function taskExpansionTask($: M) {
  const { curMonthBackup, curMonthTaskRecordCount, acceptDate, nextMonthTaskRecordCount } = await request(
    $,
    $.api.getTaskExpansion,
    '获取备份额外奖励',
  )
  curMonthBackup === false && $.logger.warn('本月未开启备份，将无法获取翻倍奖励！！！需要手动开启')
  if (curMonthTaskRecordCount > 0) {
    const { cloudCount } = await request($, $.api.receiveTaskExpansion, '领取翻倍奖励', acceptDate)
    cloudCount && $.logger.success(`领取到${cloudCount}个云朵`)
  }
  nextMonthTaskRecordCount && $.logger.debug(`下月可领取${nextMonthTaskRecordCount}个云朵`)
}
