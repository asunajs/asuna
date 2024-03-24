import { createTime, getXmlElement, randomHex, randomNumber, setStoreArray } from '@asign/utils-pure'
import type { M } from './types.js'

export async function uploadFileRequest(
  $: M,
  parentCatalogID: string,
  {
    ext = '.png',
    digest = randomHex(32).toUpperCase(),
    contentSize = randomNumber(1, 1000) as number | string,
    manualRename = 2,
  } = {},
) {
  try {
    const xml = await $.api.uploadFileRequest(
      {
        phone: $.config.phone,
        parentCatalogID,
        contentSize,
        createTime: createTime(),
        digest,
        manualRename,
        contentName: randomHex(4) + ext,
      },
    )
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

export function getParentCatalogID() {
  return '00019700101000000001'
}
