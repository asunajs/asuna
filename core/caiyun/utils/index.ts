import type { ItemBaseType } from '../TaskType.js'
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
      return
    }
    return result
  } catch (error) {
    $.logger.error(`${name}异常`, error)
  }
  return typeof options === 'object' ? options.isArray === false ? {} : [] : {}
}

export function getMarketName(marketId: ItemBaseType['marketname']) {
  const obj = {
    newsign_139mail: '139 邮箱',
    sign_in_3: '移动云盘',
  }

  return obj[marketId] || '未知应用'
}

export function getGroupName(groupId: ItemBaseType['groupid']) {
  const obj = {
    day: '每日任务',
    month: '每月任务',
    new: '新用户任务',
    time: '热门任务',
    hiddenabc: '隐藏任务',
    hidden: '隐藏任务',
    beiyong1: '临时任务',
  }
  return obj[groupId] || '未知任务'
}
