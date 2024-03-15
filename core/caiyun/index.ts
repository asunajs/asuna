import { getXmlElement, randomHex, setStoreArray } from '@asign/utils-pure'
import { gardenTask } from './garden.js'
import type { M } from './types.js'

export * from './types.js'
export * from './api.js'
export * from './config.d.js'

async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
  try {
    const { code, message, msg, result } = await api(...args)
    if (code !== 0) {
      $.logger.error(`${name}失败`, code, message || msg)
    } else {
      return result
    }
  } catch (error) {
    $.logger.error(`${name}异常`, error)
  }
  return {}
}

export async function getSsoTokenApi($: M, phone: number | string) {
  try {
    const specToken = await $.api.querySpecToken(phone)
    if (!specToken.success) {
      $.logger.error('获取 ssoToken 失败', specToken.message)
      return
    }
    return specToken.data.token
  } catch (error) {
    $.logger.error(`获取 ssoToken 异常`, error)
  }
}

async function getJwtTokenApi($: M, ssoToken: string) {
  return (await request($, $.api.tyrzLogin, '获取 ssoToken ', ssoToken)).token
}

async function signInApi($: M) {
  return await request($, $.api.signInInfo, '网盘签到')
}

async function signInWxApi($: M) {
  return await request($, $.api.signInfoInWx, '微信签到')
}

export async function getJwtToken($: M) {
  const ssoToken = await getSsoTokenApi($, $.config.phone)
  if (!ssoToken) return

  return await getJwtTokenApi($, ssoToken)
}

export async function refreshToken($: M) {
  try {
    const { token, phone } = $.config
    const tokenXml = await $.api.authTokenRefresh(token, phone)
    if (!tokenXml) {
      return $.logger.error(`authTokenRefresh 失败`)
    }
    return getXmlElement(tokenXml, 'token')
  } catch (error) {
    $.logger.error(`刷新 token 失败`, error)
  }
}

async function signIn($: M) {
  const { todaySignIn, total, toReceive } = (await signInApi($)) || {}
  $.logger.info(`当前积分${total}${toReceive ? `，待领取${toReceive}` : ''}`)
  if (todaySignIn === true) {
    $.logger.info(`网盘今日已签到`)
    return
  }
  await $.sleep(1000)
  const info = await signInApi($)
  if (!info) return
  if (info.todaySignIn === false) {
    $.logger.info(`网盘签到失败`)
    return
  }
  $.logger.info(`网盘签到成功`)
}

async function signInWx($: M) {
  const info = await signInWxApi($)
  if (!info) return
  if (info.todaySignIn === false) {
    $.logger.error(`微信签到失败`)
    if (info.isFollow === false) {
      $.logger.info(`当前账号没有绑定微信公众号【中国移动云盘】`)
      return
    }
  }
  $.logger.info(`微信签到成功`)
}

async function wxDraw($: M) {
  try {
    const drawInfo = await $.api.getDrawInWx()
    if (drawInfo.code !== 0) {
      $.logger.error(
        `获取微信抽奖信息失败，跳过运行，${JSON.stringify(drawInfo)}`,
      )
      return
    }

    if (drawInfo.result.surplusNumber < 50) {
      $.logger.info(
        `剩余微信抽奖次数${drawInfo.result.surplusNumber}，跳过执行`,
      )
      return
    }
    const draw = await $.api.drawInWx()
    if (draw.code !== 0) {
      $.logger.error(`微信抽奖失败，${JSON.stringify(draw)}`)
      return
    }
    $.logger.info(`微信抽奖成功，获得【${draw.result.prizeName}】`)
  } catch (error) {
    $
    $.logger.error(`微信抽奖异常`, error)
  }
}

async function receive($: M) {
  return await request($, $.api.receive, '领取云朵')
}

async function clickTask($: M, task: number) {
  try {
    const { code, msg } = await $.api.clickTask(task)
    if (code === 0) {
      return true
    }
    $.logger.error(`点击任务${task}失败`, msg)
  } catch (error) {
    $.logger.error(`点击任务${task}异常`, error)
  }
  return false
}

async function pcUploadFileRequest($: M, path: string) {
  try {
    const { success, message, data } = await $.api.pcUploadFileRequest(
      $.config.phone,
      path,
      0,
      randomHex(4) + '.png',
      'd41d8cd98f00b204e9800998ecf8427e',
    )
    if (success && data && data.uploadResult) {
      return data.uploadResult.newContentIDList.map(
        ({ contentID }) => contentID,
      )
    }
    $.logger.error(`上传文件失败`, message)
  } catch (error) {
    $.logger.error(`上传文件异常`, error)
  }
}

async function deleteFiles($: M, ids: string[]) {
  try {
    const {
      data: {
        createBatchOprTaskRes: { taskID },
      },
    } = await $.api.createBatchOprTask($.config.phone, ids)

    await $.api.queryBatchOprTaskDetail($.config.phone, taskID)
  } catch (error) {
    $.logger.error(`删除文件失败`, error)
  }
}

function getParentCatalogID() {
  return '00019700101000000001'
}

async function getNoteAuthToken($: M) {
  try {
    return $.api.getNoteAuthToken($.config.auth, $.config.phone)
  } catch (error) {
    $.logger.error('获取云笔记 Auth Token 异常', error)
  }
}

async function uploadFileDaily($: M) {
  /** 106 上传任务 */
  if (!(await clickTask($, 106))) {
    $.logger.info(`接收任务失败，跳过上传任务`)
    return
  }
  const contentIDs = await pcUploadFileRequest($, getParentCatalogID())
  contentIDs && setStoreArray($.store, 'files', contentIDs)
}

async function createNoteDaily($: M) {
  if (!$.config.auth) {
    $.logger.info(`未配置 authToken，跳过云笔记任务执行`)
    return
  }
  const headers = await getNoteAuthToken($)
  if (!headers) {
    $.logger.info(`获取鉴权信息失败，跳过云笔记任务执行`)
    return
  }
  try {
    const id = randomHex(32)
    await $.api.createNote(id, `${randomHex(3)}`, $.config.phone, headers)
    await $.sleep(2000)
    await $.api.deleteNote(id, headers)
  } catch (error) {
    $.logger.error(`创建云笔记异常`, error)
  }
}

async function _clickTask($: M, id: number, currstep: number) {
  return currstep === 0 ? await clickTask($, id) : true
}

async function dailyTask($: M) {
  $.logger.info(`------【每日】------`)
  const { day } = await request($, $.api.getTaskList, '获取任务列表')
  if (!day || !day.length) return $.logger.info(`无任务列表，结束`)
  const taskFuncList = { 106: uploadFileDaily, 107: createNoteDaily }
  const doingList: number[] = []

  for (const taskItem of day) {
    if (taskItem.state === 'FINISH' || taskItem.enable !== 1) continue
    if (await _clickTask($, taskItem.id, taskItem.currstep)) {
      await taskFuncList[taskItem.id]?.($)
      doingList.push(taskItem.id)
    }
  }

  if (doingList.length) {
    const { day } = await request($, $.api.getTaskList, '获取任务列表')
    if (!day) return
    for (const taskItem of day) {
      if (doingList.includes(taskItem.id) && taskItem.state === 'FINISH')
        $.logger.info(`完成：${taskItem.name}`)
    }
  }
}

async function shareTime($: M) {
  try {
    const files = $.store.files
    if (!files || !files[0]) {
      $.logger.info(`未获取到文件列表，跳过分享任务`)
      return
    }
    const { code, message } = await $.api.getOutLink(
      $.config.phone,
      [files[0]],
      '',
    )
    if (code === '0') return true
    $.logger.error(`分享链接失败`, code, message)
  } catch (error) {
    $.logger.error(`分享链接异常`, error)
  }
}

async function hotTask($: M) {
  $.logger.info(`------【热门任务】------`)
  const { time } = await request($, $.api.getTaskList, '获取任务列表')
  if (!time) return
  const taskIds = [434]
  const taskFuncList = { 434: shareTime }

  for (const taskItem of time) {
    if (taskItem.state === 'FINISH' || taskItem.enable !== 1) continue
    if (!taskIds.includes(taskItem.id)) continue
    if (await _clickTask($, taskItem.id, taskItem.currstep)) {
      ;(await taskFuncList[taskItem.id]?.($)) &&
        $.logger.info(`完成：${taskItem.name}`)
    }
  }
}

async function monthTaskOnMail($: M) {
  const { month } = await request(
    $,
    $.api.getTaskList,
    '获取任务列表',
    'newsign_139mail',
  )
  if (!month) return
  const doingList: number[] = []

  for (const taskItem of month) {
    if (![1008, 1009, 1010, 1013, 1014, 1016, 1017].includes(taskItem.id))
      continue
    if (taskItem.state === 'FINISH') continue
    if (await _clickTask($, taskItem.id, taskItem.currstep)) {
      doingList.push(taskItem.id)
    }
  }

  if (doingList.length) {
    const { month } = await request(
      $,
      $.api.getTaskList,
      '获取任务列表',
      'newsign_139mail',
    )
    if (!month) return
    for (const taskItem of month) {
      if (doingList.includes(taskItem.id) && taskItem.state === 'FINISH')
        $.logger.info(`完成：${taskItem.name}`)
    }
  }
}

async function shake($: M) {
  const { shakePrizeconfig, shakeRecommend } = await request(
    $,
    $.api.shake,
    '摇一摇',
  )
  if (shakeRecommend) {
    return $.logger.debug(shakeRecommend.explain || shakeRecommend.img)
  }
  if (shakePrizeconfig)
    return $.logger.info(shakePrizeconfig.title + shakePrizeconfig.name)
}

async function shakeTask($: M) {
  $.logger.info(' ------【摇一摇】------')
  const { delay, num } = $.config.shake
  for (let index = 0; index < num; index++) {
    await shake($)
    if (index < num - 1) {
      await $.sleep(delay * 1000)
    }
  }
}

async function openBlindbox($: M) {
  try {
    const { code, msg, result } = await $.api.openBlindbox()
    switch (code) {
      case 0:
        return $.logger.info('获得', result.prizeName)
      case 200105:
      case 200106:
        return $.logger.info(msg)
      default:
        return $.logger.warn('开盲盒失败', code, msg)
    }
  } catch (error) {
    $.logger.error('openBlindbox 异常', error)
  }
}

async function registerBlindboxTask($: M, taskId: number) {
  await request($, $.api.registerBlindboxTask, '注册盲盒', taskId)
}

async function getBlindboxCount($: M) {
  try {
    const taskList = await request($, $.api.getBlindboxTask, '获取盲盒任务')
    if (!taskList) return
    const taskIds = taskList.reduce((taskIds, task) => {
      if (task.status === 0) taskIds.push(task.taskId)
      return taskIds
    }, [])
    for (const taskId of taskIds) {
      await registerBlindboxTask($, taskId)
    }
  } catch (error) {}
}

async function blindboxTask($: M) {
  $.logger.info(' ------【开盲盒】------')
  try {
    await getBlindboxCount($)
    const { result, code, msg } = await $.api.blindboxUser()
    if (!result || code !== 0) {
      $.logger.error('获取盲盒信息失败', code, msg)
      return await openBlindbox($)
    }
    if (result.isChinaMobile === 1) {
      $.logger.debug(`尊敬的移不动用户`)
    }
    if (result?.chanceNum === 0) {
      $.logger.info('今日无机会')
      return
    }
    for (let index = 0; index < result.chanceNum; index++) {
      await openBlindbox($)
    }
  } catch (error) {
    $.logger.error('开盲盒任务异常', error)
  }
}

async function afterTask($: M) {
  // 删除文件
  try {
    $.store && $.store.files && (await deleteFiles($, $.store.files))
  } catch (error) {
    $.logger.error('afterTask 异常', error)
  }
}

export async function run($: M) {
  const { config } = $

  const taskList = [
    signIn,
    signInWx,
    wxDraw,
    monthTaskOnMail,
    dailyTask,
    hotTask,
    blindboxTask,
    receive,
  ]

  if (config) {
    if (config.garden && config.garden.enable) {
      taskList.push(gardenTask)
    }
    if (config.shake && config.shake.enable) {
      taskList.push(shakeTask)
    }
  }

  for (const task of taskList) {
    await task($)
    await $.sleep(1000)
  }

  await afterTask($)
}

/**
 * 兼容旧配置，现在只要求配置 auth （且 auth 是老版本的 token）
 */
export function getOldConfig(config: any) {
  const isAuthToken = (str: string) => str.includes('|')
  // 只有 token
  if (config.token && !config.auth) {
    config.auth = config.token
    config.token = undefined
    return
  }
  // 只有 auth
  if (config.auth && !config.token) {
    return
  }
  // token 和 auth 都有
  if (config.token && config.auth) {
    config.auth = isAuthToken(config.auth) ? config.token : config.auth
    return
  }
}

export function getTokenExpireTime(token: string) {
  return Number(token.split('|')[3])
}

/**
 * 获取是否需要刷新
 * @description 有效期 30 天，还有 5 天，需要刷新
 */
export function isNeedRefresh(token: string) {
  const expireTime = getTokenExpireTime(token)
  return expireTime - Date.now() < 432000000
}

export async function createNewAuth($: M) {
  const config = $.config
  if (!isNeedRefresh(config.token)) {
    return
  }
  $.logger.info('尝试生成新的 auth')
  const token = await refreshToken($)
  if (token) {
    return Buffer.from(
      // @ts-ignore
      `${config.platform}:${config.phone}:${token}`,
    ).toString('base64')
  }
  $.logger.error('生成新 auth 失败')
}
