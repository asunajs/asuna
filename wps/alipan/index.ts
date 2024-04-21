import { createApi, M, refreshToken, run } from '@asign/alipan-core'
import { createLogger } from '@asign/utils-pure'
import { createRequest, getPushConfig, sendWpsNotify } from '@asign/wps-utils'

function getXSignature() {
  return '1176d75ed29c9453de0c9848e47be166e56d5cd57dd6743f71ced1f048e73d847c2847c71f8b5235105456d34054a9b30c8e364e5fee4e4cfa644cc07a45a92a01'
}

async function main(index, ASIGN_ALIPAN_TOKEN, option?) {
  if (!ASIGN_ALIPAN_TOKEN) return
  const logger = createLogger({ pushData: option && option.pushData })
  const DATA = {
    deviceId: ActiveSheet.Columns('C').Rows(index).Value,
    afterTask: [],
    refreshToken: '',
  }

  let accessToken: string

  function getHeaders() {
    return {
      'content-type': 'application/json;charset=UTF-8',
      'referer': 'https://alipan.com/',
      'origin': 'https://alipan.com/',
      'x-canary': 'client=Android,app=adrive,version=v5.3.0',
      'user-agent':
        'AliApp(AYSD/5.3.0) com.alicloud.databox/34760760 Channel/36176727979800@rimet_android_5.3.0 language/zh-CN /Android Mobile/Mi 6X',
      'x-device-id': DATA.deviceId,
      'authorization': accessToken ? `Bearer ${accessToken}` : '',
      'x-signature': getXSignature(),
    }
  }

  const $: M = {
    api: createApi(createRequest({ getHeaders })),
    logger: logger as any,
    DATA: DATA,
    config: {
      token: ASIGN_ALIPAN_TOKEN.trim(),
    },
    sleep: Time.sleep,
  }

  const rtData = await refreshToken($, $.config.token)
  if (!rtData) return
  DATA.refreshToken = rtData.refresh_token
  accessToken = rtData.access_token
  DATA.deviceId = rtData.device_id
  $.logger.info(`--------------`)
  $.logger.info(`你好${rtData.nick_name || rtData.user_name}`)

  ActiveSheet.Columns('A').Rows(index).Value = rtData.refresh_token
  ActiveSheet.Columns('B').Rows(index).Value = rtData.nick_name || rtData.user_name

  run($)

  ActiveSheet.Columns('C').Rows(index).Value = DATA.deviceId
}

// 获取当前工作表的使用范围
const sheet = Application.Sheets.Item('阿里云盘') || Application.Sheets.Item('alipan') || ActiveSheet
const usedRange = sheet.UsedRange
const columnA = sheet.Columns('A')
const len = usedRange.Row + usedRange.Rows.Count - 1
const pushData = []

for (let i = 1; i <= len; i++) {
  const cell = columnA.Rows(i)
  if (cell.Text) {
    console.log(`执行第 ${i} 行`)
    main(i, cell.Text, { pushData })
  }
}

sendWpsNotify(pushData, getPushConfig())
