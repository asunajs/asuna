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
     * 是否开启该功能
     */
    enable?: boolean
    /**
     * 上传文件的 md5，必须为本账号已经上传过的文件的 md5。用于上传视频和图片任务
     */
    digest?: string
  }
  /**
   * 盲盒配置
   */
  blindbox?: {
    /**
     * 是否开启该功能
     */
    enable?: boolean
  }
}
