export * from '@asign/push-core'

import type { ApiOptions, Email } from '@asign/push-core'
import {
  customPost,
  pushplus,
  serverChan,
  tgBot,
  workWeixin,
  workWeixinBot,
} from '@asign/push-core'

export async function email(
  { logger }: { logger: ApiOptions['logger'] },
  email: Email,
  title: string,
  text: string,
) {
  try {
    if (!email || !email.pass || !email.from || !email.host) return

    //@ts-ignore
    const { createTransport } = await import('nodemailer')
    const port: number = Number(email.port) || 465
    const transporter = createTransport({
      host: email.host,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: email.from,
        pass: email.pass,
      },
    })

    const info = await transporter.sendMail({
      from: `${title} <${email.from}>`, // sender address
      to: email.to, // list of receivers
      subject: title, // Subject line
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
      text: text.replace(/\n/g, '\r\n'), // plain text body
      // html: text, // html body
    })

    logger.info(`邮件消息已发送: ${info.messageId}`)
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
  const cbs = {
    pushplus,
    serverChan,
    workWeixin,
    email,
    workWeixinBot,
    customPost,
    tgBot,
  }
  for (const [name, d] of Object.entries(data)) {
    const cb = cbs[name]
    if (!cb || !data) continue
    await setAgent(op, d)
    await cb(op, d, title, text)
  }
}

async function createAgent(proxy: string) {
  const { HttpsProxyAgent } = await import('hpagent')

  return {
    https: new HttpsProxyAgent({
      maxSockets: 256,
      scheduling: 'lifo',
      proxy,
    }),
  }
}

async function setAgent(option: ApiOptions, data: Record<string, any>) {
  if (typeof data.proxy !== 'string') {
    return
  }
  try {
    data.agent = await createAgent(data.proxy)
  } catch (error) {
    option.logger.error(error)
  }
}
