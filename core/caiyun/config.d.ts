export interface Untyped {
  /**
   * cookie authorization 字段
   *
   */
  token: string

  /**
   * 手机号
   *
   */
  phone: string

  /**
   * auth_token
   *
   */
  auth: string

  /**
   * 摇一摇配置
   *
   */
  shake: {
    /**
     * 是否开启该功能
     *
     * @default false
     */
    enable: boolean

    /**
     * 摇一摇次数
     *
     * @default 15
     */
    num: number

    /**
     * 每次间隔时间（秒）
     *
     * @default 2
     */
    delay: number
  }

  /**
   * 果园配置
   *
   */
  garden: {
    /**
     * 是否开启该功能
     *
     * @default false
     */
    enable: boolean
  }
}
