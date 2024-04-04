import { createTime as _createTime, getXmlElement, randomHex, randomNumber, setStoreArray } from '@asign/utils-pure'
import type { M } from './types.js'

export async function uploadFileRequest(
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
) {
  try {
    const xml = await $.api.uploadFileRequest(
      {
        phone: $.config.phone,
        parentCatalogID,
        contentSize,
        createTime,
        digest,
        manualRename,
        contentName,
      },
    )
    const isNeedUpload = getXmlElement(xml, 'isNeedUpload')
    if (isNeedUpload === '1') {
      $.logger.fail('未找到该文件，该文件需要手动上传')
    }
    const contentID = getXmlElement(xml, 'contentID')
    if (contentID) {
      contentID && setStoreArray($.store, 'files', [contentID])
      return true
    }
    $.logger.error(`上传文件失败`, xml)
  } catch (error) {
    $.logger.error(`上传文件异常`, error)
  }
}

export async function pcUploadFileRequest($: M, path: string) {
  try {
    const { success, message, data } = await $.api.pcUploadFileRequest(
      $.config.phone,
      path,
      0,
      'asign' + randomHex(4) + '.png',
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

export function getParentCatalogID() {
  return '00019700101000000001'
}
