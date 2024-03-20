import {
  type M,
  createApi,
  createGardenApi,
  getJwtToken,
  run as runCore,
  getOldConfig,
  createNewAuth,
} from '@asign/caiyun-core'
import {
  type LoggerPushData,
  createLogger,
  sleep,
  getLocalStorage,
  setLocalStorage,
  pushMessage,
} from '@asunajs/utils'
import { loadConfig, rewriteConfigSync } from '@asunajs/conf'
import { sendNotify } from '@asunajs/push'
import { type NormalizedOptions, createRequest } from '@catlair/node-got'
import { CookieJar } from 'tough-cookie'
import { getAuthInfo } from '@asign/utils-pure'

export type Config = {
  token?: string
  auth: string
}
export type Option = { pushData?: LoggerPushData[] }

export async function main(
  config: any,
  localStorage: M['localStorage'] = {},
  option?: Option,
) {
  const logger = await createLogger({ pushData: option?.pushData })
  if (config.phone.length !== 11 || !config.phone.startsWith('1')) {
    logger.info(`auth 格式解析错误，请查看是否填写正确的 auth`)
    return
  }

  const cookieJar = new CookieJar()
  const baseUA =
    'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.178 Mobile Safari/537.36'

  const DATA: M['DATA'] = {
    baseUA,
    mailUaEnd: '(139PE_WebView_Android_10.2.2_mcloud139)',
    mailRequested: 'cn.cj.pe',
    mcloudRequested: 'com.chinamobile.mcloud',
  }

  let jwtToken: string

  const http = createRequest({
    cookieJar,
    hooks: {
      beforeRequest: [
        (options: NormalizedOptions) => {
          if (options.url.hostname === 'caiyun.feixin.10086.cn') {
            jwtToken && (options.headers['jwttoken'] = jwtToken)
          } else {
            options.headers['authorization'] = config.auth
          }
          // @ts-ignore
          if (options.native) {
            // @ts-ignore
            options.requestOptions.isReturnNativeResponse = true
          }
        },
      ],
    },
    headers: {
      'user-agent': DATA.baseUA,
      'x-requested-with': DATA.mcloudRequested,
      charset: 'utf-8',
      'content-type': 'application/json;charset=UTF-8',
    },
  })

  const $: M = {
    api: createApi(http),
    config,
    gardenApi: createGardenApi(http),
    logger,
    DATA,
    sleep,
    store: {},
    localStorage,
  }

  logger.info(`==============`)
  logger.info(`登录账号【${config.phone}】`)
  jwtToken = await getJwtToken($)
  if (!jwtToken) return

  await runCore($)
  const newAuth = await createNewAuth($)
  logger.info(`==============\n\n`)
  return {
    newAuth,
    localStorage,
  }
}

/**
 * 本地运行
 * @param inputPath 配置文件地址
 */
export async function run(inputPath?: string) {
  const { config, path } = loadConfig<{
    caiyun: Config[]
    message?: Record<string, any>
  }>(inputPath)

  if (!config) {
    throw new Error('配置文件为空')
  }

  const logger = await createLogger()

  const caiyun = config.caiyun

  if (!caiyun || !caiyun.length) return logger.error('未找到配置文件/变量')

  const pushData: LoggerPushData[] = []
  const ls = getLocalStorage(path, 'caiyun')

  for (let index = 0; index < caiyun.length; index++) {
    const c = caiyun[index]
    getOldConfig(c)
    if (!c.auth) {
      logger.error('该配置中不存在 auth')
      continue
    }
    try {
      const authInfo = getAuthInfo(c.auth)
      const { newAuth, localStorage } = await main(
        {
          ...c,
          ...authInfo,
        },
        ls[authInfo.phone],
        { pushData },
      )
      if (newAuth) {
        rewriteConfigSync(path, ['caiyun', index, 'auth'], newAuth)
      }
      if (localStorage) {
        ls[authInfo.phone] = localStorage
      }
    } catch (error) {
      logger.error(error)
    }
  }

  setLocalStorage(path, 'caiyun', ls)

  await pushMessage({
    pushData,
    message: config.message,
    sendNotify,
    createRequest,
  })
}
