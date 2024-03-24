import { asyncForEach } from '@asign/utils-pure'
import type { ClientTypeHeaders } from './api.js'
import type { CartoonType, TaskList } from './GardenType.js'
import { getSsoTokenApi } from './index.js'
import { getParentCatalogID, uploadFileRequest } from './service.js'
import type { M } from './types.js'

async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  options: {
    name: string
    defu: Awaited<ReturnType<T>>['result']
  },
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']>
async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']>
async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  options: string | {
    name: string
    defu: Awaited<ReturnType<T>>['result']
  },
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
  let name: string
  let defu: Awaited<ReturnType<T>>['result']
  if (typeof options === 'string') {
    name = options
    defu = {}
  } else {
    name = options.name
    defu = options.defu
  }
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
  return defu
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

async function clickCartoon($: M) {
  const cartoonTypes = await request($, $.gardenApi.getCartoons, { name: '获取场景列表', defu: [] })

  await asyncForEach(
    (['cloud', 'color', 'widget', 'mail'] as const).filter(cart => !cartoonTypes.includes(cart)),
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
  return await request(
    $,
    $.gardenApi.getTaskList,
    { name: '获取任务列表', defu: [] },
    headers,
  )
}

async function getTaskStateList($: M, headers?: ClientTypeHeaders) {
  return await request(
    $,
    $.gardenApi.getTaskStateList,
    { name: '获取任务完成情况表', defu: [] },
    headers,
  )
}

async function doTask(
  $: M,
  tasks: TaskList['result'],
  headers?: ClientTypeHeaders,
) {
  const fileInfo = {
    contentSize: '133967',
    digest: $.config.garden.digest,
  }
  const taskMap = {
    '2002': async () => {
      if (
        await uploadFileRequest($, getParentCatalogID(), {
          ext: '.png',
          ...fileInfo,
        })
      ) {
        $.logger.debug(`上传图片成功`)
        await $.sleep(2000)
        return true
      }
    },
    '2003': async () => {
      if (
        await uploadFileRequest($, getParentCatalogID(), {
          ext: '.mp4',
          ...fileInfo,
        })
      ) {
        $.logger.debug(`上传视频成功`)
        await $.sleep(2000)
        return true
      }
    },
  }

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
      switch (code) {
        case -1:
        case 1:
          $.logger.debug(`${taskName}任务已领取`)
          taskMap[taskId] && await taskMap[taskId]()
          return
        default:
          $.logger.error(`领取${taskName}失败`, code, summary)
          return
      }
    },
    async () => await $.sleep(6000),
  )
}

async function doTaskByHeaders($: M, headers: ClientTypeHeaders) {
  try {
    const taskList = await getTaskList($, headers)
    const stateList = (await getTaskStateList($, headers)).reduce(
      (arr, { taskId, taskState }) => taskState === 0 ? [...arr, taskId] : arr,
      [] as number[],
    )
    await $.sleep(1000)
    return await _run(taskList.filter((task) => stateList.indexOf(task.taskId) !== -1))

    async function _run(
      _taskList: TaskList['result'],
    ) {
      await $.sleep(5000)
      await doTask($, _taskList, headers)
      await $.sleep(4000)
      const stateList = await getTaskStateList($, headers)
      await givenWater($, stateList.filter(({ taskState }) => taskState === 1), headers)
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
    await clickCartoon($)

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
