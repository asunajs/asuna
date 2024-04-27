import { generateMarkdown, generateTypescripts, z } from '@asign/typed'
import { writeFileSync } from 'fs'

export const config = z.object({
  username: z.string().describe('手机号'),
  password: z.string().describe('密码'),
}).describe('天翼云盘配置')

const types = {
  ecloud: config,
}

export const markdown = generateMarkdown(config, 'ecloud')

writeFileSync('./options.d.ts', await generateTypescripts(types), 'utf-8')

writeFileSync('./options.md', markdown, 'utf-8')
