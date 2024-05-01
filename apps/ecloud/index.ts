import { createApi, type M, run as runCore } from '@asign/ecloud-core'
import { loadConfig } from '@asunajs/conf'
import { createRequest } from '@asunajs/http'
import { sendNotify } from '@asunajs/push'
import { createLogger, type LoggerPushData, md5, pushMessage, sleep } from '@asunajs/utils'
import { constants, publicEncrypt } from 'crypto'

export type Option = { pushData?: LoggerPushData[] }

function rsaEncrypt(publicKey: string, text: string) {
  return publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(text, 'utf8'),
  ).toString('hex')
}

export async function main(config: M['config'], option?: Option) {
  const logger = await createLogger({ pushData: option?.pushData })

  const $: M = {
    api: createApi(
      createRequest({
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/123.0',
          'Referer': 'https://open.e.189.cn/',
          'accept': 'application/json',
        },
      }),
    ),
    logger,
    sleep,
    rsaEncrypt: (publicKey: string, username: string, password: string) => ({
      username: rsaEncrypt(publicKey, username),
      password: rsaEncrypt(publicKey, password),
    }),
    config,
    md5,
  }

  $.logger.start('-------------')

  await runCore($)
}

/**
 * 本地运行
 * @param inputPath 配置文件地址
 */
export async function run(inputPath?: string) {
  const { config } = loadConfig<{
    ecloud: M['config'][]
    message?: Record<string, any>
  }>(inputPath)

  const logger = await createLogger()

  const ecloud = config.ecloud

  if (!ecloud || !ecloud.length) {
    return logger.error('未找到配置文件/变量')
  }

  const pushData = []

  for (let index = 0; index < ecloud.length; index++) {
    const c = ecloud[index]
    // if (!c.password && !c.cookie) continue
    if (!c.password) continue
    try {
      await main(c, { pushData })
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
