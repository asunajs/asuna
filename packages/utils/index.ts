import crypto from 'crypto'
import fs, { existsSync, readFileSync, writeFileSync } from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

export { set as setIn } from 'lodash-es'

export function sleep(time: number) {
  return new Promise<number>((res) => setTimeout(() => res(time), time))
}

export interface LoggerPushData {
  level: number
  type: string
  msg: string
  date: Date
}

export async function createLogger(options?: { pushData: LoggerPushData[] }) {
  const { createConsola, consola } = await import('consola')
  consola.options.level = 5
  return createConsola({
    level: 5,
    reporters: [
      {
        log: ({ type, args, level, date }) => {
          if (options && options.pushData) {
            const msg = args
              .reduce<string>((str, cur) => `${str} ${cur}`, '')
              .substring(1)
            options.pushData.push({ msg, type, level, date })
          }
          consola[type].apply(consola, args)
        },
      },
    ],
  })
}

export function sha256(input: string) {
  const hash = crypto.createHash('sha256').update(input)
  return hash.digest('hex')
}

/**
 * 读取 JSON 文件
 */
export function readJsonFile(path: string) {
  if (!fs.existsSync(path)) {
    throw new Error(`文件 ${path} 不存在`)
  }
  return new Function(`return ${fs.readFileSync(path, 'utf-8')}`)()
}

/**
 * @description 传入 demo.json 自动增加 demo.json5
 */
export function getConfig(name: string) {
  const resolveCwd = (str: string) => path.resolve(process.cwd(), str)
  const resolveDir = (str: string) => path.resolve(dirname(fileURLToPath(import.meta.url)), str)
  const configPath = Array.from(
    new Set<string>([
      resolveCwd(name + '5'),
      resolveDir(name + '5'),
      resolveCwd(name),
      resolveDir(name),
    ]),
  ).find((path) => fs.existsSync(path))
  return configPath ? readJsonFile(configPath) : undefined
}

export function isObject(value: any) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

export type LoggerType = Awaited<ReturnType<typeof createLogger>>

function _getLocalStorage(path: string) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf-8')) : {}
}

export function getLocalStorage(configPath: string, item: string) {
  // 获取 configPath 的 dir ，接上 "asign.ls.json"
  try {
    return (
      _getLocalStorage(path.resolve(dirname(configPath), 'asign.ls.json'))[
        item
      ] || {}
    )
  } catch {}
  return {}
}

export function setLocalStorage(
  configPath: string,
  item: string,
  value: Record<string, any>,
) {
  try {
    const lsPath = path.resolve(dirname(configPath), 'asign.ls.json')
    const ls = _getLocalStorage(lsPath)

    ls[item] = value

    writeFileSync(lsPath, JSON.stringify(ls))
  } catch (e) {
    console.error(e)
  }
}

export async function pushMessage({
  pushData,
  message,
  sendNotify,
  createRequest,
}: {
  pushData: LoggerPushData[]
  message: Record<string, any>
  sendNotify: any
  createRequest: any
}) {
  if (pushData.length && message) {
    if (message.onlyError && !pushData.some((el) => el.type === 'error')) {
      return
    }
    const msg = pushData
      .filter((el) => el.level < 4)
      .map((m) => `[${m.type} ${m.date.toLocaleTimeString()}]${m.msg}`)
      .join('\n')
    msg
      && (await sendNotify(
        {
          logger: await createLogger(),
          http: { fetch: (op: any) => createRequest().request(op) },
        },
        message,
        message.title || 'asign 运行推送',
        msg,
      ))
  }
}
