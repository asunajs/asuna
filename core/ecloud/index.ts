import { getInToday, getXmlElement, isPlainObject, sortStringify } from '@asign/utils-pure'
import { Appkey } from './constant.js'
import type { M } from './types.js'

export * from './api.js'
export * from './types.js'

export async function signIn($: M) {
  try {
    const { isSign, netdiskBonus } = await $.api.userSign()
    if (!netdiskBonus) {
      $.logger.fatal(`签到失败，请手动签到`)
      return
    }

    if (isSign) {
      $.logger.info(`今日已签到，获得`, netdiskBonus, 'MB')
      return
    }

    $.logger.success(`签到成功，获得`, netdiskBonus, 'MB')
  } catch (error) {
    $.logger.error(`签到异常`, error)
  }
}

export async function drawPrizeMarket($: M, taskId: Parameters<M['api']['drawPrizeMarket']>[number]) {
  try {
    const data = await $.api.drawPrizeMarket(taskId)
    const { errorCode, prizeName, errorMsg } = data
    if (errorCode) {
      if (errorCode === 'User_Not_Chance') {
        return $.logger.info(`${taskId}无抽奖次数`)
      }
      return $.logger.fail(`抽奖失败`, errorCode, errorMsg)
    }
    if (prizeName) {
      return $.logger.info(`抽奖成功，获得`, prizeName)
    }
    $.logger.fail(`抽奖失败`, JSON.stringify(data))
  } catch (error) {
    $.logger.error(`抽奖异常`, error)
  }
}

async function getEncryptConf($: M) {
  try {
    const encryptConf = await $.api.encryptConf()
    if (encryptConf.data.pubKey) {
      return encryptConf.data
    }
  } catch (error) {
    $.logger.debug(`获取加密配置异常`, error)
  }
  return {
    pubKey:
      'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCZLyV4gHNDUGJMZoOcYauxmNEsKrc0TlLeBEVVIIQNzG4WqjimceOj5R9ETwDeeSN3yejAKLGHgx83lyy2wBjvnbfm/nLObyWwQD/09CmpZdxoFYCH6rdDjRpwZOZ2nXSZpgkZXoOBkfNXNxnN74aXtho2dqBynTw3NFTWyQl8BQIDAQAB',
    pre: '{NRP}',
  }
}

export async function login($: M) {
  const { lt, reqId } = await $.api.loginRedirect()

  $.api.http
    .setHeader('Lt', lt)
    .setHeader('reqId', reqId)

  const appConfig = await $.api.appConf()

  let username = $.config.username
  let password = $.config.password
  let pre: string | undefined

  if ($.rsaEncrypt) {
    const encryptCon = await getEncryptConf($)
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${encryptCon.pubKey}\n-----END PUBLIC KEY-----`
    ;({ username, password } = $.rsaEncrypt(publicKey, $.config.username, $.config.password))
    pre = encryptCon.pre
  }

  const { result, toUrl, msg } = await $.api.loginSubmit({
    username,
    password,
    paramId: appConfig.data.paramId,
    returnUrl: appConfig.data.returnUrl,
    pre,
  })

  if (result !== 0) {
    $.logger.error(`登录失败`, result, msg)
    throw new Error(msg)
  }

  await $.api.loginCallback(toUrl)
}

async function drawPrizeTask($: M) {
  $.logger.debug(`开始执行抽奖任务`)
  try {
    await drawPrizeMarket($, 'TASK_SIGNIN')
    await $.sleep(6000)
    await drawPrizeMarket($, 'TASK_SIGNIN_PHOTOS')
    // 这个接口看似能够成功，实际上并不增加空间
    await $.sleep(6000)
    await drawPrizeMarket($, 'TASK_2022_FLDFS_KJ')
  } catch (error) {
    $.logger.error(`抽奖任务异常`, error)
  }
}

async function getSessionKey($: M) {
  try {
    const { res_code, res_message, sessionKey } = await $.api.getUserBriefInfo()
    if (res_code === 0) {
      return sessionKey
    }
    $.logger.error(`获取 sessionKey 失败`, res_code, res_message)
  } catch (error) {
    $.logger.error(`获取 sessionKey 异常`, error)
  }
}

async function getAccessToken($: M, sessionKey: string) {
  try {
    const data = await $.api.getAccessTokenBySsKey(sessionKey, {
      Appkey,
      ...getSignature($.md5, {
        Appkey,
        sessionKey,
      }),
    })
    if (data.errorCode) {
      $.logger.error(`获取 accessToken 失败`, data.errorCode, data.errorMsg)
      return
    }
    return data
  } catch (error) {
    $.logger.error(`获取 sessionKey 异常`, error)
  }
}

async function getFamilyId($: M, AccessToken: string) {
  try {
    const xml = await $.api.getFamilyList({
      ...getSignature($.md5, {
        AccessToken,
      }),
    })
    if (isPlainObject(xml)) {
      $.logger.fail(`获取家庭出错`, JSON.stringify(xml))
      return
    }
    return getXmlElement(xml, 'familyId')
  } catch (error) {
    $.logger.error(`获取家庭信息异常`, error)
  }
}

async function signInFamily($: M, AccessToken: string) {
  if (!AccessToken) {
    return $.logger.fail(`请提供 AccessToken`)
  }
  try {
    const familyId = await getFamilyId($, AccessToken)

    if (!familyId) return $.logger.fail(`签到失败`)

    const xml = await $.api.familySign(familyId, {
      ...getSignature($.md5, {
        AccessToken,
        familyId,
      }),
    })
    if (isPlainObject(xml)) {
      $.logger.fail(`签到异常`, JSON.stringify(xml))
      return
    }
    const bonusSpace = getXmlElement(xml, 'bonusSpace')
    $.logger.success(`签到成功，获得${bonusSpace}M家庭空间`)
  } catch (error) {
    $.logger.error(`家庭签到异常`, error)
  }
}

/**
 * @param $
 * @param times 重试次数，只能为 1
 * @returns 是否完成
 */
async function getTaskProgress($: M, times: number) {
  const returnWarp = (sign = 0, draw = false) => ({ sign, draw })
  try {
    const data = await $.api.getListGrow()
    if (data.errorCode) {
      // // 重试
      // if (data.errorCode === 'InvalidSessionKey' && $.config.username && times > 0) {
      //   await login($)
      //   return await getTaskProgress($, 0)
      // }
      $.logger.fail(`获取空间记录失败`, data.errorCode, data.errorMsg)
      return returnWarp()
      // return
    }
    // 过滤出今天的记录
    const todayList = data.growList.filter(item =>
      getInToday(item.changeTime) && (item.taskName === '每日签到送空间' || item.taskName === '天翼云盘50M空间')
    )

    // 什么都没有
    if (todayList.length === 0) return returnWarp()

    const todaySign = todayList.find(item => item.taskName === '每日签到送空间')

    // 有三个及以上记录，说明已经完成
    if (todaySign) {
      if (todayList.length >= 3) {
        return returnWarp(todaySign.changeValue, true)
      }
      return returnWarp(todaySign.changeValue, false)
    }

    if (todayList.length >= 2) {
      return returnWarp(0, true)
    }
  } catch (error) {
    $.logger.error(`获取空间记录异常`, error)
  }
  return returnWarp()
}

async function appLogin($: M) {
  try {
    const sessionKey = await getSessionKey($)
    if (!sessionKey) return

    const data = await getAccessToken($, sessionKey)
    if (!data) return

    return data.accessToken
  } catch (error) {
    $.logger.error(`appLogin 异常`, error)
  }
}

// function checkSkipLogin({ api, config }: M) {
//   const http = api.http

//   if (config.cookie) {
//     http.initCookie(config.cookie, CLOUD_URL)
//   }

//   // 如果存在 cookie，则直接返回
//   if (http && http.getCookie) {
//     const cookie = http.getCookie(CLOUD_URL) || ''
//     if (cookie.includes('LOGIN_USER')) return true
//   }

//   if (!config.password || !config.username) {
//     throw new Error(`请提供账号密码`)
//   }
// }

async function init($: M) {
  // if (!checkSkipLogin($)) {
  //   await login($)
  // }
  await login($)

  $.store = {
    AccessToken: await appLogin($),
  }

  return await getTaskProgress($, 1)

  // if (!data) {
  //   throw Error(`登录失败`)
  // }
}

export async function run($: M) {
  $.logger.info('开始签到', $.config.username)
  try {
    const { draw, sign } = await init($)
    if (!sign) {
      await $.sleep(2000)
      await signIn($)
    } else {
      $.logger.info(`今日已签到，获得${sign}M空间`)
    }

    if (!draw) {
      await $.sleep(5000)
      await drawPrizeTask($)
    } else {
      $.logger.info(`今日已无抽奖次数`)
    }

    await $.sleep(5000)
    await signInFamily($, $.store && $.store.AccessToken)
  } catch (error) {
    $.logger.error('运行异常', error)
  }
}

export function getSignature(md5: M['md5'], data: Record<string, string | number | boolean>) {
  const Timestamp = String(Date.now())

  const d: { AccessToken?: string } = {}
  if (data.AccessToken) d.AccessToken = data.AccessToken as string
  return {
    'signature': md5(sortStringify({
      Timestamp,
      ...data,
    })),
    Timestamp,
    'Sign-Type': '1',
    ...d,
  }
}
