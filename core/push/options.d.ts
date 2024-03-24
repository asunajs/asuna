/**
 * 邮箱配置
 */
export interface Email {
  /**
   * 邮箱密码/授权码
   */
  pass: string
  /**
   * 发件人邮箱
   */
  from: string
  /**
   * 端口
   */
  port?: number
  /**
   * 邮箱服务器
   */
  host: string
  /**
   * 收件人邮箱，默认发件人
   */
  to?: string
}

/**
 * 自定义配置
 */
export interface CustomPost {
  /**
   * 请求方法
   */
  method?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
  /**
   * 请求地址
   */
  url: string
  /**
   * 请求头
   */
  headers?: {
    [k: string]: string
  }
  /**
   * 请求体
   */
  body?: {
    [k: string]: string
  }
  /**
   * 超时时间
   */
  timeout?: number
}

/**
 * 企业微信 App 配置
 */
export interface WorkWeixin {
  /**
   * 消息类型
   */
  msgtype?: 'text' | 'markdown' | 'textcard' | 'mpnews'
  /**
   * 接收人
   */
  touser?: string
  agentid?: number
  corpsecret?: string
  corpid?: string
  [k: string]: unknown
}

/**
 * 企业微信机器人配置
 */
export interface WorkWeixinBot {
  /**
   * 机器人 webhook
   */
  url: string
  /**
   * 消息类型
   */
  msgtype?: 'text' | 'markdown'
  [k: string]: unknown
}

/**
 * Bark 配置
 */
export interface Bark {
  key: string
  /**
   * 消息等级
   */
  level?: 'passive' | 'timeSensitive' | 'active'
  [k: string]: unknown
}

/**
 * 回逍配置
 */
export interface TwoIm {
  key: string
  sid: string
  query: {
    plat?: string
    group?: string
    /**
     * 推送 icon，详见其文档
     */
    icon?: string | number
  }
  /**
   * 消息类型
   */
  msgtype?: 'text' | 'markdown'
  [k: string]: unknown
}

/**
 * ServerChan 配置
 */
export interface ServerChan {
  token: string
  [k: string]: unknown
}

/**
 * Telegram 配置
 */
export interface TgBot {
  /**
   * api 地址，默认官方地址，如果你有镜像 api 可以在此配置
   */
  apiHost?: string
  token: string
  chat_id: string | number
  disable_web_page_preview?: boolean
  /**
   * 代理地址，例如 `http://127.0.0.1:10809` ，当然也可以使用验证，如 `http://catlair:passwd@127.0.0.1:10809`
   */
  proxy?: string
  agent?: unknown
  [k: string]: unknown
}

/**
 * PushPlus 配置
 */
export interface Pushplus {
  token: string
  [k: string]: unknown
}
