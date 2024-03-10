import { writeFileSync } from 'fs'
import {
  type M,
  createApi,
  refreshToken,
  run as runCore,
} from '@asign/alipan-core'
import { type LoggerPushData, createLogger, sleep } from '@asign/utils'
import { randomHex } from '@asign/utils-pure'
import { sendNotify } from '@asunajs/push'
import { type NormalizedOptions, createRequest } from '@catlair/node-got'
import { getSignature } from './utils'

function getXSignature(DATA: M['DATA'], userId: string) {
  if (DATA['x-signature']) {
    return DATA['x-signature']
  }
  const t = DATA.deviceId
    ? getSignature(0, userId, DATA.deviceId).signature
    : ''
  DATA['x-signature'] = t
  return t || randomHex(128) + '01' // 随机生成有一定概率无效
}

export type Config = { token: string }
export type Option = { pushData?: LoggerPushData[] }

export async function main({ token }: Config, option?: Option) {
  if (!token) return
  const logger = await createLogger({ pushData: option?.pushData })
  const DATA = {
    deviceId: '',
    afterTask: [],
  } as M['DATA']

  let accessToken: string, userId: string

  const $: M = {
    api: createApi(
      createRequest({
        hooks: {
          beforeRequest: [
            (options: NormalizedOptions) => {
              options.headers = {
                'x-device-id': DATA.deviceId,
                authorization: accessToken ? `Bearer ${accessToken}` : '',
                'x-signature': getXSignature(DATA, userId),
                ...options.headers,
              }
            },
          ],
        },
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          referer: 'https://alipan.com/',
          origin: 'https://alipan.com/',
          'x-canary': 'client=Android,app=adrive,version=v5.3.0',
          'user-agent':
            'AliApp(AYSD/5.3.0) com.alicloud.databox/34760760 Channel/36176727979800@rimet_android_5.3.0 language/zh-CN /Android Mobile/Mi 6X',
        },
      }),
    ),
    logger: logger,
    DATA: DATA,
    sleep: sleep,
  }

  const rtData = await refreshToken($, token.trim())
  if (!rtData) return
  DATA.refreshToken = rtData.refresh_token
  accessToken = rtData.access_token
  userId = rtData.user_id
  DATA.deviceId = rtData.device_id
  $.logger.info('-------------')
  $.logger.info(`你好${rtData.nick_name || rtData.user_name}`)

  await runCore($)

  return rtData.refresh_token
}

/**
 * 本地运行
 * @param path 配置文件地址
 */
export async function run(path = './asign.json') {
  let _config: {
    alipan: Config[]
    message?: Record<string, any>
  }
  let isConfigFile = false
  try {
    _config = require(path)
    isConfigFile = true
  } catch {
    const { ASIGN_ALIPAN_TOKEN } = process.env
    if (!ASIGN_ALIPAN_TOKEN) return
    _config = {
      alipan: ASIGN_ALIPAN_TOKEN.split('@').map((token) => ({ token })),
    }
  }

  const config = _config.alipan

  if (!config || !config.length || !config[0].token)
    return console.error('未找到配置文件/变量')

  const pushData = []

  for (const c of config) {
    if (!c.token) continue
    try {
      c.token = await main(c, { pushData })
    } catch (error) {
      console.error(error)
    }
  }

  if (pushData.length && _config.message) {
    if (
      _config.message.onlyError &&
      !pushData.some((el) => el.type === 'error')
    ) {
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
        _config.message,
        'asign 运行推送',
        msg,
      ))
  }

  isConfigFile &&
    writeFileSync(
      path,
      JSON.stringify(Object.assign(_config, { alipan: config }), null, 2),
    )
}
