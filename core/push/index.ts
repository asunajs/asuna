import type {
  ApiData,
  ApiOptions,
  Bark,
  Method,
  TgBot,
  TwoIm,
  WorkWeixin,
  WorkWeixinBot,
} from './types.js'

export * from './types.js'

async function _send(
  { logger, http }: ApiOptions,
  name = '自定义消息',
  options: Record<string, any>,
) {
  try {
    const requestOptions: Record<string, any> = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
      ...options,
    }
    if (Reflect.has(options, 'data') && Reflect.has(options.data, 'agent')) {
      requestOptions.agent = options.data.agent
      delete options.data.agent
    }
    const data = await http.fetch(requestOptions)
    const { errcode, code, err } = data
    if (errcode || err || ![0, 200, undefined].some((c) => code === c)) {
      return logger.error(`${name}发送失败`, JSON.stringify(data))
    }
    logger.info(`${name}已发送！`)
  } catch (error) {
    logger.info(`${name}发送失败: ${error.message}`)
  }
}

export async function customPost(
  { logger, http }: ApiOptions,
  apiTemplate: ApiData,
  title: string,
  text: string,
) {
  try {
    if (!apiTemplate || !apiTemplate.url) return
    const { data, timeout, headers } = apiTemplate
    const method: Method = (apiTemplate.method.toUpperCase() ||
      'POST') as Method
    const options: any = {
      method: method,
      timeout,
      headers,
      url: '',
    }
    options.url = apiTemplate.url
      .replace('{title}', encodeURIComponent(title))
      .replace('{text}', encodeURIComponent(text))
    // 处理data
    if (data && Object.keys(data).length) {
      const str = JSON.stringify(data)
        .replace(/{title}/g, title)
        .replace(/{text}/g, text)
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
      options.data = JSON.parse(str)
    }
    await http.fetch(options)
    logger.info(`自定义消息已发送！`)
  } catch (error) {
    logger.info(`自定义消息发送失败: ${error.message}`)
    logger.error(error)
  }
}

export async function pushplus(
  apiOption: ApiOptions,
  { token, ...option }: { token: string },
  title: string,
  text: string,
) {
  return _send(apiOption, 'pushplus', {
    url: `http://www.pushplus.plus/send`,
    method: 'POST',
    data: {
      token,
      title,
      content: text,
      ...option,
    },
  })
}

export async function serverChan(
  apiOption: ApiOptions,
  { token, ...option }: { token: string; [x: string]: any },
  title: string,
  text: string,
) {
  return _send(apiOption, 'Server酱', {
    url: `https://sctapi.ftqq.com/${token}.send`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: {
      text: title,
      desp: text,
      ...option,
    },
  })
}

/**
 *
 * @description https://developer.work.weixin.qq.com/document/path/90665#corpid
 */
export async function workWeixin(
  apiOption: ApiOptions,
  {
    msgtype = 'text',
    touser = '@all',
    agentid,
    corpid,
    corpsecret,
    ...option
  }: WorkWeixin,
  title: string,
  text: string,
) {
  try {
    const { access_token } = await apiOption.http.fetch({
      url: `https://qyapi.weixin.qq.com/cgi-bin/gettoken`,
      method: 'POST',
      data: {
        corpid,
        corpsecret,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    return _send(apiOption, '企业微信推送', {
      url: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`,
      data: {
        touser,
        msgtype,
        agentid,
        [msgtype]: {
          content: `${title}\n\n${text}`,
        },
        ...option,
      },
    })
  } catch (error) {
    apiOption.logger.error('企业微信推送失败')
    apiOption.logger.error(error)
  }
}

/**
 *
 * @description https://open.work.weixin.qq.com/help2/pc/14931
 */
export async function workWeixinBot(
  apiOption: ApiOptions,
  { url, msgtype = 'text', ...option }: WorkWeixinBot,
  title: string,
  text: string,
) {
  return _send(apiOption, '企业微信Bot推送', {
    url,
    data: {
      msgtype,
      [msgtype]: {
        centent: `${title}\n\n${text}`,
      },
      ...option,
    },
  })
}

export async function tgBot(
  apiOption: ApiOptions,
  {
    apiHost = 'api.telegram.org',
    token,
    disable_web_page_preview = true,
    agent,
    ...options
  }: TgBot,
  title: string,
  text: string,
) {
  return _send(apiOption, 'Telegram Bot 推送', {
    url: `https://${apiHost}/bot${token}/sendMessage`,
    data: {
      disable_web_page_preview,
      ...options,
      text: `${title}\n\n${text}`,
    },
    agent,
  })
}

/**
 * bark ios 推送
 * https://bark.day.app/
 */

export async function bark(
  apiOption: ApiOptions,
  { key, level = 'passive', ...options }: Bark,
  title: string,
  text: string,
) {
  return _send(apiOption, 'Bark ios 推送', {
    url: `https://api.day.app/${key}`,
    data: {
      body: text,
      title,
      level,
      ...options,
    },
  })
}

/**
 * TwoIm 回逍
 * https://2im.cn/
 */
export async function twoIm(
  apiOption: ApiOptions,
  { key, sid, query, msgtype = 'text', ...options }: TwoIm,
  title: string,
  text: string,
) {
  const urlSearch = new URLSearchParams({ key, sid })
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      urlSearch.append(key, String(value))
    })
  }

  return _send(apiOption, 'Bark ios 推送', {
    url: `https://api.2im.cn/push?${urlSearch.toString()}`,
    data: {
      msgtype,
      content: text,
      title,
      ...options,
    },
  })
}

export function getAllPush() {
  return {
    pushplus,
    serverChan,
    workWeixin,
    workWeixinBot,
    tgBot,
    bark,
    twoIm,
    customPost,
  }
}
