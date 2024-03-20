export * from './js.js'
export * from './object.js'
export * from './yaml.js'

import { setIn } from '@asunajs/utils'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { dirname, extname, join } from 'path'
import { fileURLToPath } from 'url'
import { parseJavaScript, setInJavaScript } from './js.js'
import { parseObject, setInObject } from './object.js'
import { parseYAML, setInYAML } from './yaml.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * 获取配置文件路径
 * 配置文件可能有以下几种地方：
 * 1. cwd()
 * 2. __dirname
 * 3. cwd() -> ./config
 * 4. __dirname -> ./config
 * 配置文件可能文件名
 * asign.yaml asign.yml
 * asign.json asign.json5
 * asign.config.{js,ts,cjs,cts,mjs,mts}
 * @returns 找到第一个存在的路径
 */

export function getConfigPath() {
  const cwd = process.cwd()
  const files = [
    'asign.json',
    'asign.json5',
    'asign.config.js',
    'asign.config.ts',
    'asign.config.mjs',
    'asign.config.mts',
    'asign.config.cjs',
    'asign.config.cts',
    'asign.yaml',
    'asign.yml',
  ]
  const dirs = [cwd, `${cwd}/config`, __dirname, `${__dirname}/config`]

  for (const dir of dirs) {
    for (const file of files) {
      if (existsSync(join(dir, file))) return `${dir}/${file}`
    }
  }
}

export function parseConfig<T = any>(path: string): T {
  switch (extname(path)) {
    case '.json':
    case '.json5':
      return parseObject(readFileSync(path, 'utf8'))
    case '.js':
    case '.ts':
    case '.mjs':
    case '.mts':
    case '.cjs':
    case '.cts':
      const config = parseJavaScript(path)
      return config?.default || config
    case '.yaml':
    case '.yml':
      return parseYAML(readFileSync(path, 'utf8'))
    default:
      return
  }
}

export function loadConfig<T = any>(
  path?: string,
): {
  path: string
  config: T
} {
  if (path && !existsSync(path)) {
    throw new Error('找不到配置文件')
  }
  const configPath = path || getConfigPath()
  if (!configPath) {
    throw new Error('找不到配置文件')
  }
  const config = parseConfig(configPath)

  return {
    path: configPath,
    config,
  }
}

export function setInConfig(filepath: string, path: any[], value: any): string {
  const code = readFileSync(filepath, 'utf8')
  switch (extname(filepath)) {
    case '.json': {
      const json = parseObject(code)
      setIn(json, path, value)
      return JSON.stringify(json, null, 2)
    }
    case '.json5':
      return setInObject(code, path, value)
    case '.js':
    case '.ts':
    case '.mjs':
    case '.mts':
    case '.cjs':
    case '.cts':
      return setInJavaScript(code, path, value)
    case '.yaml':
    case '.yml':
      return setInYAML(code, path, value)
    default:
      return
  }
}

export function rewriteConfigSync(filepath: string, path: any[], value: any) {
  const code = setInConfig(filepath, path, value)
  if (code) {
    writeFileSync(filepath, code)
  }
}
