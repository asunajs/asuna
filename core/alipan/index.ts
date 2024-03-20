import { randomHex } from '@asign/utils-pure'
import type { DeviceRoom, M } from './types.js'

export * from './api.js'
export * from './types.js'

async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
  try {
    const { success, message, result } = await api(...args)
    if (!success) {
      $.logger.error(`${name}失败`, message)
    } else {
      return result
    }
  } catch (error) {
    $.logger.error(`${name}异常`, error)
  }
  return {}
}

export async function refreshToken($: M, token: string) {
  try {
    const data = await $.api.getAccessToken(token)
    if (!data.access_token) {
      $.logger.error('获取 access_token 失败', JSON.stringify(data))
      return
    }
    return data
  } catch (error) {
    $.logger.error(`获取 access_token 异常`, error)
  }
}

async function createDeviceApi($: M, refreshToken: string, deviceId: string) {
  try {
    const { success } = await $.api.createSession(
      deviceId,
      refreshToken,
      randomHex(32),
      'XiaoMi 14Pro',
      'xiaomi',
    )
    if (!success) {
      $.logger.error(`创建虚拟设备${deviceId}失败`)
      return false
    }
    $.logger.info(`创建虚拟设备成功`)
    return true
  } catch (error) {
    $.logger.error(`创建虚拟设备${deviceId}异常`, error)
  }
  return false
}

async function getDeviceRoomListApi($: M) {
  try {
    const { items } = await $.api.getDeviceRoomList()
    if (!items) {
      $.logger.error(`获取设备间列表失败`)
      return
    }
    return items
  } catch (error) {
    $.logger.error(`获取设备间列表异常`, error)
  }
  return
}

async function getDeviceRoomRewardInfo($: M) {
  return request($, $.api.getDeviceRoomRewardInfoToday, '获取设备间领取信息')
}

async function getAlbumsDriveId($: M) {
  try {
    const { code, message, data } = await $.api.getAlbumsInfo()
    if (code !== '200') {
      $.logger.error(`获取相册文件夹失败`, message)
      return
    }
    return data.driveId
  } catch (error) {
    $.logger.error(`获取相册文件夹异常`, error)
  }
}

async function createDevice($: M) {
  const deviceRoom = await getDeviceRoomListApi($)
  const needNum = 5 - deviceRoom.length

  if (needNum <= 0) {
    return
  }

  $.logger.info(`需要创建${needNum}个虚拟设备`)

  for (let i = 0; i < needNum; i++) {
    await createDeviceApi($, $.DATA.refreshToken, randomHex(64))
  }
}

async function uploadFile($: M, deviceId: string, driveId: string) {
  try {
    const { file_id, upload_id } = await $.api.createFile(deviceId, driveId)
    if (file_id) {
      await $.sleep(1000)
      await $.api.completeUpload(deviceId, driveId, file_id, upload_id)
      await $.api.completeAlbumsUpload(
        deviceId,
        driveId,
        file_id,
        'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709',
      )
      return { file_id, upload_id }
    }
    $.logger.error(`${deviceId}上传文件失败`)
  } catch (error) {
    $.logger.error(`上传文件异常`, error)
  }
  return {}
}

async function deviceRoomListHandle(deviceRooms: DeviceRoom['items']) {
  const nofinishDevices = new Set<string>()
  const rewardEnergys = new Set<string>()
  let okNum = 0

  for (const { canCollectEnergy, id, gmtCollectEnergy } of deviceRooms) {
    if (
      !canCollectEnergy
      && new Date(gmtCollectEnergy).getDate() !== new Date().getDate()
    ) {
      nofinishDevices.add(id)
    } else if (canCollectEnergy) {
      rewardEnergys.add(id)
    } else {
      okNum++
    }
  }

  return {
    nofinishDevices: Array.from(nofinishDevices),
    rewardEnergys: Array.from(rewardEnergys),
    okNum: okNum,
  }
}

async function getDeviceRoomRewardApi($: M, id: string) {
  return (
    await request($, $.api.getDeviceRoomRewardEnergy, `领取${id}设备空间`, id)
  ).size
}

async function deleteFileApi(
  $: M,
  deviceId: string,
  driveId: string,
  fileId: string,
) {
  try {
    await $.api.deleteFile(deviceId, driveId, fileId)
  } catch (error) {
    $.logger.error(`删除文件${fileId}异常`, error)
  }
}

async function deleteFiles(
  $: M,
  needDeleteFiles: Map<string, string>,
  driveId: string,
) {
  for (const [fileId, deviceId] of needDeleteFiles) {
    await deleteFileApi($, deviceId, driveId, fileId)
    await $.sleep(1000)
  }
}

async function deviceRoomTask($: M) {
  const { rewardCountToday, rewardTotalSize } = await getDeviceRoomRewardInfo($)

  if (rewardCountToday >= 5) {
    $.logger.info(
      `今日已领取${rewardCountToday}次设备间空间，历史总共${rewardTotalSize}M`,
    )
    return
  }

  const driveId = await getAlbumsDriveId($)

  if (!driveId) {
    $.logger.error(`未获取到文件夹故跳过执行`)
    return
  }

  const needDeleteFiles = new Map<string, string>()

  await createDevice($)

  while (await _deviceRoomTask()) {
    await $.sleep(2000)
  }

  await deleteFiles($, needDeleteFiles, driveId)

  /**
   * @returns 是否继续运行
   */
  async function _deviceRoomTask() {
    const items = await getDeviceRoomListApi($)
    if (!items) {
      $.logger.error(`无法获取虚拟设备，跳过执行`)
      return false
    }

    if (items.length === 0) {
      $.logger.error(`无法创建虚拟设备，跳过执行`)
      return false
    }

    const { nofinishDevices, rewardEnergys, okNum } = await deviceRoomListHandle(items)

    if (okNum >= 5) {
      return false
    }

    let tempNum = 0

    for (const deviceId of rewardEnergys) {
      const size = await getDeviceRoomRewardApi($, deviceId)
      if (size) {
        $.logger.info(`领取设备间成功，获得${size}M`)
        tempNum++
      }
      // 防止出现有超过 5 个设备间可领取
      if (tempNum + okNum >= 5) break
      await $.sleep(1000)
    }

    for (const deviceId of nofinishDevices) {
      const { file_id } = (await uploadFile($, deviceId, driveId)) || {}
      file_id && needDeleteFiles.set(file_id, deviceId)
      await $.sleep(1000)
    }

    return true
  }
}

async function signIn($: M) {
  const { rewards, signInDay } = await request($, $.api.signIn, '签到')

  if (!rewards) {
    return
  }

  for (const { status, type } of rewards) {
    if (status !== 'finished') {
      continue
    }
    switch (type) {
      case 'dailySignIn':
        await request($, $.api.signInReward, '领取签到奖励', signInDay)
        break
      case 'dailyTask':
        await request($, $.api.signInTaskReward, '领取每日任务奖励', signInDay)
        break
      default:
        break
    }
  }
}

async function getDeviceList($: M) {
  try {
    const data = await $.api.getDeviceAppletList()
    if (!data.deviceItems) {
      $.logger.error('获取设备信息失败', JSON.stringify(data))
      return
    }
    if (data.deviceItems.length === 0) {
      $.logger.error('获取到的设备列表未空')
      return
    }
    return data.deviceItems
  } catch (error) {
    $.logger.error(`获取设备信息异常`, error)
  }
}

async function getDevice($: M) {
  const devices = await getDeviceList($)
  if (!devices) return
  const device = devices.find(({ deviceId }) => deviceId)
  return device
}

async function signInTask($: M) {
  const { rewards } = await request($, $.api.signIn, '签到')

  if (
    rewards.find(
      ({ type, status }) =>
        type === 'dailyTask'
        && (status === 'verification' || status === 'finished'),
    )
  ) {
    return
  }

  const { deviceId, backupViews } = (await getDevice($)) || {}
  if (!deviceId) {
    $.logger.error(`未获取到设备 id，跳过每日任务执行`)
    return
  }
  $.DATA.deviceId = deviceId

  const backupView = backupViews.find(({ view }) => view === 'album')
  if (!backupView) {
    $.logger.error(`未获取到文件夹 id，跳过每日任务执行`)
    return
  }

  await request($, $.api.updateDeviceExtras, '上报备份')

  const needDeleteFiles = new Map<string, string>()

  for (let i = 0; i < 10; i++) {
    const { file_id } = await uploadFile($, deviceId, backupView.driveId)
    file_id && needDeleteFiles.set(file_id, deviceId)
    await $.sleep(2000)
  }

  $.DATA.afterTask.push(
    async () => await deleteFiles($, needDeleteFiles, backupView.driveId),
  )
}

async function printSignInInfo($: M) {
  const { rewards } = await request($, $.api.signIn, '签到')
  if (!rewards) {
    return
  }

  const statusMap = {
    unfinished: '未完成',
    finished: '未领取奖励',
    verification: '已领取奖励',
    notStart: '未开始',
  }
  rewards.forEach(({ remind, name, status }) => {
    $.logger.info(`${remind}/${name}/${statusMap[status]}`)
  })
}

export async function run($: M) {
  const taskList = [deviceRoomTask, signInTask, signIn, printSignInInfo]
  for (const task of taskList) {
    await task($)
    await $.sleep(1000)
  }

  for (const task of $.DATA.afterTask) {
    await task()
    await $.sleep(1000)
  }
}
