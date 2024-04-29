import { type ApiOptions, bark, type Email, pushplus, serverChan, workWeixin, workWeixinBot } from '@asign/push-core'
import { createLogger } from '@asign/utils-pure'

export { createCookieJar } from './cookie.js'
export { createRequest } from './http.js'
export * from './utils.js'

export function createSimpleRequest(headers: Record<string, string>) {
  return {
    get: (url: string) => HTTP.get(url, { headers }).json(),
    post: (url: string, data: any) =>
      HTTP.post(url, typeof data === 'string' ? data : JSON.stringify(data), {
        headers,
      }).json(),
  }
}

export function getPushConfig() {
  const usedRange = Application.Sheets.Item('推送').UsedRange
  if (!usedRange) {
    console.log('未开启推送')
    return {}
  }
  const cells = usedRange.Columns.Cells,
    columnEnd = Math.min(50, usedRange.ColumnEnd),
    rowEnd = Math.min(50, usedRange.RowEnd)

  const pushConfig: Record<string, any> = {}

  for (let option = usedRange.Column; option <= columnEnd; option++) {
    const t = {},
      item = cells.Item(option)
    if (!item.Text) continue

    pushConfig[item.Text] = t
    for (let kv = 1; kv <= rowEnd; kv++) {
      const key = item.Offset(kv).Text
      if (!key.trim()) continue
      t[key] = valueHandle(item.Offset(kv, 1).Text.trim())
    }
  }

  const base = pushConfig.base
  if (!base) return pushConfig
  delete pushConfig.base
  return { ...pushConfig, ...base }

  function valueHandle(value: string) {
    if (value === 'TRUE' || value === '是') return true
    if (value === 'FALSE' || value === '否') return false
    return value
  }
}

async function email(
  { logger }: { logger: any },
  email: Email,
  title: string,
  text: string,
) {
  try {
    if (!email || !email.pass || !email.from || !email.host) return

    const port = email.port || 465,
      toUser = email.to || email.from

    const mailer = SMTP.login({
      host: email.host, // 域名
      port: port, // 端口
      secure: port === 465, // TLS
      username: email.from, // 账户名
      password: email.pass, // 密码
    })

    mailer.send({
      from: `${title} <${email.from}>`,
      to: toUser,
      subject: title,
      text: text.replace(/\n/g, '\r\n'),
      // html: `<p> this is html </p>`,
    })

    logger.info(`邮件消息已发送`)
  } catch (error) {
    logger.error(`邮件消息发送失败`, error)
  }
}

export async function sendNotify(
  op: ApiOptions,
  data: Record<string, any>,
  title: string,
  text: string,
) {
  const cbs = { pushplus, serverChan, workWeixin, email, workWeixinBot, bark }
  for (const [name, d] of Object.entries(data)) {
    try {
      const cb = cbs[name]
      if (!cb) continue
      cb(op, d, title, text)
    } catch (error) {
      op.logger.error('未知异常', error)
    }
  }
}

export function sendWpsNotify(pushData: any[], pushConfig: any) {
  if (pushData.length && pushConfig) {
    if (
      !(pushConfig.onlyError && !pushData.some((el) => el.type === 'error'))
    ) {
      const msg = pushData
        .map((m) => `[${m.type} ${m.date.toLocaleTimeString()}]${m.msg}`)
        .join('\n')
      msg
        && sendNotify(
          {
            logger: createLogger(),
            http: {
              fetch: (op: any) => {
                op.data
                  && typeof op.data !== 'string'
                  && (op.body = JSON.stringify(op.data))
                return HTTP.fetch(op.url, op).json()
              },
            },
          },
          pushConfig,
          pushConfig.title || 'asign 运行推送',
          msg,
        )
    }
  }
}

export function _hash(algorithm: string, input: string | Buffer) {
  const hash = Crypto.createHash(algorithm).update(input)
  return hash.digest('hex')
}

export function sha256(input: string | Buffer) {
  return _hash('sha256', input)
}

export function md5(input: string | Buffer) {
  return _hash('md5', input)
}
