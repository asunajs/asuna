import { createApi, type M, run } from '@asign/quark-core'
import { createLogger } from '@asign/utils-pure'
import { createSimpleRequest, getPushConfig, sendWpsNotify } from '@asign/wps-utils'

function main(cookie: string, option?: { pushData: any }) {
  if (!cookie) return
  const logger = createLogger({ pushData: option && option.pushData })

  const $: M = {
    api: createApi(createSimpleRequest({
      'content-type': 'application/json',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
      cookie,
    })),
    logger: logger as any,
    sleep: Time.sleep,
  }

  $.logger.start(`--------------`)

  run($)
}

// 获取当前工作表的使用范围
const sheet = Application.Sheets.Item('夸克网盘') || Application.Sheets.Item('quark') || ActiveSheet
const usedRange = sheet.UsedRange
const columnA = sheet.Columns('A')
const len = usedRange.Row + usedRange.Rows.Count - 1
const pushData = []

for (let i = 1; i <= len; i++) {
  const cell = columnA.Rows(i)
  if (cell.Text) {
    console.log(`执行第 ${i} 行`)
    main(cell.Text, { pushData })
  }
}

sendWpsNotify(pushData, getPushConfig())
