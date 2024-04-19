import type { M } from '../types.js'
import { request } from '../utils/index.js'

export async function msgPushOnTask($: M) {
  $.logger.start(`------【消息推送奖励】------`)
  try {
    const { onDuaration, pushOn, secondTaskStatus, firstTaskStatus } = await request(
      $,
      $.api.getMsgPushOn,
      '获取消息通知状态',
    )

    if (pushOn === 0) {
      $.logger.error('消息通知已关闭，请前往 APP 手动打开')
      return
    }

    if (firstTaskStatus !== 3) {
      $.logger.info('首次奖励未领取，请前往 APP 手动完成')
    }

    if (secondTaskStatus === 2) {
      $.logger.info('领取奖励')
      await request($, $.api.obtainMsgPushOn, '领取消息通知奖励')
      return
    }

    $.logger.info('已经开启', onDuaration, '天')
  } catch (error) {
    $.logger.error('消息推送奖励', error)
  }
}
