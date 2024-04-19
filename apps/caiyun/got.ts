import { destr } from 'destr'
import { type ExtendOptions, got, type Options } from 'got'

type MyOptions = Options & {
  native?: boolean
}

function stringify(value: any) {
  if (Buffer.isBuffer(value) || typeof value !== 'object') {
    return value
  }
  return JSON.stringify(value)
}

export function createRequest(options: ExtendOptions = {}) {
  const api = got.extend(options)

  return {
    async get<T = any>(url: string, options?: MyOptions): Promise<T> {
      if (options && options.native) {
        delete options.native
        return await api.get(url, options) as T
      }
      // @ts-ignore
      return destr(await api.get(url, options).text())
    },
    async post<T = any>(
      url: string,
      body?: any,
      options?: MyOptions,
    ): Promise<T> {
      options || (options = {} as MyOptions)
      const _options = {
        ...options,
        body: stringify(body),
      }
      if (_options.native) {
        delete _options.native
        return await api.post(url, _options) as T
      }
      return destr(
        await api.post(url, _options).text(),
      )
    },
    async request<T = any>(options?: MyOptions): Promise<T> {
      options || (options = {} as MyOptions)
      options.body = stringify(options.body)
      return await api(options) as T
    },
  }
}
