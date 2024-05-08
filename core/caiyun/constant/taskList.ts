// 邮箱支持的任务列表
export const emailTaskList = {
  /**
   * 从固定入口签到
   */
  1005: {
    id: 1005,
    group: 'time',
  },
  /**
   * 去“发现广场”浏览精彩内容
   */
  1008: {
    id: 1008,
    group: 'month',
  },

  /**
   * 前往“云盘”查看个人动态
   */
  1009: {
    id: 1009,
    group: 'month',
  },

  /**
   * 浏览限免影视大片
   */
  1010: {
    id: 1010,
    group: 'month',
  },

  /**
   * 查看“我的附件”
   */
  1013: {
    id: 1013,
    group: 'month',
  },

  /**
   * 体验“PDF转换”功能
   */
  1014: {
    id: 1014,
    group: 'month',
  },

  /**
   * 体验“云笔记”功能
   */
  1016: {
    id: 1016,
    group: 'month',
  },

  /**
   * 登录移动云盘APP云朵中心
   */
  1017: {
    id: 1017,
    group: 'month',
  },

  /** 月月开通 月月有礼 */
  1021: {
    id: 1021,
    group: 'month',
    runner: true,
  },
}

// 移动云盘支持的任务列表
export const cloudTaskList = {
  /**
   * 手动上传一个文件
   */
  106: {
    id: 106,
    runner: true,
    group: 'day',
  },

  /**
   * 创建一篇云笔记
   */
  107: {
    id: 107,
    runner: true,
    group: 'day',
  },

  /**
   * 当月上传容量满1G
   */
  110: {
    id: 110,
    runner: true,
    group: 'month',
  },

  /**
   * 使用PC客户端
   */
  113: {
    id: 113,
    group: 'month',
  },

  /**
   * 浏览APP-我的-活动中心
   */
  115: {
    id: 115,
    group: 'month',
  },

  /**
   * 从固定入口访问云朵中心
   */
  409: {
    id: 409,
    group: 'month',
  },

  /**
   * 去发现频道看大片
   */
  426: {
    id: 426,
    group: 'month',
  },

  /**
   * 使用移动云手机
   */
  431: {
    id: 431,
    group: 'month',
  },

  /**
   * 分享文件有好礼
   */
  434: {
    id: 434,
    runner: undefined,
    group: 'day',
  },

  /**
   * 体验云盘AI功能
   */
  435: {
    id: 435,
    group: 'month',
  },
}

export const hotTaskList = {
  /**
   * 分享文件有好礼
   */
  434: {
    id: 434,
    group: 'time',
  },

  /**
   * 去中国移动APP领好礼
   */
  447: {
    id: 447,
    group: 'time',
  },
}

export const TASK_LIST = {
  ...emailTaskList,
  ...cloudTaskList,
  ...hotTaskList,
} as {
  [id: number]: {
    id: number
    group: 'day' | 'month' | 'time'
    runner?: any
  }
}

/**
 * 需要跳过的任务
 */
export const SKIP_TASK_LIST = [
  /** 邀请新用户 */ 117,
  /** 邀请好友看电影 */ 437,
  /** 组团领现金 */ 991,
  /** 开启通知领云朵 */ 406,
  /** 月月备份领好礼 */ 385,
  /** 30G流量0元领 */ 120,
]
