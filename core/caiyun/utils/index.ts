import type { M } from '../types.js'

export async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
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
  return {}
}
