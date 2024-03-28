import type { M } from './types.js'

export * from './api.js'
export * from './types.js'

export async function getInfo($: M) {
  try {
    const { data, code, status, message } = await $.api.getInfo()
    if (code !== 0) {
      $.logger.fail(`获取用户信息失败`, code, status, message)
      return
    }
    return data.cap_sign
  } catch (error) {
    $.logger.error(`获取用户信息异常`, error)
  }
}

export async function signIn($: M) {
  try {
    const { data, code, status, message } = await $.api.sign()
    if (code !== 0) {
      $.logger.fail(`签到失败`, code, status, message)
      return
    }
    return data.sign_daily_reward
  } catch (error) {
    $.logger.error(`签到异常`, error)
  }
}

export async function run($: M) {
  try {
    const info = await getInfo($)
    if (!info) {
      $.logger.fatal('登录失败')
      return
    }
    const { sign_progress, sign_rewards, sign_target, sign_daily } = info
    if (sign_daily) {
      $.logger.success(
        `今日已签到${sign_rewards[sign_progress - 1].name}，连签进度${sign_progress}/${sign_target}。`,
      )
      return
    }
    const dailyReward = await signIn($)
    if (dailyReward) {
      $.logger.success(
        `签到成功，获得${dailyReward / 1048576}M，连签进度${sign_progress + 1}/${sign_target}。`,
      )
    }
  } catch (error) {
    $.logger.error('运行异常', error)
  }
}
