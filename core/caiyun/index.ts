import { randomHex } from '@asunajs/utils-pure';
import type { M } from './types';
import { gardenTask } from './garden';

export * from './types';
export * from './api';

async function request<T extends (...args: any[]) => any>(
  $: M,
  api: T,
  name: string,
  ...args: Parameters<T>
): Promise<Awaited<ReturnType<T>>['result']> {
  try {
    const { code, message, msg, result } = await api(...args);
    if (code !== 0) {
      $.logger.error(`${name}失败`, message || msg);
    } else {
      return result;
    }
  } catch (error) {
    $.logger.error(`${name}异常`, error);
  }
  return {};
}

export async function getSsoTokenApi($: M, phone: number | string) {
  try {
    const specToken = await $.api.querySpecToken(phone);
    if (!specToken.success) {
      $.logger.error('获取 ssoToken 失败', specToken.message);
      return;
    }
    return specToken.data.token;
  } catch (error) {
    $.logger.error(`获取 ssoToken 异常`, error);
  }
}

async function getJwtTokenApi($: M, ssoToken: string) {
  return (await request($, $.api.tyrzLogin, '获取 ssoToken ', ssoToken)).token;
}

async function signInApi($: M) {
  return await request($, $.api.signInInfo, '网盘签到');
}

async function signInWxApi($: M) {
  return await request($, $.api.signInfoInWx, '微信签到');
}

export async function refreshToken($: M, phone: string) {
  const ssoToken = await getSsoTokenApi($, phone);
  if (!ssoToken) return;

  const jwtToken = await getJwtTokenApi($, ssoToken);

  return jwtToken;
}

async function signIn($: M) {
  const { todaySignIn, total, toReceive } = (await signInApi($)) || {};
  $.logger.info(`当前积分${total}${toReceive ? `，待领取${toReceive}` : ''}`);
  if (todaySignIn === true) {
    $.logger.info(`网盘今日已签到`);
    return;
  }
  await $.sleep(1000);
  const info = await signInApi($);
  if (!info) return;
  if (info.todaySignIn === false) {
    $.logger.info(`网盘签到失败`);
    return;
  }
  $.logger.info(`网盘签到成功`);
}

async function signInWx($: M) {
  const info = await signInWxApi($);
  if (!info) return;
  if (info.todaySignIn === false) {
    $.logger.error(`微信签到失败`);
    if (info.isFollow === false) {
      $.logger.info(`当前账号没有绑定微信公众号【中国移动云盘】`);
      return;
    }
  }
  $.logger.info(`微信签到成功`);
}

async function wxDraw($: M) {
  try {
    const drawInfo = await $.api.getDrawInWx();
    if (drawInfo.code !== 0) {
      $.logger.error(
        `获取微信抽奖信息失败，跳过运行，${JSON.stringify(drawInfo)}`
      );
      return;
    }

    if (drawInfo.result.surplusNumber < 50) {
      $.logger.info(
        `剩余微信抽奖次数${drawInfo.result.surplusNumber}，跳过执行`
      );
      return;
    }
    const draw = await $.api.drawInWx();
    if (draw.code !== 0) {
      $.logger.error(`微信抽奖失败，${JSON.stringify(draw)}`);
      return;
    }
    $.logger.info(`微信抽奖成功，获得【${draw.result.prizeName}】`);
  } catch (error) {
    $;
    $.logger.error(`微信抽奖异常`, error);
  }
}

async function receive($: M) {
  return await request($, $.api.receive, '领取云朵');
}

async function clickTask($: M, task: number) {
  try {
    const { code, msg } = await $.api.clickTask(task);
    if (code === 0) {
      return true;
    }
    $.logger.error(`点击任务${task}失败`, msg);
  } catch (error) {
    $.logger.error(`点击任务${task}异常`, error);
  }
  return false;
}

async function pcUploadFileRequest($: M, path: string) {
  try {
    const { success, message, data } = await $.api.pcUploadFileRequest(
      $.config.phone,
      path,
      0,
      randomHex(4) + '.png',
      'd41d8cd98f00b204e9800998ecf8427e'
    );
    if (success && data && data.uploadResult) {
      return data.uploadResult.newContentIDList.map(
        ({ contentID }) => contentID
      );
    }
    $.logger.error(`上传文件失败`, message);
  } catch (error) {
    $.logger.error(`上传文件异常`, error);
  }
}

async function deleteFiles($: M, ids: string[]) {
  try {
    const {
      data: {
        createBatchOprTaskRes: { taskID },
      },
    } = await $.api.createBatchOprTask($.config.phone, ids);

    await $.api.queryBatchOprTaskDetail($.config.phone, taskID);
  } catch (error) {
    $.logger.error(`删除文件失败`, error);
  }
}

async function getParentCatalogID($: M) {
  try {
    const { resultCode, resultMsg, resultData } = await $.api.queryBatchList();
    if (resultCode === 200) {
      const listItem = resultData.list[0];
      if (!listItem) return '00019700101000000001';
      const path = listItem.dynamicContentInfos[0]?.path;
      if (path && path.includes('/')) return path.split('/')[0];
      return path;
    }
    $.logger.error(`获取文件夹 id 失败`, resultMsg);
  } catch (error) {
    $.logger.error(`获取文件夹 id 异常`, error);
  }
}

async function getNoteAuthToken($: M) {
  try {
    return $.api.getNoteAuthToken($.config.auth, $.config.phone);
  } catch (error) {
    $.logger.error('获取云笔记 Auth Token 异常', error);
  }
}

async function uploadFileDaily($: M) {
  /** 106 上传任务 */
  if (!(await clickTask($, 106))) {
    $.logger.info(`接收任务失败，跳过上传任务`);
    return;
  }
  const path = await getParentCatalogID($);
  if (!path) {
    $.logger.info(`上传路径不存在，跳过上传任务`);
    return;
  }
  const contentIDs = await pcUploadFileRequest($, path);
  contentIDs && (await deleteFiles($, contentIDs));
}

async function createNoteDaily($: M) {
  if (!$.config.auth) {
    $.logger.info(`未配置 authToken，跳过云笔记任务执行`);
    return;
  }
  const headers = await getNoteAuthToken($);
  if (!headers) {
    $.logger.info(`获取鉴权信息失败，跳过云笔记任务执行`);
    return;
  }
  try {
    const id = randomHex(32);
    await $.api.createNote(id, `${randomHex(3)}`, $.config.phone, headers);
    await $.sleep(2000);
    await $.api.deleteNote(id, headers);
  } catch (error) {
    $.logger.error(`创建云笔记异常`, error);
  }
}

async function _clickTask($: M, id: number, currstep: number) {
  return currstep === 0 ? await clickTask($, id) : true;
}

async function dailyTask($: M) {
  $.logger.info(`------【每日】------`);
  const { day } = await request($, $.api.getTaskList, '获取任务列表');
  if (!day) return;
  const taskFuncList = { 106: uploadFileDaily, 107: createNoteDaily };
  const doingList: number[] = [];

  for (const taskItem of day) {
    if (taskItem.state === 'FINISH') continue;
    if (await _clickTask($, taskItem.id, taskItem.currstep)) {
      await taskFuncList[taskItem.id]?.($);
      doingList.push(taskItem.id);
    }
  }

  if (doingList.length) {
    const { day } = await request($, $.api.getTaskList, '获取任务列表');
    if (!day) return;
    for (const taskItem of day) {
      if (doingList.includes(taskItem.id) && taskItem.state === 'FINISH')
        $.logger.info(`完成：${taskItem.name}`);
    }
  }
}

async function monthTaskOnMail($: M) {
  const { month } = await request(
    $,
    $.api.getTaskList,
    '获取任务列表',
    'newsign_139mail'
  );
  if (!month) return;
  const doingList: number[] = [];

  for (const taskItem of month) {
    if (![1008, 1009, 1010, 1013, 1014, 1016, 1017].includes(taskItem.id))
      continue;
    if (taskItem.state === 'FINISH') continue;
    if (await _clickTask($, taskItem.id, taskItem.currstep)) {
      doingList.push(taskItem.id);
    }
  }

  if (doingList.length) {
    const { month } = await request(
      $,
      $.api.getTaskList,
      '获取任务列表',
      'newsign_139mail'
    );
    if (!month) return;
    for (const taskItem of month) {
      if (doingList.includes(taskItem.id) && taskItem.state === 'FINISH')
        $.logger.info(`完成：${taskItem.name}`);
    }
  }
}

async function shake($: M) {
  const { shakePrizeconfig, shakeRecommend } = await request(
    $,
    $.api.shake,
    '摇一摇'
  );
  if (shakeRecommend) {
    return $.logger.debug(shakeRecommend.explain || shakeRecommend.img);
  }
  if (shakePrizeconfig)
    return $.logger.info(shakePrizeconfig.title + shakePrizeconfig.name);
}

async function shakeTask($: M) {
  $.logger.info(' ------【摇一摇】------');
  const { delay, num } = $.config.shake;
  for (let index = 0; index < num; index++) {
    await shake($);
    if (index < num - 1) {
      await $.sleep(delay * 1000);
    }
  }
}

export async function run($: M) {
  const { config } = $;

  const taskList = [
    signIn,
    signInWx,
    wxDraw,
    monthTaskOnMail,
    dailyTask,
    receive,
  ];

  if (config) {
    if (config.garden && config.garden.enable) {
      taskList.push(gardenTask);
    }
    if (config.shake && config.shake.enable) {
      taskList.push(shakeTask);
    }
  }

  for (const task of taskList) {
    await task($);
    await $.sleep(1000);
  }
}
