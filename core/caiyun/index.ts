import { getXmlElement, randomHex, setStoreArray } from '@asign/utils-pure'
import { SKIP_TASK_LIST, TASK_LIST } from './constant/taskList.js'
import { backupGiftTask } from './service/backupGift.js'
import { gardenTask } from './service/garden.js'
import { aiRedPackTask, getParentCatalogID, pcUploadFileRequest, uploadFile } from './service/index.js'
import { msgPushOnTask } from './service/msgPush.js'
import { taskExpansionTask } from './service/taskExpansion.js'
import type { TaskList } from './TaskType.js'
import type { M } from './types.js'
import { request } from './utils/index.js'

export * from './api.js'
export * from './types.js'

type TaskItem = TaskList['result'][keyof TaskList['result']][number]

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

export async function loginEmail($: M) {
  const ssoToken = await getSsoTokenApi($, $.config.phone)
  if (!ssoToken) return

  try {
    const { code, summary, var: data } = await $.api.loginMail(ssoToken)
    if (code !== 'S_OK') {
      $.logger.fatal('获取 sid 失败', code, summary)
      return
    }

    return data
  } catch (error) {
    $.logger.error(`获取 sid 异常`, error)
  }
  return
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
/**
 * 签到翻倍
 */
async function signInMulti($: M) {
  const { cloudCount, multiple } = await request($, $.api.singInMultiple, '备份签到翻倍')
  if (multiple) {
    $.logger.success('成功获得', multiple, '倍云朵，共计', cloudCount)
  }
}

async function signIn($: M) {
  const { todaySignIn, total, toReceive, curMonthBackup, curMonthBackupSignAccept } = await signInApi($)
  $.logger.info(`当前云朵${total}${toReceive ? `，待领取${toReceive}` : ''}`)
  if (curMonthBackup && !curMonthBackupSignAccept) {
    await signInMulti($)
  }
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
    $.logger.fail(`点击任务${task}失败`, msg)
  } catch (error) {
    $.logger.error(`点击任务${task}异常`, error)
  }
  return false
}

export async function deleteFiles($: M, ids: string[]) {
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

async function _clickTask($: M, id: number, currstep = 0) {
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
  const { month = [], day = [], time = [], new: new_ = [], beiyong1 = [] } = await request(
    $,
    $.api.getTaskList,
    '获取任务列表',
    marketname,
  )

  return [...month, ...day, ...time, ...new_, ...beiyong1]
}

async function getAllAppTaskList($: M) {
  const list1 = await getAppTaskList($, 'sign_in_3')
  const list2 = await getAppTaskList($, 'newsign_139mail')

  return list1.concat(list2)
}

async function beiyong1UploadImg($: M) {
  try {
    const buffer = randomHex(32)
    await uploadFile($, getParentCatalogID(), { ext: '.png', digest: $.md5(buffer) }, buffer)
  } catch (error) {
    $.logger.error(`beiyong1UploadImg异常`, error)
  }
}

function getTaskRunner($: M) {
  return {
    113: refreshToken,
    106: uploadFileDaily,
    107: createNoteDaily,
    434: shareTime,
    110: $.node && $.node.uploadTask,
    1021: emailNotice,
  }
}

async function emailNotice($: M, task: TaskItem) {
  try {
    const { out } = task.button
    if (!out) return
    if (out.canReceive === 1) {
      $.logger.debug(`可以领取通知奖励`)
      await request($, $.api.receiveTask, '领取邮件通知奖励', task.id)
      return
    }
    out.day && $.logger.debug(`邮箱通知已经开启`, out.day, '天')
  } catch (error) {
    $.logger.error(`邮件通知异常`, error)
  }
}

async function _handleAppTask($: M, task: TaskItem) {
  const taskRunner = getTaskRunner($)

  switch (task.id) {
    case 110:
      return await taskRunner[task.id]?.($, task.process)
    default:
      return await taskRunner[task.id]?.($, task)
  }
}

async function appTask($: M) {
  $.logger.start('------【任务列表】------')
  const taskList = await getAllAppTaskList($)

  const doingList: number[] = []

  // 后续可能有的任务需要主动排序
  taskList.sort((a, b) => a.id - b.id)

  for (const task of taskList) {
    if (task.state === 'FINISH' || task.enable !== 1) continue

    const _handleClick = async () => {
      if (await _clickTask($, task.id, task.currstep)) {
        await _handleAppTask($, task)
        doingList.push(task.id)
        await $.sleep(500)
      }
    }
    const _switchAppTask = async () => {
      switch (task.groupid) {
        case 'beiyong1': {
          await _handleClick()
          // 如果是上传任务，则主动上传
          if (task.name.includes('上传') && (task.name.includes('图') || task.name.includes('照'))) {
            await beiyong1UploadImg($)
            return
          }
        }
        case 'month': {
          // 在没开启备份的前提下，本月 20 号前不做 app 的月任务
          if (task.marketname === 'sign_in_3' && ($.store.curMonthBackup === false && new Date().getDate() < 20)) {
            $.logger.debug('跳过任务（未开启备份）', task.name)
            return
          }
        }
        default: {
          if (TASK_LIST[task.id]) {
            await _handleClick()
            return
          }
          if (!SKIP_TASK_LIST.includes(task.id)) {
            await clickTask($, task.id)
            return
          }
        }
      }
    }

    await _switchAppTask()
  }

  const skipCheck = [434, 1021]

  if (doingList.length) {
    for (const task of await getAllAppTaskList($)) {
      if (skipCheck.includes(task.id)) continue
      if (doingList.includes(task.id)) {
        if (task.state === 'FINISH') {
          $.logger.success('成功', task.name)
          continue
        }
        $.logger.fail('失败', task.name, '请手动完成', task.id)
        continue
      }
      if (task.groupid === 'month' || task.groupid === 'day') {
        if (task.state !== 'FINISH') {
          $.logger.fail('未完成', task.name, '请手动完成', task.id)
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
    $.logger.debug('开盲盒')
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

async function openBlindboxAfterGetCount($: M) {
  try {
    const { chanceNum } = await request($, $.api.blindboxUser, '获取盲盒任务')
    if (!chanceNum) return
    await $.sleep(666)
    for (let i = 0; i < chanceNum; i++) {
      await openBlindbox($)
      await $.sleep(666)
    }
  } catch (error) {
    $.logger.error('开盒异常', error)
  }
}

async function registerBlindboxTask($: M, taskId: number) {
  await request($, $.api.registerBlindboxTask, '注册盲盒', taskId)
}

async function openMoreBlindbox($: M) {
  try {
    const taskList = await request($, $.api.getBlindboxTask, '获取盲盒任务')
    if (!Array.isArray(taskList)) return

    const tasks = taskList.filter(task => task.memo && !task.memo.includes('isLimit') && task.status === 0)

    if (tasks.length <= 0) {
      return
    }

    for (const { taskName, taskId } of tasks) {
      $.logger.debug('注册盲盒任务', taskName)
      await registerBlindboxTask($, taskId)
      await $.sleep(666)
      await openBlindboxAfterGetCount($)
    }
  } catch (error) {
    $.logger.error(error)
  }
}

async function blindboxJournaling({ api, sleep }: M) {
  await api.journaling('National_BlindBox_userLogin')
  await sleep(200)
  await api.journaling('National_BlindBox_login')
  await sleep(200)
  await api.journaling('National_BlindBox_loginAppOuterEnd')
  await sleep(200)
}

async function blindboxTask($: M) {
  $.logger.start('------【开盲盒】------')
  try {
    await blindboxJournaling($)
    const r1 = await request($, $.api.blindboxUser, '获取盲盒用户信息')
    if (typeof r1.chanceNum !== 'number') {
      return await openBlindbox($)
    }
    if (r1.chanceNum === 0 && r1.taskNum >= 2) {
      $.logger.info('今日已完成')
      return
    }
    if (r1.firstTime) {
      $.logger.success('今日首次登录，获取次数 +1')
    }
    // 先完成一波
    for (let i = 0; i < r1.chanceNum; i++) {
      await openBlindbox($)
      await $.sleep(666)
    }
    await openMoreBlindbox($)
  } catch (error) {
    $.logger.error('开盲盒任务异常', error)
  }
}

async function hc1Task($: M) {
  $.logger.start('------【合成芝麻】------')
  try {
    if ($.config.inviter) {
      $.logger.info('不支持邀请好友，跳过执行')
      return
    }
    const { info } = await request($, $.api.getHecheng1T, '获取合成芝麻')

    for (let index = 0; index < info.curr; index++) {
      await request($, $.api.beinviteHecheng1T, '合成芝麻开始')
      await $.sleep(5000)
      await request($, $.api.finishHecheng1T, '合成芝麻完成')
    }

    $.logger.success('完成合成芝麻')
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
    blindboxTask,
    hc1Task,
    aiRedPackTask,
    shakeTask,
    receive,
    msgPushOnTask,
    backupGiftTask,
  ]

  if (config) {
    if (config.garden && config.garden.enable) {
      taskList.push(gardenTask)
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
