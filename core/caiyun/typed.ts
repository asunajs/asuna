import { generateMarkdown, generateTypescripts, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  auth: z.string().describe('cookie authorization 字段'),
  shake: z.object({
    enable: z.boolean().default(false).optional().describe('是否开启该功能'),
    num: z.number().default(15).optional().describe('摇一摇次数'),
    delay: z.number().default(2).optional().describe('每次间隔时间（秒）'),
  }).optional().describe('摇一摇配置'),
  garden: z.object({
    enable: z.boolean().default(false).optional().describe('是否开启该功能'),
    digest: z.string().length(32).optional().describe(
      '上传文件的 md5，必须为本账号已经上传过的文件的 md5。用于上传视频和图片任务',
    ),
  }).optional().describe('果园配置'),
}).describe('中国移动云盘配置')

const types = {
  caiyun: config,
}

export const markdown = generateMarkdown(config, 'caiyun')

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')
