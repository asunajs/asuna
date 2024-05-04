import { createApi, type M, run } from '@asign/ecloud-core'
import { createLogger } from '@asign/utils-pure'
import { createRequest, getPushConfig, md5, sendWpsNotify } from '@asign/wps-utils'

function main(config: M['config'], option?: { pushData: any }) {
  if (!config) return
  const logger = createLogger({ pushData: option && option.pushData })

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
    logger: logger as any,
    sleep: Time.sleep,
    md5,
    config,
  }

  $.logger.start(`--------------`)

  run($)
}

// 获取当前工作表的使用范围
const sheet = Application.Sheets.Item('天翼云盘') || Application.Sheets.Item('ecloud') || ActiveSheet
const usedRange = sheet.UsedRange
const columnA = sheet.Columns('A')
const len = usedRange.Row + usedRange.Rows.Count - 1
const pushData = []

for (let i = 1; i <= len; i++) {
  const cell = columnA.Rows(i)
  if (cell.Text) {
    console.log(`执行第 ${i} 行`)
    main({
      username: cell.Text,
      password: cell.Offset(0, 1).Text,
    }, { pushData })
  }
}

sendWpsNotify(pushData, getPushConfig())
