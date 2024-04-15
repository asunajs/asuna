import { createTime, isWps, randomHex } from '@asign/utils-pure'
import { getParentCatalogID, uploadFile } from '../service.js'
import type { M } from '../types.js'

function getBufferMd5($: M, input: Buffer) {
  // 分块计算 md5
  const chunkSize = 1048576
  const md5 = $.crypto.createHash('md5')
  for (let i = 0; i < input.length; i += chunkSize) {
    md5.update(input.subarray(i, i + chunkSize))
  }
  return md5.digest('hex')
}

async function getRandomFile($: M, size: number) {
  // 创建指定大小的buffer
  const buffer = Buffer.concat([
    Buffer.from(randomHex(16) + new Date().getTime()),
    Buffer.alloc(size * 1048576),
  ])

  return {
    buffer,
    fileMd5: getBufferMd5($, buffer),
    fileSize: buffer.byteLength,
  }
}

async function _upload($: M, size: number, digest?: string, contentSize?: number) {
  const file = digest
    ? {
      buffer: null,
      fileMd5: digest,
      fileSize: contentSize,
    }
    : await getRandomFile($, size)
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
  // 每次只上传 100 MB 的文件
  for (let i = 0; i < needM; i += 100) {
    const r = await _upload($, 100, digest, contentSize)
    if (r.digest) {
      digest = r.digest
      contentSize = r.contentSize
    }

    if (needM - 100 > 0) {
      await $.sleep(3000)
    }
  }
}
