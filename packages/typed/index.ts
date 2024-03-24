export * from 'zod'
import { generateMock } from '@anatine/zod-mock'
import defaults from 'json-schema-defaults'
import { compile } from 'json-schema-to-typescript'
import { pascalCase } from 'scule'
import { type ZodType } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
export { zodToJsonSchema } from 'zod-to-json-schema'
import { createFromBuffer } from '@dprint/formatter'
import { getPath } from '@dprint/markdown'
import { readFileSync } from 'node:fs'
import { generateMarkdown as _gMarkdown, type Schema } from './json2md.js'

export function generateSchemas(schemas: Record<string, ZodType<any>>) {
  return Object.fromEntries(
    Object.entries(schemas).map(([key, schema]) => {
      return [key, zodToJsonSchema(schema)]
    }),
  )
}

export function generateMarkdowns(zods: Record<string, ZodType<any>>) {
  const schemas = generateSchemas(zods) as Record<string, Schema>
  const markdowns = Object.entries(schemas).map(([key, schema]) =>
    _gMarkdown(schema)
    + `### 示例\n\n\`\`\`json\n${JSON.stringify({ [key]: generateMock(zods[key]) }, null, 2)}\n\`\`\``
    + '\n\n'
    + `### 默认值\n\n\`\`\`json\n${JSON.stringify({ [key]: defaults(schema) }, null, 2)}\n\`\`\``
  ).join('\n\n')

  return createFromBuffer(readFileSync(getPath())).formatText('demo.md', markdowns)
}

export function generateMarkdown(zod: ZodType<any>, key: string) {
  const schema = zodToJsonSchema(zod) as Schema
  return createFromBuffer(readFileSync(getPath())).formatText(
    'demo.md',
    _gMarkdown(schema, { ignoreTitle: true })
      + '\n\n' + `### 示例\n\n\`\`\`json\n${JSON.stringify({ [key]: [generateMock(zod)] }, null, 2)}\n\`\`\``
      + '\n\n'
      + `### 默认值\n\n\`\`\`json\n${JSON.stringify(defaults(schema), null, 2)}\n\`\`\``,
  )
}

export async function generateTypescripts(schemas: Record<string, ZodType<any>>) {
  return (await Promise.all(
    Object.entries(generateSchemas(schemas))
      .map(([key, schema]) =>
        compile(schema as any, pascalCase(key), {
          bannerComment: '',
        })
      ),
  ))
    .join('\n\n')
}
