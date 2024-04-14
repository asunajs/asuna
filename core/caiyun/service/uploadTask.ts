import { createTime, isWps } from '@asign/utils-pure'
import { md5 } from '@asunajs/utils'
import { getParentCatalogID, uploadFile } from '../service.js'
import type { M } from '../types.js'

/**
 * 生成一个指定大小的随机文件Buffer
 * @param size 指定的文件大小，单位为字节
 * @returns 返回一个大小为指定size的Buffer对象
 */
function randomFile(size: number) {
  // 创建指定大小的buffer
  const buffer = Buffer.alloc(size)

  // 随机数据填充
  const len = Math.floor(Math.random() * 10)
  for (let i = 0; i < len; i++) {
    const randomIndex = Math.floor(Math.random() * size)
    if (randomIndex >= 0 && randomIndex < size) { // 确保索引在有效范围内
      buffer[randomIndex] = Math.floor(Math.random() * 256)
    }
  }

  return buffer
}

function getRandomFile(size: number) {
  const buffer = randomFile(1024 * 1024 * size)
  return {
    buffer,
    fileMd5: md5(buffer).toUpperCase(),
    fileSize: buffer.length,
  }
}

async function _upload($: M, size: number, digest?: string, contentSize?: number) {
  const file = digest
    ? {
      buffer: null,
      fileMd5: digest,
      fileSize: contentSize,
    }
    : getRandomFile(size)
  const success = await uploadFile($, getParentCatalogID(), {
    digest: file.fileMd5,
    contentSize: file.fileSize,
    manualRename: 2,
    ext: '.mp4',
    createTime: createTime(),
  }, file.buffer)

  if (success) {
    return {
      digest: file.fileMd5,
      contentSize: file.fileSize,
    }
  }
  return {}
}

export async function uploadTask($: M, progressNum: number) {
  if (isWps()) {
    $.logger.debug('当前环境为WPS，不支持上传文件')
    return
  }
  const needM = 1025 - Math.floor(progressNum / 1024 / 1024)

  let digest: string, contentSize: number
  // 每次只上传 200 MB 的文件
  for (let i = 0; i < needM; i += 200) {
    const r = await _upload($, 200, digest, contentSize)
    if (r.digest) {
      digest = r.digest
      contentSize = r.contentSize
    }

    if (needM - 200 > 0) {
      await $.sleep(3000)
    }
  }
}
