# @asunajs/caiyun

仅供参考，请勿用于非法用途

## 用法

安装

```bash
npm install @asunajs/caiyun
```

**注意：** `run` 可选参数，配置文件路径

使用 cjs

```js
const { run } = require('@asunajs/caiyun');

(async () => {
  await run();
})();
```

使用 esm

```js
import { run } from '@asunajs/caiyun';

await run();
```

在阿里云函数中使用，其他环境请自行摸索

```js
const { run } = require('@asunajs/caiyun');

exports.handler = async function (event, context, callback) {
  callback(null, await run());
};
```

在青龙面板中使用

```js
const { run } = require('@asunajs/caiyun');
const { resolve } = require('path');

(async () => {
  await run(resolve(process.cwd(), './asign.json')); // 按需修改路径
})();
```

## 配置文件

与 js 文件同目录的 `asign.json` 文件

```json
{
  "caiyun": [
    {
      "token": "登录帐号的 authorization，从<https://yun.139.com/>的 COOKIE 或其它端主页抓取（'可以'删除开头的 `Basic `，直接 `cG` 开头）",
      "phone": "登录帐号的手机号 ",
      "auth": "（可选）登录账号的 auth_token，从<https://yun.139.com/>的 COOKIE 或 PC 客户端获取"
    }
  ]
}
```

## 环境变量

- ASIGN_CAIYUN_TOKEN：登录帐号的 authorization，从<https://yun.139.com/>的 COOKIE 或其它端主页抓取（'可以'删除开头的 `Basic `，直接 `cG` 开头）
- ASIGN_CAIYUN_PHONE：登录帐号的手机号
- ASIGN_CAIYUN_AUTH: （可选）登录账号的 auth_token，从<https://yun.139.com/>的 COOKIE 或 PC 客户端获取

## 开发进度

- [x] 云盘每日签到
- [x] 公共号每日签到
- [x] 公众号抽奖
- [x] 每日任务-上传
- [x] 每日任务-云笔记
- [x] APP 抽奖
- [ ] 浇水种树-云盘 APP
- [ ] 浇水种树-邮箱 APP
- [ ] 每月任务-邮箱 APP-可直接完成的
