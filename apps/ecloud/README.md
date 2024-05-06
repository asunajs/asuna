## 致谢

- 参考：https://github.com/wes-lin/Cloud189Checkin

## 支持功能

- 暂时只能通过手机号密码登录，直接用 token 会 30 天过期，且存在 ip 校验问题（还在观察中）
- 每日签到
- 抽奖 2 次（100M，为啥是 2 次，大家的都是 3 次啊，可以看看这个 https://github.com/wes-lin/Cloud189Checkin/issues/44 第三次抽奖显示成功，但并不会获得空间，而似乎大家都在互相抄代码却没有验证，导致大家的都一样）
- 每日 TV 版签到（获得的空间为家庭空间），来自参考链接的项目，目前论坛好像还没有。
- Node.js 本地运行，其它基于 Node.js 的 Docker 或青龙面板，阿里云函数，腾讯云函数。
- 华为云函数有些区别，正在适配中，暂不可以。

## 开源地址

https://github.com/asunajs/asuna

喜欢可以点个 star，如果不进行二次开发请不要 fork，你看不懂 fork 干毛。

## 文档

文档首页：https://as.js.cool/

天翼云盘介绍：https://as.js.cool/reference/ecloud/

WPS 使用案例：https://as.js.cool/demo/wps/

## WPS 重要说明

使用 WPS 的用户需要注意！！！

值得注意的是，为了更简单的实现登录，用户手机和密码将上传到 `https://as.js.cool/api/ecloud/rsa` 进行加密，该程序在本项目中开源，请自行查看。

但是由于提供服务的 vercel 在本人手中，本人承诺仅使用该开源的代码（保证隐私性，数据不会被记录，无人能查看）。即使这样，我还是能通过更改代码达到记录的效果（因为 vercel 并不一定需要通过 Github 部署，而除我之外没人能看 vercel 的部署日志，所以你并不知道我是否动了手脚），这是一个假设，但存在发生的可能性，即使我承诺。

**在使用前你应该清楚这一点，如果你不理解，请不要使用 wps 。**

**在使用前你应该清楚这一点，如果你不理解，请不要使用 wps 。**

**在使用前你应该清楚这一点，如果你不理解，请不要使用 wps 。**

## Node.js 运行

详见文档，略

或参考我已有的帖子（阿里云盘或移动云盘）

https://www.52pojie.cn/home.php?mod=space&uid=879305&do=thread&view=me&from=space

效果类似于

![本地效果](http://imgsrc.baidu.com/form/pic/item/4034970a304e251f13733ac4e186c9177f3e5302.jpg)

## WPS 运行

![本地效果](http://imgsrc.baidu.com/form/pic/item/b64543a98226cffcd1aa618eff014a90f603ea0f.jpg)

WPS 使用案例：https://as.js.cool/demo/wps/

推送是一致的，不展开说明

表格无需额外设计，在 A 列填写手机号，B 列填写密码

总有人问下面这个问题，统一回复下

1. 他不影响正常使用
2. 请按照上面的文档设计推送表格

```
TypeError:Cannot read properties of null (reading 'UsedRange')
at getPushConfig (caiyun.js:1391:58)
at caiyun.js:1523:29
```

## wps 代码

https://npmmirror.com/package/@asunajs/dist/files?version

选择 ecloud.wps.js

## 关于反馈

由于我不可能每个地方都想到，每个人操作可能也不一样，出现问题很正常

但是我写代码以及很头疼了，所以不要用莫名其妙的问题烦我，比如

- 怎么运行不了啊
- 推送不了
- 出现错误了，怎么办
- ...

而是应该看看文档，尝试寻找答案，实在不行再提出问题（这边推荐 Github 提 issue ，如果没有 Github 的在此评论），你应该这样做

- 感谢分享，已经评分，但是我这里有点问题，wps 运行出现 `properties of null (reading 'UsedRange')` ，已经翻阅文档但是还是没能解决
- 我使用青龙面板 xxx 版本，用了 @asunajs/ecloud 0.0.1 这个包，使用 pushplus 推送时提示 Received values of type Object.怎么办呢，如果提供信息不够详细请回复我，我会追加的
- 已经 star 了，使用 WPS 需要上传到 https://as.js.cool/api/ecloud/rsa，我还是不放心，请问能够在 wps 实现这个功能吗？
- ...

## 核心代码

如果只是想要使用本项目，下面的就不用看了，到头了。

如果需要自行开发，主要是注意 cookie 的管理，这里使用了 arrayMap 替代 Array.prototype.map 是因为有时候在 wps 下这个会返回错误的值，与 JavaScript 标准不一致

```javascript
export function arrayMap(arr, cb) {
  const _arr = []
  for (let i = 0; i < arr.length; i++) {
    _arr.push(cb(arr[i], i, arr))
  }
  return _arr
}


function parseCookie(cookie) {
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

function parseCookies(cookies) {
  return arrayMap(cookies, parseCookie)
}

function stringifyCookies(cookies) {
  return arrayMap(cookies, stringifyCookie).join(';')
}

function stringifyCookie(cookie) {
  const [[, key], [, value]] = Object.entries(cookie)
  return key + '=' + value
}

export function createCookieJar() {
  const _ = {
    store: [] ,
    setCookies(cookieStrings[]) {
      if (!cookieStrings) return
      if (cookieStrings.length === 0) return
      _.store = [..._.store, ...parseCookies(cookieStrings)]
    },
    getCookieString() {
      return stringifyCookies(_.store)
    },
  }

  return _
}
```

cookieJar 的用法。这个 http 有点过度封装了，不过为了和我的 Node.js 版本保持 api 一致，这也是很有必要的。

```javascript
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
```
