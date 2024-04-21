import { generateMarkdown, generateTypescripts, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  token: z.string().describe('refresh_token'),
  skipUpload: z.boolean().describe('是否跳过需要上传文件的任务').optional(),
}).describe('阿里云盘配置')

const types = {
  alipan: config,
}

export const markdown = generateMarkdown(config, 'alipan')

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')
