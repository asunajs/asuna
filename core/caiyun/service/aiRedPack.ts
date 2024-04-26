import { isWps, randomNumber } from '@asign/utils-pure'
import { caiyunUrl, mw2TogetherUrl } from '../constant/index.js'
import { loginEmail } from '../index.js'
import type { M } from '../types.js'
import { request } from '../utils/index.js'

export async function aiRedPackTask($: M) {
  $.logger.start(`------【AI红包】------`)
  if (isWps()) {
    $.logger.fail('AI红包', '当前环境为WPS，跳过')
    return
  }

  const sid = await init($)
  if (!sid) return

  let count = 4

  while (!(await _task($, sid)) && count > 0) {
    count--
  }
}

async function _task($: M, sid: string) {
  const sleep = $.sleep

  await sleep(1000)

  const puzzleCards = await getPuzzleCards($)
  if (!puzzleCards) return

  const puzzleCard = puzzleCards[randomNumber(0, puzzleCards.length - 1)]
  $.logger.debug('谜面', puzzleCard.puzzle)

  await sleep(200)

  const taskId = await getMailChatTaskId($, sid, puzzleCard.puzzle)
  if (!taskId) return

  await sleep(1000)

  const msg = await getMailChatMsg($, sid, taskId)
  if (!msg) return

  const tip = matchResult(msg)
  if (!tip) return $.logger.fail('AI红包', '未获取到谜底')

  $.logger.debug('谜底', tip)

  await sleep(400)

  const answered = await submitAnswered($, puzzleCard.id, tip)
  if (answered === -1) return true
  if (answered !== 0) return

  await sleep(400)

  const prizeName = await openRedPack($, puzzleCard.id)
  if (prizeName === -1) return true
  if (typeof prizeName === 'number') return

  $.logger.success('获得', prizeName)

  // only once
  if (prizeName !== '谢谢参与') return true
}

async function init($: M) {
  try {
    const loginInfo = await loginEmail($)
    if (!loginInfo) {
      return
    }
    const { sid, rmkey } = loginInfo
    if (sid) {
      $.http.setCookie('sid', sid, caiyunUrl)
      $.http.setCookie('RMKEY', rmkey, mw2TogetherUrl)
      return sid
    }
  } catch (error) {
    $.logger.error('邮箱登录异常', error)
  }
}

async function getPuzzleCards($: M) {
  const puzzleCards = await request($, $.api.getIndexPuzzleCard, { name: '获取谜底列表' })
  if (!puzzleCards.length) {
    $.logger.fail('未获取到谜底列表，跳过任务')
    return
  }
  return puzzleCards
    .filter(item => item.puzzleTitleContext)
    .map(item => ({
      puzzle: item.puzzleTitleContext + '---' + item.puzzleTipContext,
      id: item.id,
    }))
}

async function getMailChatTaskId($: M, sid: string, q: string) {
  try {
    const { code, taskId, summary } = await $.api.mailChatTask(sid, q)
    if (code !== 'S_OK') {
      $.logger.fail('获取AI聊天任务ID失败', summary)
      return
    }
    return taskId
  } catch (error) {
    $.logger.error('获取AI聊天任务ID异常', error)
  }
}

async function getMailChatMsg($: M, sid: string, id: string) {
  try {
    const { code, summary, var: data } = await $.api.mailChatMsg(sid, id)
    if (code !== 'S_OK' || (data && data.result === '')) {
      $.logger.fail('获取AI聊天消息失败', summary)
      return
    }
    return data.result
  } catch (error) {
    $.logger.error('获取AI聊天消息异常', error)
  }
}

function matchResult(result: string) {
  const match = result.split(/[—-]/)
  return match[match.length - 1]
}

/**
 * 回答答案
 */
async function submitAnswered($: M, id: string, a: string) {
  try {
    const { code, msg } = await $.api.submitAnswered(id, a)

    switch (code) {
      case 0:
        $.logger.debug('回答问题成功')
        return 0
      case 201:
        $.logger.fail('回答问题成功，但', code, msg)
        return -1
      default:
        $.logger.fail('回答问题失败', code, msg)
        return 1
    }
  } catch (error) {
    $.logger.error('回答答案异常', error)
  }
  return 2
}

async function openRedPack($: M, puzzleId: string) {
  try {
    const { code, msg, result } = await $.api.getAwarding(puzzleId)

    switch (code) {
      case 0:
        return result.prizeName
      case 10010020:
        $.logger.fail('可能你需要去 APP 手动完成一次', code, msg)
        return -1
      default:
        $.logger.fail('打开红包失败', code, msg)
        return 1
    }
  } catch (error) {
    $.logger.error('打开红包', error)
  }
  return 2
}
