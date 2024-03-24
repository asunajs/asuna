import { generateMarkdowns, generateTypescripts, z } from '@asign/typed'
import { writeFileSync } from 'node:fs'

export const email = z.strictObject({
  pass: z.string().describe('邮箱密码/授权码'),
  from: z.string().email().describe('发件人邮箱'),
  port: z.number().default(465).optional().describe('端口'),
  host: z.string().describe('邮箱服务器'),
  to: z.string().email().optional().describe('收件人邮箱，默认发件人'),
}).describe('邮箱配置')

export const customPost = z.object({
  method: z.enum(['POST', 'GET', 'PUT', 'PATCH', 'DELETE']).optional().describe('请求方法').default('POST'),
  url: z.string().describe('请求地址'),
  headers: z.record(z.string()).describe('请求头').optional(),
  body: z.record(z.string()).describe('请求体').optional(),
  timeout: z.number().optional().describe('超时时间'),
}).describe('自定义配置')

export const workWeixin = z.object({
  msgtype: z.enum(['text', 'markdown', 'textcard', 'mpnews']).optional().describe('消息类型').default('text'),
  touser: z.string().optional().describe('接收人').default('@all'),
  agentid: z.number().optional(),
  corpsecret: z.string().optional(),
  corpid: z.string().optional(),
}).passthrough().describe('企业微信 App 配置')

export const workWeixinBot = z.object({
  url: z.string().describe('机器人 webhook'),
  msgtype: z.enum(['text', 'markdown']).optional().describe('消息类型').default('text'),
}).passthrough().describe('企业微信机器人配置')

export const bark = z.object({
  key: z.string(),
  level: z.enum(['passive', 'timeSensitive', 'active']).optional().default('passive').describe('消息等级'),
}).passthrough().describe('Bark 配置')

export const twoIm = z.object({
  key: z.string(),
  sid: z.string(),
  query: z.object({
    plat: z.string().optional(),
    group: z.string().optional(),
    icon: z.union([z.string(), z.number()]).optional().describe('推送 icon，详见其文档'),
  }),
  msgtype: z.enum(['text', 'markdown']).optional().default('text').describe('消息类型'),
}).passthrough().describe('回逍配置')

export const serverChan = z.object({
  token: z.string(),
}).passthrough().describe('ServerChan 配置')

export const tgBot = z.object({
  apiHost: z.string().optional().default('api.telegram.org').describe(
    'api 地址，默认官方地址，如果你有镜像 api 可以在此配置',
  ),
  token: z.string(),
  chat_id: z.string().or(z.number()),
  disable_web_page_preview: z.boolean().optional().default(true),
  proxy: z.string().url().optional().describe(
    '代理地址，例如 `http://127.0.0.1:10809` ，当然也可以使用验证，如 `http://catlair:passwd@127.0.0.1:10809`',
  ),
  agent: z.any().optional(),
}).passthrough().describe('Telegram 配置')

export const pushplus = z.object({
  token: z.string(),
}).passthrough().describe('PushPlus 配置')

const types = {
  email,
  customPost,
  workWeixin,
  workWeixinBot,
  bark,
  twoIm,
  serverChan,
  tgBot,
  pushplus,
}

export const push = z.object(types)

export const markdown = generateMarkdowns(types)

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')
