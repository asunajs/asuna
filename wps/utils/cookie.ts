import { arrayMap } from './utils.js'

type Cookie = {
  key: string
  value: string
  [s: string]: unknown
}

function pareCookie(cookie: string) {
  return cookie.split(/;\s?/).reduce((t, cur, i) => {
    const a = cur.split('=')
    if (a[0] === '') return t
    if (i === 0) {
      return {
        key: a[0],
        value: a[1],
      }
    }
    return {
      ...t,
      [a[0]]: a[1],
    }
  }, {})
}

function pareCookies(cookies: string[]) {
  return arrayMap(cookies, pareCookie)
}

function stringifyCookies(cookies: Cookie[]) {
  return arrayMap(cookies, stringifyCookie).join(';')
}

function stringifyCookie(cookie: Cookie[]) {
  const [[, key], [, value]] = Object.entries(cookie)
  return key + '=' + value
}

export function createCookieJar() {
  const _ = {
    store: [] as Cookie[],
    setCookies(cookieStrings: string[]) {
      if (!cookieStrings) return
      if (cookieStrings.length === 0) return
      _.store = [..._.store, ...pareCookies(cookieStrings)]
    },
    getCookieString() {
      return stringifyCookies(_.store)
    },
  }

  return _
}
