import {
  type ApiOptions,
  type Email,
  pushplus,
  serverChan,
  workWeixin,
  workWeixinBot,
} from '@asign/push-core'
import { createLogger } from '@asign/utils-pure'

function getCookieJSON(cookie: string) {
  if (!cookie) return {}
  const matchArray = cookie.match(/([^;=]+)(?:=([^;]*))?/g)
  if (!matchArray) return {}
  const returns = {}
  for (const match of matchArray) {
    const [key, value] = match.trim().split('=')
    returns[key] = value
  }
  return returns
}

function getCookieString(obj: { [x: string]: any }) {
  let string = ''
  for (const key in obj) {
    string += `${key}=${obj[key]}; `
  }
  return string.substring(0, string.length - 2 || 0)
}

function getSetCookieValue(setCookieArray) {
  let cookieStr = ''
  for (const item of setCookieArray) {
    if (!item) continue
    cookieStr += item.split('; ')[0] + '; '
  }
  return ''
}

function getCookie(cookie = '', setCookie) {
  if (!Array.isArray(setCookie)) setCookie = [setCookie]
  if (!setCookie || setCookie.length === 0) return cookie

  return getCookieString({
    ...getCookieJSON(cookie),
    ...getCookieJSON(getSetCookieValue(setCookie)),
  })
}

export function createCookieJar(cookie = '') {
  let _cookie

  _cookie = cookie

  return {
    getCookieString() {
      return _cookie
    },
    setCookie(rawCookie) {
      _cookie = getCookie(_cookie, rawCookie)
      return _cookie
    },
    toJSON() {
      return getCookieJSON(_cookie)
    },
  }
}

export function createRequest({
  cookieJar,
  getHeaders,
}: {
  cookieJar?: any
  getHeaders: any
}) {
  const get = (url: string, options: any) => {
    const resp = HTTP.get(url, {
      headers: {
        ...getHeaders(url),
        ...(options && options.headers),
      },
    })

    cookieJar && cookieJar.setCookie(resp.headers['set-cookie'])
    if (!options) return resp.json()
    return options.native ? resp : resp[options.responseType || 'json']?.()
  }
  const post = (url: string, data: any, options: any) => {
    const resp = HTTP.post(url, JSON.stringify(data), {
      headers: {
        ...getHeaders(url),
        ...(options && options.headers),
      },
    })
    cookieJar && cookieJar.setCookie(resp.headers['set-cookie'])
    if (!options) return resp.json()
    return options.native ? resp : resp[options.responseType || 'json']?.()
  }

  return {
    get,
    post,
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
  const cbs = { pushplus, serverChan, workWeixin, email, workWeixinBot }
  for (const [name, d] of Object.entries(data)) {
    const cb = cbs[name]
    if (!cb) continue
    cb(op, d, title, text)
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
      msg &&
        sendNotify(
          {
            logger: createLogger(),
            http: {
              fetch: (op: any) => {
                op.data &&
                  typeof op.data !== 'string' &&
                  (op.body = JSON.stringify(op.data))
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
