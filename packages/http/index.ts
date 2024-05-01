import { toLowerCaseHeaders } from '@asign/utils-pure'
import { defu } from 'defu'
import destr from 'destr'
import { type ExtendOptions as GotExtendOptions, got, type Options as GotOptions } from 'got'
import { isPlainObject, merge } from 'lodash-es'
import { CookieJar } from 'tough-cookie'
import { URLSearchParams } from 'url'

export { got }

type MyOptions =
  & Omit<
    & Partial<GotOptions>
    & {
      native?: boolean
      data?: any
      timeout?: number | GotOptions['timeout']
    },
    'body'
  >
  & {
    body?: GotOptions['body'] | Record<string, any>
  }

export function mergeOptions(options: MyOptions, globalOptions: GotExtendOptions) {
  options.headers = toLowerCaseHeaders(options.headers)

  // 新版本 timeout 不是 number 类型
  if (typeof options.timeout === 'number') {
    options.timeout = {
      request: options.timeout,
    }
  }

  /**
   * 最终配置
   */
  const _options = defu(options, globalOptions) as MyOptions

  // 兼容之前的配置，后续删除
  if (_options.data) {
    _options.body = _options.data
    delete _options.data
  }

  if (
    _options.body && _options.headers['content-type'] && _options.headers['content-type'].includes('form-urlencoded')
  ) {
    _options.body = new URLSearchParams(_options.body as any).toString()
  } else if (isPlainObject(options.body)) {
    _options.body = JSON.stringify(options.body)
  }

  return _options
}

export function createRequest(options: GotExtendOptions = {}) {
  const globalOptions = defu(
    options,
    { method: 'POST', timeout: { request: 30000 }, throwHttpErrors: false } as GotExtendOptions,
  )
  globalOptions.headers = toLowerCaseHeaders(globalOptions.headers)

  if (!globalOptions.cookieJar) {
    globalOptions.cookieJar = new CookieJar()
  }

  const api = got.extend(globalOptions)

  async function request<T = any>(options: MyOptions): Promise<T> {
    options = mergeOptions(options, globalOptions)

    const method = options.method.toLowerCase() as typeof options.method
    if (options.native) {
      delete options.native
      return await api[method](options)
    }

    return destr(await api[method](options).text())
  }

  function get<T = any>(url: string, options?: MyOptions) {
    return request<T>({ url, method: 'get', ...options })
  }

  function post<T = any>(url: string, body: MyOptions['body'], options?: MyOptions) {
    return request<T>({ url, method: 'post', body, ...options })
  }

  const http = {
    request,
    get,
    post,
    setOptions(options: GotExtendOptions) {
      options.headers = toLowerCaseHeaders(options.headers)
      merge(globalOptions, options)
      return http
    },
    setHeader(key: string, value: string) {
      globalOptions.headers[key.toLowerCase()] = value
      return http
    },
    setCookie(key: string, value: string, currentUrl: string) {
      ;(globalOptions.cookieJar as CookieJar).setCookieSync(`${key}=${value}`, currentUrl)
      return http
    },
    initCookie(cookieString: string, currentUrl: string) {
      cookieString.split(/;\s?/).filter(Boolean).forEach((cookie) =>
        (globalOptions.cookieJar as CookieJar).setCookieSync(cookie, currentUrl)
      )
    },
    getCookie(currentUrl: string) {
      return (globalOptions.cookieJar as CookieJar).getCookieStringSync(currentUrl)
    },
  }

  return http
}
