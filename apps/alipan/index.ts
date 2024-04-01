import { Config, createApi, type M, refreshToken, run as runCore } from '@asign/alipan-core'
import { randomHex } from '@asign/utils-pure'
import { loadConfig, rewriteConfigSync } from '@asunajs/conf'
import { sendNotify } from '@asunajs/push'
import { createLogger, type LoggerPushData, pushMessage, sleep } from '@asunajs/utils'
import { createRequest, type NormalizedOptions } from '@catlair/node-got'
import { getSignature } from './utils.js'

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

export type Option = { pushData?: LoggerPushData[] }

export async function main(config: Config, option?: Option) {
  const token = config.token
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
                'authorization': accessToken ? `Bearer ${accessToken}` : '',
                'x-signature': getXSignature(DATA, userId),
                ...options.headers,
              }
            },
          ],
        },
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'referer': 'https://alipan.com/',
          'origin': 'https://alipan.com/',
          'x-canary': 'client=Android,app=adrive,version=v5.3.0',
          'user-agent':
            'AliApp(AYSD/5.3.0) com.alicloud.databox/34760760 Channel/36176727979800@rimet_android_5.3.0 language/zh-CN /Android Mobile/Mi 6X',
        },
      }),
    ),
    logger: logger,
    DATA: DATA,
    sleep: sleep,
    config,
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
export async function run(inputPath?: string) {
  const { config, path } = loadConfig<{
    alipan: Config[]
    message?: Record<string, any>
  }>(inputPath)

  const logger = await createLogger()

  const alipan = config.alipan

  if (!alipan || !alipan.length || !alipan[0].token) return logger.error('未找到配置文件/变量')

  const pushData = []

  for (let index = 0; index < alipan.length; index++) {
    const c = alipan[index]
    if (!c.token) continue
    try {
      const token = await main(c, { pushData })
      if (token) {
        rewriteConfigSync(path, ['alipan', index, 'token'], token)
      }
    } catch (error) {
      logger.error(error)
    }
  }

  await pushMessage({
    pushData,
    message: config.message,
    sendNotify,
    createRequest,
  })
}
