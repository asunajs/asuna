import {
  type M,
  createApi,
  createGardenApi,
  getJwtToken,
  run as runCore,
  getOldConfig,
  getTokenExpireTime,
  isNeedRefresh,
  refreshToken,
  createNewAuth,
} from '@asign/caiyun-core'
import { type LoggerPushData, createLogger, sleep } from '@asunajs/utils'
import { loadConfig, rewriteConfigSync } from '@asunajs/conf'
import { sendNotify } from '@asunajs/push'
import { type NormalizedOptions, createRequest } from '@catlair/node-got'
import { CookieJar } from 'tough-cookie'

export type Config = {
  token?: string
  auth: string
}
export type Option = { pushData?: LoggerPushData[] }

function getAuthInfo(basicToken: string) {
  basicToken = basicToken.replace('Basic ', '')

  const rawToken = Buffer.from(basicToken, 'base64').toString('utf-8')
  const [platform, phone, authToken] = rawToken.split(':')

  return {
    phone,
    authToken,
    basicToken,
    platform,
  }
}

export async function main(config: any, option?: Option) {
  const logger = await createLogger({ pushData: option?.pushData })
  const { phone, authToken, basicToken, platform } = getAuthInfo(config.auth)

  if (phone.length !== 11 || !phone.startsWith('1')) {
    logger.info(`auth 格式解析错误，请查看是否填写正确的 auth`)
    return
  }

  config.phone = phone
  config.auth = `Basic ${basicToken}`
  config.token = authToken
  config.platform = platform

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
  }

  logger.info(`==============`)
  logger.info(`登录账号【${config.phone}】`)
  jwtToken = await getJwtToken($)
  if (!jwtToken) return

  await runCore($)
  const newAuth = await createNewAuth($)
  logger.info(`==============\n\n`)
  return newAuth
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

  for (let index = 0; index < caiyun.length; index++) {
    const c = caiyun[index]
    getOldConfig(c)
    if (!c.auth) {
      logger.error('该配置中不存在 auth')
      continue
    }
    try {
      const newAuth = await main(c, { pushData })
      if (newAuth) {
        rewriteConfigSync(path, ['caiyun', index, 'auth'], newAuth)
      }
    } catch (error) {
      logger.error(error)
    }
  }

  if (pushData.length && config.message) {
    const message = config.message
    if (message.onlyError && !pushData.some((el) => el.type === 'error')) {
      return
    }
    const msg = pushData
      .map((m) => `[${m.type} ${m.date.toLocaleTimeString()}]${m.msg}`)
      .join('\n')
    msg &&
      (await sendNotify(
        {
          logger: await createLogger(),
          http: { fetch: (op: any) => createRequest().request(op) },
        },
        message,
        message.title || 'asign 运行推送',
        msg,
      ))
  }
}
