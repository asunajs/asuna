export type JSValue = string | number | bigint | boolean | symbol | Function | Array<any> | undefined | object | null
export type JSType = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'function' | 'object' | 'any' | 'array'
export interface Schema {
  id?: string
  type: JSType
  default?: JSValue
  $schema?: string
  properties?: {
    [key: string]: Schema
  }
  required?: string[]
  title?: string
  description?: string
  additionalProperties?: boolean
}

interface MarkdownOptions {
  ignoreTitle?: boolean
}

export function generateMarkdown(schema: Schema, options?: MarkdownOptions) {
  return _generateMarkdown(schema, '', '##', options).join('\n')
}

export function _generateMarkdown(
  schema: Schema,
  title: string,
  level: string,
  { ignoreTitle = false } = {},
) {
  const lines: string[] = []
  const typeTitle = {
    string: '字符串',
    number: '数字',
    bigint: '大整数',
    boolean: '布尔值',
    symbol: '符号',
    function: '函数',
    object: '对象',
    any: '任意',
    array: '数组',
  }

  ignoreTitle || lines.push(`${level} ${title || schema.description}`)

  if (schema.type === 'object') {
    for (const key in schema.properties) {
      const val = schema.properties[key] as Schema
      lines.push('', ..._generateMarkdown(val, `\`${key}\``, level + '#'))
    }
    return lines
  }

  // Type and default
  lines.push(
    `- **类型**: \`${typeTitle[schema.type] || schema.type}\``,
  )
  if ('default' in schema) {
    lines.push(`- **默认值**: \`${JSON.stringify(schema.default)}\``)
  }
  lines.push('')

  // Title
  if (schema.title) {
    lines.push('> ' + schema.title, '')
  }

  // Description
  if (schema.description) {
    lines.push('', schema.description, '')
  }

  return lines
}
