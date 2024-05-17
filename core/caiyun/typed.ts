import { generateMarkdown, generateTypescripts, getDefulat, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  auth: z.string().describe('cookie authorization 字段'),
  shake: z.object({
    enable: z.boolean().default(true).optional().describe('是否开启该功能'),
    num: z.number().default(15).optional().describe('摇一摇次数'),
    delay: z.number().default(2).optional().describe('每次间隔时间（秒）'),
  }).optional().describe('摇一摇配置'),
  garden: z.object({
    enable: z.boolean().default(true).optional().describe(
      '是否开启该功能，需要注意的是果园需要自己去 APP 手动激活一下，否则等待你的全是报错',
    ),
    digest: z.string().length(32).optional().describe(
      '上传文件的 md5，必须为本账号已经上传过的文件的 md5。用于上传视频和图片任务',
    ).default('202CB962AC59075B964B07152D234B70'),
    inviteCodes: z.array(z.string()).optional().describe('邀请码'),
  }).optional().describe('果园配置'),
  aiRedPack: z.object({
    enable: z.boolean().default(true).optional().describe('是否开启该功能'),
  }).optional().describe('AI 红包'),
  backupWaitTime: z.number().default(20).optional().describe('备份等待时间（秒）'),
}).describe('中国移动云盘配置')

const types = {
  caiyun: config,
}

export const markdown = generateMarkdown(config, 'caiyun')

export const defuConfig = getDefulat(config)

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')

writeFileSync('./options.ts', `export const defuConfig = ${JSON.stringify(defuConfig, null, 2)}`, 'utf-8')
