/**
 * 阿里云盘配置
 */
export interface Alipan {
  /**
   * refresh_token
   */
  token: string
  /**
   * 是否跳过需要上传文件的任务
   */
  skipUpload: boolean
}
