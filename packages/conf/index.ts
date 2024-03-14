export * from './js.js'
export * from './object.js'
export * from './yaml.js'

import { existsSync, readFileSync } from 'fs'
import { dirname, extname, join } from 'path'
import { parseJavaScript } from './js.js'
import { parseObject } from './object.js'
import { parseYAML } from './yaml.js'
import { fileURLToPath } from 'url'

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
      return parseJavaScript<{ default: T }>(path)?.default
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
