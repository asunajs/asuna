import { asyncForEach } from '@asign/utils-pure'
import { getSsoTokenApi } from '.'
import { TaskList } from './GardenType'
import type { CartoonType, ClientTypeHeaders } from './api'
import type { M } from './types'

async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
  try {
    const { success, msg, result } = await api(...args)
    if (!success) {
      $.logger.error(`${name}失败`, msg)
    } else {
      return result
    }
  } catch (error) {
    $.logger.error(`${name}异常`, error)
  }
  return {}
}

async function loginGarden($: M, token: string, phone: string) {
  try {
    await $.gardenApi.login(token, phone)
  } catch (error) {
    $.logger.error(`登录果园失败`, error)
  }
}

async function getTodaySign($: M) {
  const { todayCheckin } = await request(
    $,
    $.gardenApi.checkinInfo,
    '获取果园签到信息',
  )
  return todayCheckin
}

async function initTree($: M) {
  const { collectWater, treeLevel, nickName } = await request(
    $,
    $.gardenApi.initTree,
    '初始化果园',
  )
  $.logger.info(`${nickName}拥有${treeLevel}级果树，当前水滴${collectWater}`)
}

async function signInGarden($: M) {
  const todaySign = await getTodaySign($)
  if (todaySign === undefined) return
  if (todaySign) return $.logger.info(`今日果园已签到`)
  try {
    const { code, msg } = await request($, $.gardenApi.checkin, '果园签到')
    if (code !== 1) {
      $.logger.error('果园签到失败', code, msg)
    }
  } catch (error) {
    $.logger.error(`果园签到异常`, error)
  }
}

async function clickCartoon($: M, cartoonTypes: CartoonType[]) {
  if (cartoonTypes.length === 0) {
    cartoonTypes.push('cloud', 'color', 'widget', 'mail')
  }

  await asyncForEach(
    cartoonTypes,
    async (cartoonType) => {
      const { msg, code } = await request(
        $,
        $.gardenApi.clickCartoon,
        '领取场景水滴',
        cartoonType,
      )
      if (![1, -1, -2].includes(code)) {
        $.logger.error(`领取场景水滴${cartoonType}失败`, code, msg)
      } else {
        $.logger.debug(`领取场景水滴${cartoonType}`)
      }
    },
    async () => await $.sleep(5000),
  )
}

async function getTaskList($: M, headers?: ClientTypeHeaders) {
  const list = await request(
    $,
    $.gardenApi.getTaskList,
    '获取任务列表',
    headers,
  )
  return Array.isArray(list) ? list : []
}

async function getTaskStateList($: M, headers?: ClientTypeHeaders) {
  const list = await request(
    $,
    $.gardenApi.getTaskStateList,
    '获取任务完成情况表',
    headers,
  )
  return Array.isArray(list) ? list : []
}

async function doTask(
  $: M,
  tasks: TaskList['result'],
  headers?: ClientTypeHeaders,
) {
  const taskList = [] as { taskId: number; taskName: string }[]

  await asyncForEach(
    tasks,
    async ({ taskId, taskName }) => {
      const { code, summary } = await request(
        $,
        $.gardenApi.doTask,
        `接收${taskName}任务`,
        taskId,
        headers,
      )
      if (code !== 1) $.logger.error(`领取${taskName}失败`, summary)
      else taskList.push({ taskId, taskName })
    },
    async () => await $.sleep(6000),
  )

  return taskList
}

async function doTaskByHeaders($: M, headers: ClientTypeHeaders) {
  try {
    const taskList = await getTaskList($, headers)
    await $.sleep(1000)
    const stateList = await getTaskStateList($, headers)
    if (stateList.length === 0) {
      return await _run(taskList, [])
    }
    const _givenList = stateList
      .filter((sl) => sl.taskState === 1)
      .map((el) => taskList.find((tl) => tl.taskId === el.taskId))
    const _taskList = stateList
      .filter((sl) => sl.taskState === 0)
      .map((el) => taskList.find((tl) => tl.taskId === el.taskId))

    return await _run(_taskList, _givenList)

    async function _run(
      _taskList: TaskList['result'],
      _givenList: GivenWaterList[],
    ) {
      await $.sleep(5000)
      const givenList = await doTask($, _taskList, headers)
      await $.sleep(4000)
      givenList.push(..._givenList)
      await givenWater($, givenList, headers)
    }
  } catch (error) {
    $.logger.error('任务异常', error)
  }
}

type GivenWaterList = { taskId: number; taskName: string }

async function givenWater(
  $: M,
  tasks: GivenWaterList[],
  headers?: ClientTypeHeaders,
) {
  await asyncForEach(
    tasks,
    async ({ taskName, taskId }) => {
      const { water, msg } = await request(
        $,
        $.gardenApi.givenWater,
        `领取${taskName}水滴`,
        taskId,
        headers,
      )
      if (water === 0) $.logger.error(`领取${taskName}奖励失败`, msg)
      else $.logger.debug(`领取${taskName}奖励`)
    },
    async () => await $.sleep(6000),
  )
}

export async function gardenTask($: M) {
  try {
    $.logger.info(`------【果园】------`)
    const token = await getSsoTokenApi($, $.config.phone)
    if (!token) return $.logger.error(`跳过果园任务`)
    await loginGarden($, token, $.config.phone)

    await initTree($)

    await signInGarden($)

    await $.sleep(2000)
    $.logger.info('领取场景水滴')
    await clickCartoon($, [])

    $.logger.info('完成邮箱任务')
    await doTaskByHeaders($, {
      'user-agent': $.DATA.baseUA + $.DATA.mailUaEnd,
      'x-requested-with': $.DATA.mailRequested,
    })
    await $.sleep(2000)

    $.logger.info('完成云盘任务')
    await doTaskByHeaders($, {
      'user-agent': $.DATA.baseUA,
      'x-requested-with': $.DATA.mcloudRequested,
    })
  } catch (error) {
    $.logger.error('果园任务异常', error)
  }
}
