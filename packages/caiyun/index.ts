import {
  type M,
  createApi,
  createGardenApi,
  refreshToken,
  run as runCore,
} from '@asign/caiyun-core'
import { type LoggerPushData, createLogger, sleep } from '@asunajs/utils'
import { loadConfig } from '@asunajs/conf'
import { sendNotify } from '@asunajs/push'
import { type NormalizedOptions, createRequest } from '@catlair/node-got'
import { CookieJar } from 'tough-cookie'

export type Config = {
  token: string
}
export type Option = { pushData?: LoggerPushData[] }

function getAuthInfo(basicToken: string) {
  basicToken = basicToken.replace('Basic ', '')

  const rawToken = Buffer.from(basicToken, 'base64').toString('utf-8')
  const [_, phone, authToken] = rawToken.split(':')

  return {
    phone,
    authToken,
    basicToken,
  }
}

export async function main(config: any, option?: Option) {
  const { phone, authToken, basicToken } = getAuthInfo(config.token)

  config.phone = phone
  config.auth = authToken
  config.token = `Basic ${basicToken}`

  const cookieJar = new CookieJar()
  const logger = await createLogger({ pushData: option?.pushData })
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
            options.headers['authorization'] = config.token
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
  jwtToken = await refreshToken($, config.phone)
  if (!jwtToken) return
  await runCore($)
  logger.info(`==============\n\n`)
}

/**
 * 本地运行
 * @param path 配置文件地址
 */
export async function run(path: string) {
  const { config } = loadConfig<{
    caiyun: Config[]
    message?: Record<string, any>
  }>(path)

  if (!config) {
    throw new Error('配置文件为空')
  }

  const caiyun = config.caiyun

  if (!caiyun || !caiyun.length || !caiyun[0].token)
    return console.error('未找到配置文件/变量')

  const pushData: LoggerPushData[] = []

  for (const c of caiyun) {
    if (!c.token) continue
    try {
      await main(c, { pushData })
    } catch (error) {
      console.error(error)
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
