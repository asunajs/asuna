import { createApi, type M, run as runCore } from '@asign/quark-core'
import { loadConfig } from '@asunajs/conf'
import { sendNotify } from '@asunajs/push'
import { createLogger, type LoggerPushData, pushMessage, sleep } from '@asunajs/utils'
import { createRequest } from '@catlair/node-got'

export type Config = { cookie: string }
export type Option = { pushData?: LoggerPushData[] }

export async function main({ cookie }: Config, option?: Option) {
  if (!cookie) return
  const logger = await createLogger({ pushData: option?.pushData })

  const $: M = {
    api: createApi(
      createRequest({
        headers: {
          'content-type': 'application/json',
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
          cookie,
        },
      }),
    ),
    logger,
    sleep,
  }

  $.logger.start('-------------')

  await runCore($)
}

/**
 * 本地运行
 * @param path 配置文件地址
 */
export async function run(inputPath?: string) {
  const { config, path } = loadConfig<{
    quark: Config[]
    message?: Record<string, any>
  }>(inputPath)

  const logger = await createLogger()

  const quark = config.quark

  if (!quark || !quark.length || !quark[0].cookie) return logger.error('未找到配置文件/变量')

  const pushData = []

  for (let index = 0; index < quark.length; index++) {
    const c = quark[index]
    if (!c.cookie) continue
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
