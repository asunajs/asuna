import { randomHex } from '@asign/utils-pure'
import type { M } from '../types.js'
import { request } from '../utils/index.js'
import { getBackParentCatalogID, uploadFile } from './index.js'

export async function taskExpansionTask($: M) {
  return _taskExpansion($, 1)
}

async function backFile($: M) {
  try {
    const buffer = randomHex(32)
    const digest = $.md5(buffer)
    const success = await uploadFile($, getBackParentCatalogID(), { manualRename: 5, digest }, buffer)
    if (success) {
      $.logger.debug(`文件备份成功`)
    } else {
      $.logger.debug(`文件备份失败`)
    }
    return success
  } catch (error) {
    $.logger.error(`文件备份异常`, error)
  }
}

async function _taskExpansion($: M, timer = 1) {
  const { curMonthBackup, curMonthTaskRecordCount, acceptDate, nextMonthTaskRecordCount } = await request(
    $,
    $.api.getTaskExpansion,
    '获取备份额外奖励',
  )
  if (curMonthBackup === false) {
    if (timer > 0) {
      await backFile($)
      $.logger.debug(`等待一段时间后重试`)
      await $.sleep($.config.backupWaitTime * 1000)
      return _taskExpansion($, --timer)
    } else {
      $.logger.warn('本月未开启备份，将无法获取翻倍奖励！！！需要手动开启')
      $.store.curMonthBackup = false
    }
  }
  if (curMonthTaskRecordCount > 0) {
    const { cloudCount } = await request($, $.api.receiveTaskExpansion, '领取翻倍奖励', acceptDate)
    cloudCount && $.logger.success(`领取到${cloudCount}个云朵`)
  }
  nextMonthTaskRecordCount && $.logger.debug(`下月可领取${nextMonthTaskRecordCount}个云朵`)
}
