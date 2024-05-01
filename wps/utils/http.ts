import { isPlainObject, toLowerCaseHeaders } from '@asign/utils-pure'
import { createCookieJar } from './cookie.js'

import type { RequestOption } from './airtscript.d.js'

interface MyOptions extends RequestOption {
  native?: boolean
  data?: any
  responseType?: 'json' | 'text' | 'buffer'
  hooks?: {
    beforeRequest?: (options: MyOptions) => MyOptions
  }
  cookieJar?: ReturnType<typeof createCookieJar>
  url?: string
}

function destr(str: string) {
  try {
    return JSON.parse(str)
  } catch {
    return str
  }
}

/**
 * 将 obj 转为 xx=yy 的字符串
 * @param obj
 */
function stringify(obj: any) {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return key + '=' + value.join(',')
      }
      return `${key}=${value}`
    })
    .join('&')
}

function mergeOptions(options: MyOptions, globalOptions: MyOptions) {
  options.headers = toLowerCaseHeaders(options.headers) as any

  const newHeaders = {
    ...globalOptions.headers,
    ...options.headers,
  }

  const _options = {
    ...globalOptions,
    ...options,
    headers: newHeaders,
  }

  // 兼容之前的配置，后续删除
  if (_options.data) {
    _options.body = _options.data
    delete _options.data
  }

  if (
    _options.body && _options.headers['content-type'] && _options.headers['content-type'].includes('form-urlencoded')
  ) {
    _options.body = encodeURI(stringify(_options.body))
  } else if (isPlainObject(options.body)) {
    _options.body = JSON.stringify(options.body)
  }

  return _options
}

export function createRequest(options: MyOptions = {}) {
  options.headers = toLowerCaseHeaders(options.headers) as any
  if (options.headers['user-agent']) {
    options.headers['user-agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
  }
  const globalOptions: MyOptions = {
    method: 'POST',
    timeout: 30000,
    ...options,
  }

  if (!globalOptions.cookieJar) {
    globalOptions.cookieJar = createCookieJar()
  }

  const request = (options: MyOptions) => {
    options = mergeOptions(options, globalOptions)

    const hooks = options.hooks || {}

    if (hooks.beforeRequest) {
      options = hooks.beforeRequest(options)
    }

    if (options.cookieJar) {
      options.headers.cookie = options.cookieJar.getCookieString()
    }

    const resp = HTTP.fetch(options.url, options)

    const respHeaders = resp.headers
    globalOptions.cookieJar.setCookies(respHeaders['set-cookie'])

    if (options.native) {
      return resp
    }

    switch (options.responseType) {
      case 'buffer':
        return resp.binary()
      case 'text':
        return resp.text()
      default:
        return destr(resp.text())
    }
  }

  const get = (url: string, options: MyOptions = {}) => {
    return request({
      ...options,
      method: 'GET',
      url,
    })
  }

  const post = (url: string, body: MyOptions['body'], options: MyOptions = {}) => {
    return request({
      body,
      ...options,
      method: 'POST',
      url,
    })
  }

  const http = {
    request,
    get,
    post,
    setOptions(options: MyOptions) {
      options.headers = toLowerCaseHeaders(options.headers) as any
      globalOptions.headers = {
        ...globalOptions.headers,
        ...options.headers,
      }
      if (options.timeout) {
        globalOptions.timeout = options.timeout
      }
      if (options.cookieJar) {
        globalOptions.cookieJar = options.cookieJar
      }
      return http
    },
    setHeader(key: string, value: string) {
      globalOptions.headers[key.toLowerCase()] = value
      return http
    },
    setCookie(key: string, value: string, currentUrl?: string) {
      globalOptions.cookieJar.setCookies([`${key}=${value}`])
      return http
    },
  }

  return http
}
