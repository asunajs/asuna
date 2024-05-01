import type { M } from '@asign/caiyun-core'
import { getParentCatalogID, uploadFileRequest } from '@asign/caiyun-core/service'
import { createTime as _createTime, isWps, randomHex, randomNumber, setStoreArray } from '@asign/utils-pure'
import { got } from '@asunajs/http'
import { randomBytes } from 'crypto'

function getRandomFile($: M) {
  // 创建指定大小的buffer
  const randomBuffer = randomBytes(16)

  return {
    randomBuffer,
    fileMd5: $.node.myMD5(randomBuffer.toString('hex')),
    fileSize: 209715216,
  }
}

async function _upload($: M) {
  const file = getRandomFile($)
  const success = await uploadFile($, getParentCatalogID(), {
    digest: file.fileMd5,
    contentSize: file.fileSize,
    manualRename: 2,
    ext: '.mp4',
    createTime: _createTime(),
  }, file.randomBuffer)

  if (success) {
    $.logger.debug('上传成功')
  }
}

export async function uploadTask($: M, progressNum: number) {
  if (isWps()) {
    $.logger.debug('当前环境为WPS，不支持上传文件')
    return
  }
  $.logger.debug('已经上传', progressNum, '字节')
  const needM = 1025 - Math.floor(progressNum / 1024 / 1024)
  $.logger.debug('需要上传', needM, 'MB')

  // 每次只上传 200 MB 的文件
  for (let i = 0; i < needM; i += 200) {
    await _upload($)

    if (needM - 200 > 0) {
      await $.sleep(3000)
    }
  }
}

export async function uploadFile(
  $: M,
  parentCatalogID: string,
  {
    ext = '.png',
    digest = randomHex(32).toUpperCase(),
    contentSize = randomNumber(1, 1000) as number | string,
    manualRename = 2,
    contentName = 'asign-' + randomHex(4) + ext,
    createTime = _createTime(),
  } = {},
  randomBuffer: Buffer,
) {
  try {
    $.logger.debug('开始上传文件', digest)
    const { redirectionUrl, uploadTaskID, contentID } = await uploadFileRequest($, parentCatalogID, {
      ext,
      digest,
      contentSize,
      manualRename,
      contentName,
      createTime,
    }, true)
    if (!redirectionUrl || !randomBuffer) {
      return Boolean(contentID)
    }
    $.logger.debug('别着急，文件上传中。。。', contentID)
    const ok = await uploadFileApi(redirectionUrl.replace(/&amp;/g, '&'), uploadTaskID, randomBuffer)
    if (ok) {
      contentID && setStoreArray($.store, 'files', [contentID])
    }
    return ok
  } catch (error) {
    $.logger.error(`上传文件异常`, error)
  }
  return false
}

async function uploadFileApi(url: string, id: string, randomBuffer: Buffer) {
  const size = 209715216
  const stream = got.stream.post(url, {
    headers: {
      'UploadtaskID': id + '-',
      'x-huawei-uploadSrc': '1',
      'Content-Type': 'application/octet-stream',
      'x-huawei-channelSrc': '10000023',
      'User-Agent': 'okhttp/3.11.0',
      'contentSize': size.toString(),
      'Range': `bytes=0-${(size - 1).toString()}`,
    },
    body: randomFile(randomBuffer),
  })

  stream.resume()

  return new Promise<boolean>((resolve, reject) => {
    stream.on('error', reject)
    stream.on('response', async (res) => {
      resolve(res.ok)
    })
  })
}

function* randomFile(randomBuffer: Buffer) {
  const size = 209715200
  // 每次生成 1024 *  64 的大小
  const chunkSize = 1024 * 64
  for (let i = 0; i < size; i += chunkSize) {
    yield Buffer.alloc(chunkSize)
  }
  yield randomBuffer
}
