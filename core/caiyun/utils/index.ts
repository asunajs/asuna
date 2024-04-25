import type { M } from '../types.js'

type RequestOptions = {
  name: string
  isArray?: boolean
}

export async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']>
export async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  options: RequestOptions,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']>
export async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  options: string | RequestOptions,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
  const name = typeof options === 'string' ? options : options.name
  try {
    const { code, message, msg, result } = await api(...args)
    if (code !== 0) {
      $.logger.fatal(`${name}失败`, code, message || msg)
    } else {
      return result
    }
  } catch (error) {
    $.logger.error(`${name}异常`, error)
  }
  return typeof options === 'object' ? options.isArray === false ? {} : [] : {}
}
