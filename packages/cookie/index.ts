import { get, set } from 'lodash-es'

type Storage = {
  [u: string]: Record<string, string>
}

export function createCookieJar() {
  const store: Storage = {}

  const getCookieString = (url = '/') => {
    return [
      ...Object.entries(store['/'] || {}),
      ...Object.entries(store[url] || {}),
    ].map(([k, v]) => `${k}=${v}`).join('; ')
  }

  const setCookie = (rawCookie: string, url = '/') => {
    const kv = rawCookie.split(';')[0]
    if (!kv) return
    const [key, value] = kv.split('=')
    if (!key) return
    if (!store[url]) store[url] = {}
    set(store[url], key, value)
  }

  const setCookieString = (cookieString: string, url = '/') => {
    const cookies = cookieString.split(/;\s?/)
    for (const cookie of cookies) {
      setCookie(cookie, url)
    }
  }

  const getItem = (key: string, url = '/') => {
    return get(store[url], key)
  }

  return {
    getCookieString,
    setCookie,
    setCookieString,
    getItem,
  }
}

export type CookieJar = ReturnType<typeof createCookieJar>
