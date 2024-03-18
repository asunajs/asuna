import {
  M,
  createApi,
  createGardenApi,
  getJwtToken,
  createNewAuth,
  run,
} from '@asign/caiyun-core'
import type { Untyped } from '@asign/caiyun-core'
import { createLogger, getAuthInfo, getHostname } from '@asign/utils-pure'
import {
  createCookieJar,
  createRequest,
  getPushConfig,
  sendWpsNotify,
} from '@asign/wps-utils'

type Config = Partial<Untyped> & {
  auth: string
  token?: string
  phone?: string
  platform?: string
}

export async function main(index, config: Config, option?) {
  config = {
    ...config,
    ...getAuthInfo(config.auth),
  }

  if (config.phone.length !== 11 || !config.phone.startsWith('1')) {
    console.info(`auth 格式解析错误，请查看是否填写正确的 auth`)
    return
  }

  const cookieJar = createCookieJar()
  const logger = createLogger({ pushData: option && option.pushData })
  const baseUA =
    'Mozilla/5.0 (Linux; Android 13; 22041216C Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/121.0.6167.178 Mobile Safari/537.36'

  const DATA: M['DATA'] = {
    baseUA,
    mailUaEnd: '(139PE_WebView_Android_10.2.2_mcloud139)',
    mailRequested: 'cn.cj.pe',
    mcloudRequested: 'com.chinamobile.mcloud',
  }

  logger.info(`--------------`)
  logger.info(`你好：${config.phone}`)

  let jwtToken: string

  const headers = {
    'user-agent': DATA.baseUA,
    'x-requested-with': DATA.mcloudRequested,
    charset: 'utf-8',
    'content-type': 'application/json;charset=UTF-8',
    accept: 'application/json',
  }

  function getHeaders(url) {
    if (getHostname(url) === 'caiyun.feixin.10086.cn') {
      if (jwtToken)
        return {
          ...headers,
          cookie: cookieJar.getCookieString(),
          jwttoken: jwtToken,
        }
    }
    return {
      ...headers,
      authorization: config.auth,
    }
  }

  const http = createRequest({ cookieJar, getHeaders })

  const $: M = {
    api: createApi(http),
    logger: logger as any,
    DATA,
    sleep: Time.sleep,
    config: config as any,
    gardenApi: createGardenApi(http),
    store: {},
  }

  jwtToken = await getJwtToken($)
  if (!jwtToken) return

  await run($)

  // return await createNewAuth($)
}

const columnA = ActiveSheet.Columns('A')
// 获取当前工作表的使用范围
const usedRange = ActiveSheet.UsedRange
const len = usedRange.Row + usedRange.Rows.Count - 1,
  BColumn = ActiveSheet.Columns('B')
const pushData = []

for (let i = 1; i <= len; i++) {
  const cell = columnA.Rows(i)
  if (cell.Text) {
    console.log(`执行第 ${i} 行`)
    runMain(i, cell)
    console.log(`第 ${i} 行执行结束`)
  }
}

sendWpsNotify(pushData, getPushConfig())

function runMain(i: number, cell: { Text: string }) {
  try {
    const newAuth = main(
      i,
      {
        auth: cell.Text.length === 11 ? BColumn.Rows(i).Text : cell.Text,
      },
      {
        pushData,
      },
    )
    if (newAuth) {
      console.log(`更新 auth 成功`)
      BColumn.Rows(i).Value = newAuth
    }
  } catch (error) {
    console.log(error.message)
  }
}
