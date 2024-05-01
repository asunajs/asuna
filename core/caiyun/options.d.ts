/**
 * 中国移动云盘配置
 */
export interface Caiyun {
  /**
   * cookie authorization 字段
   */
  auth: string
  /**
   * 摇一摇配置
   */
  shake?: {
    /**
     * 是否开启该功能
     */
    enable?: boolean
    /**
     * 摇一摇次数
     */
    num?: number
    /**
     * 每次间隔时间（秒）
     */
    delay?: number
  }
  /**
   * 果园配置
   */
  garden?: {
    /**
     * 是否开启该功能，需要注意的是果园需要自己去 APP 手动激活一下，否则等待你的全是报错
     */
    enable?: boolean
    /**
     * 上传文件的 md5，必须为本账号已经上传过的文件的 md5。用于上传视频和图片任务
     */
    digest?: string
  }
  /**
   * AI 红包
   */
  aiRedPack?: {
    /**
     * 是否开启该功能
     */
    enable?: boolean
  }
  /**
   * 备份等待时间（秒）
   */
  backupWaitTime?: number
}
