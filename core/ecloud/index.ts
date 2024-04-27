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

    $.logger.info(`签到成功，获得`, netdiskBonus, 'MB')
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

  const { pre, pubKey } = await getEncryptConf($)

  const publicKey = `-----BEGIN PUBLIC KEY-----\n${pubKey}\n-----END PUBLIC KEY-----`

  const { result, toUrl, msg } = await $.api.loginSubmit({
    usernameEncrypt: $.rsaEncrypt(publicKey, $.config.username),
    passwordEncrypt: $.rsaEncrypt(publicKey, $.config.password),
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
    // await $.sleep(6000)
    // await drawPrizeMarket($, 'TASK_2022_FLDFS_KJ')
  } catch (error) {
    $.logger.error(`抽奖任务异常`, error)
  }
}

export async function run($: M) {
  // 检测 https://cloud.189.cn/api/portal/listGrow.action?noCache=0.5555609671834492
  try {
    await login($)
    await $.sleep(2000)
    await signIn($)
    await $.sleep(5000)
    await drawPrizeTask($)
  } catch (error) {
    $.logger.error('运行异常', error)
  }
}
