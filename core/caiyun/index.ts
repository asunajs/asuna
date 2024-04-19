import { getXmlElement, randomHex, setStoreArray } from '@asign/utils-pure'
import { TASK_LIST } from './constant/taskList.js'
import { getParentCatalogID, pcUploadFileRequest } from './service.js'
import { backupGiftTask } from './service/backupGift.js'
import { gardenTask } from './service/garden.js'
import { msgPushOnTask } from './service/msgPush.js'
import { taskExpansionTask } from './service/taskExpansion.js'
import type { M } from './types.js'
import { request } from './utils/index.js'

export * from './api.js'
export * from './types.js'

export async function getSsoTokenApi($: M, phone: number | string) {
  try {
    const specToken = await $.api.querySpecToken(phone)
    if (!specToken.success) {
      $.logger.fatal('获取 ssoToken 失败', specToken.message)
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
    $.logger.fail(`微信签到失败`)
    if (info.isFollow === false) {
      $.logger.fail(`当前账号没有绑定微信公众号【中国移动云盘】`)
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

async function deleteFiles($: M, ids: string[]) {
  try {
    $.logger.debug(`删除文件${ids.join(',')}`)
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

async function getNoteAuthToken($: M) {
  try {
    return $.api.getNoteAuthToken($.config.auth, $.config.phone)
  } catch (error) {
    $.logger.error('获取云笔记 Auth Token 异常', error)
  }
}

async function uploadFileDaily($: M) {
  const contentID = await pcUploadFileRequest($, getParentCatalogID())
  if (contentID) {
    setStoreArray($.store, 'files', contentID)
  }
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
  const idCurrstepMap = {
    434: 22,
  }
  if (idCurrstepMap[id] && currstep === idCurrstepMap[id]) {
    await clickTask($, id)
    return true
  }
  return currstep === 0 ? await clickTask($, id) : true
}

async function shareTime($: M) {
  try {
    const files = $.store.files
    if (!files || !files[0]) {
      $.logger.fail(`未获取到文件列表，跳过分享任务`)
      return
    }
    const { code, message } = await $.api.getOutLink(
      $.config.phone,
      [files[0]],
      '',
    )
    if (code === '0') {
      $.logger.success(`分享链接成功`)
      return true
    }
    $.logger.fail(`分享链接失败`, code, message)
  } catch (error) {
    $.logger.error(`分享链接异常`, error)
  }
}

async function getAppTaskList($: M, marketname: 'sign_in_3' | 'newsign_139mail' = 'sign_in_3') {
  const { month = [], day = [], time = [], new: new_ = [] } = await request(
    $,
    $.api.getTaskList,
    '获取任务列表',
    marketname,
  )

  return [...month, ...day, ...time, ...new_]
}

async function getAllAppTaskList($: M) {
  const list1 = await getAppTaskList($, 'sign_in_3')
  const list2 = await getAppTaskList($, 'newsign_139mail')

  return list1.concat(list2)
}

function getTaskRunner($: M) {
  return {
    113: refreshToken,
    106: uploadFileDaily,
    107: createNoteDaily,
    434: shareTime,
    110: $.node && $.node.uploadTask,
  }
}

async function appTask($: M) {
  $.logger.start('------【任务列表】------')
  const taskList = await getAllAppTaskList($)
  const taskRunner = getTaskRunner($)

  const doingList: number[] = []

  // 后续可能有的任务需要主动排序
  taskList.sort((a, b) => a.id - b.id)

  for (const task of taskList) {
    if (task.state === 'FINISH' || task.enable !== 1) continue

    if (TASK_LIST[task.id]) {
      // 在没开启备份的前提下，本月 20 号前不做 app 的月任务
      if (
        task.marketname === 'sign_in_3' && task.groupid === 'month'
        && ($.store.curMonthBackup === false && new Date().getDate() < 20)
      ) {
        $.logger.debug('跳过过任务（未开启备份）', task.name)
        continue
      }

      if (await _clickTask($, task.id, task.currstep)) {
        if (task.id === 110) {
          await taskRunner[task.id]?.($, task.process)
        } else {
          await taskRunner[task.id]?.($)
        }
        doingList.push(task.id)
        await $.sleep(500)
      }
    }
  }

  const skipCheck = [434]

  if (doingList.length) {
    for (const task of await getAllAppTaskList($)) {
      if (doingList.includes(task.id)) {
        if (task.state === 'FINISH') {
          $.logger.success('成功', task.name)
        } else {
          !skipCheck.includes(task.id) && $.logger.fail('失败', task.name)
        }
      }
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
  if (shakePrizeconfig) return $.logger.info(shakePrizeconfig.title + shakePrizeconfig.name)
}

async function shakeTask($: M) {
  $.logger.start('------【摇一摇】------')
  const { delay, num } = $.config.shake
  for (let index = 0; index < num; index++) {
    await shake($)
    if (index < num - 1) {
      await $.sleep(delay * 1000)
    }
  }
}

async function shareFind($: M) {
  const phone = $.config.phone
  try {
    const data = {
      traceId: Number(Math.random().toString().substring(10)),
      tackTime: Date.now(),
      distinctId: randomHex([14, 15, 8, 7, 15]),
      eventName: 'discoverNewVersion.Page.Share.QQ',
      event: '$manual',
      flushTime: Date.now(),
      model: '',
      osVersion: '',
      appVersion: '',
      manufacture: '',
      screenHeight: 895,
      os: 'Android',
      screenWidth: 393,
      lib: 'js',
      libVersion: '1.17.2',
      networkType: '',
      resumeFromBackground: '',
      screenName: '',
      title: '【精选】一站式资源宝库',
      eventDuration: '',
      elementPosition: '',
      elementId: '',
      elementContent: '',
      elementType: '',
      downloadChannel: '',
      crashedReason: '',
      phoneNumber: phone,
      storageTime: '',
      channel: '',
      activityName: '',
      platform: 'h5',
      sdkVersion: '1.0.1',
      elementSelector: '',
      referrer: '',
      scene: '',
      latestScene: '',
      source: 'content-open',
      urlPath: '',
      IP: '',
      url: `https://h.139.com/content/discoverNewVersion?columnId=20&token=STuid00000${Date.now()}${
        randomHex(
          20,
        )
      }&targetSourceId=001005`,
      elementName: '',
      browser: 'Chrome WebView',
      elementTargetUrl: '',
      referrerHost: '',
      browerVersion: '122.0.6261.106',
      latitude: '',
      pageDuration: '',
      longtitude: '',
      urlQuery: '',
      shareDepth: '',
      arriveTimeStamp: '',
      spare: { mobile: phone, channel: '' },
      public: '',
      province: '',
      city: '',
      carrier: '',
    }
    await $.api.datacenter(Buffer.from(JSON.stringify(data)).toString('base64'))
  } catch (error) {
    $.logger.error('分享有奖异常', error)
  }
}

function getCloudRecord($: M) {
  return request($, $.api.getCloudRecord, '获取云朵记录')
}

/**
 * 返回需要次数
 */
function getShareFindCount($: M) {
  if (!$.localStorage.shareFind) {
    return 20
  }
  const { lastUpdate, count } = $.localStorage.shareFind
  const isCurrentMonth = new Date().getMonth() === new Date(lastUpdate).getMonth()
  return isCurrentMonth ? 20 - count : 20
}

async function shareFindTask($: M) {
  $.logger.start('------【邀请好友看电影】------')
  $.logger.info('测试中。。。')
  let count = getShareFindCount($)
  if (count <= 0) {
    $.logger.info('本月已分享')
    return
  }

  let _count = 20 - (--count)
  await shareFind($)
  await $.sleep(1000)
  await receive($)
  await $.sleep(1000)
  const { records } = await getCloudRecord($)
  const recordFirst = records?.find((record) => record.mark === 'fxnrplus5')
  if (recordFirst && new Date().getTime() - new Date(recordFirst.updatetime).getTime() < 20_000) {
    while (count > 0) {
      _count++
      count--
      $.logger.debug('邀请好友')
      await shareFind($)
      await $.sleep(2000)
    }
    await receive($)
    const { records } = await getCloudRecord($)
    if (records?.filter((record) => record.mark === 'fxnrplus5').length > 6) {
      $.logger.info('完成')
    } else {
      $.logger.error('未知情况，无法完成（或已完成），今日跳过')
    }
  } else {
    $.logger.error('未知情况，无法完成（或已完成），本次跳过')
    _count += 10
  }
  $.localStorage.shareFind = {
    lastUpdate: new Date().getTime(),
    count: _count,
  }
}

async function openBlindbox($: M) {
  try {
    const { code, msg, result } = await $.api.openBlindbox()
    switch (code) {
      case 0:
        return $.logger.info('获得', result.prizeName)
      case 200105:
        return $.logger.debug('什么都没有哦')
      case 200106:
        return $.logger.error('异常', code, msg)
      default:
        return $.logger.warn('未知原因失败', code, msg)
    }
  } catch (error) {
    $.logger.error('openBlindbox 异常', error)
  }
}

async function registerBlindboxTask($: M, taskId: number) {
  await request($, $.api.registerBlindboxTask, '注册盲盒', taskId)
}

async function getBlindboxCount($: M, isChinaMobile: boolean) {
  try {
    const taskList = await request($, $.api.getBlindboxTask, '获取盲盒任务')
    if (!Array.isArray(taskList)) return

    const taskIds = (isChinaMobile ? taskList : taskList.filter(task => task.memo && task.memo.includes('isLimit')))
      .reduce((taskIds, task) => {
        if (task.status === 0) taskIds.push(task.taskId)
        return taskIds
      }, [])
    for (const taskId of taskIds) {
      $.logger.debug('注册盲盒任务', taskId)
      await registerBlindboxTask($, taskId)
      await $.sleep(1000)
    }
  } catch (error) {}
}

async function blindboxTask($: M) {
  $.logger.start('------【开盲盒】------')
  $.logger.debug('bug 修复中，测试中，可能导致无效开启')
  try {
    const { result: r1, code, msg } = await $.api.blindboxUser()
    if (!r1 || code !== 0) {
      $.logger.error('获取盲盒信息失败', code, msg)
      return await openBlindbox($)
    }
    if (r1.firstTime) {
      $.logger.success('今日首次登录，获取次数 +1')
    }
    await $.sleep(666)
    await getBlindboxCount($, r1.isChinaMobile === 1)
    const { result } = await $.api.blindboxUser()
    if (result?.chanceNum === 0) {
      $.logger.info('今日无机会')
      return
    }
    for (let index = 0; index < result.chanceNum; index++) {
      await openBlindbox($)
      await $.sleep(1000)
    }
  } catch (error) {
    $.logger.error('开盲盒任务异常', error)
  }
}

function checkHc1T({ localStorage }: M) {
  if (localStorage.hc1T) {
    const { lastUpdate } = localStorage.hc1T
    if (new Date().getMonth() <= new Date(lastUpdate).getMonth()) {
      return true
    }
  }
}

async function hc1Task($: M) {
  $.logger.start('------【合成芝麻】------')
  if (checkHc1T($)) {
    $.logger.info('本月已领取')
    return
  }
  try {
    await request($, $.api.beinviteHecheng1T, '合成芝麻')
    await $.sleep(5000)
    await request($, $.api.finishHecheng1T, '合成芝麻')
    $.logger.success('完成合成芝麻')
    $.localStorage.hc1T = { lastUpdate: new Date().getTime() }
  } catch (error) {
    $.logger.error('合成芝麻失败', error)
  }
}

async function afterTask($: M) {
  $.logger.start('------【搽屁股】------')
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
    taskExpansionTask,
    signInWx,
    wxDraw,
    appTask,
    shareFindTask,
    hc1Task,
    receive,
    msgPushOnTask,
    backupGiftTask,
  ]

  if (config) {
    if (config.garden && config.garden.enable) {
      taskList.push(gardenTask)
    }
    if (config.shake && config.shake.enable) {
      taskList.push(shakeTask)
    }
    if (config.blindbox && config.blindbox.enable) {
      taskList.push(blindboxTask)
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
export function isNeedRefresh(expireTime: number) {
  return expireTime - Date.now() < 432000000
}

export async function createNewAuth($: M) {
  const config = $.config
  const expireTime = getTokenExpireTime(config.token)
  // 打印还有多少天过期
  $.logger.debug(`------【检测账号有效期】------`)
  $.logger.debug(`token 有效期 ${Math.floor((expireTime - Date.now()) / 86400000)} 天`)
  if (!isNeedRefresh(expireTime)) {
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
