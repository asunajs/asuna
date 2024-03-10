---
title: 中国移动云盘
description: 中国移动云盘使用文档
---

## 当前支持功能

- [x] 云盘每日签到
- [x] 公共号每日签到
- [x] 公众号抽奖
- [x] 每日任务-上传
- [x] 每日任务-云笔记
- [x] APP 抽奖（摇一摇）
- [x] 浇水种树-云盘 APP（需要上传的未实现）
- [x] 浇水种树-邮箱 APP
- [x] 每月任务-邮箱 APP-可直接完成的
- [x] 热门任务-分享文件每月 7 次
- [x] 邮箱 APP 开盲盒
- [ ] 每月任务-PC 端登录

## 使用方法

:::tip[提示]
文档在建设中，精力有限，欢迎 PR
:::

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

### 青龙面板

1. 在脚本管理里新建一个文件，`名字随意.js`，例如：`asign_caiyun.js`
2. 复制以下代码

```js
const caiyun = require('@asunajs/caiyun');
const { resolve } = require('path');

(async () => {
  await caiyun.run(resolve(process.cwd(), './asign.json5')); // 按需修改路径
})();
```

3. 在脚本管理里新建一个文件，`asign.json`，（也可以是其他，但是得修改上面得运行代码），配置文件内容参考 [配置文件](#配置文件)

## 配置文件

与 js 文件同目录的 `asign.json` 文件

```json
{
  "caiyun": [
    {
      "token": "登录帐号的 authorization，从<https://yun.139.com/>的 COOKIE 或其它端主页抓取（'可以'删除开头的 `Basic `，直接 `cG` 开头）",
      "phone": "登录帐号的手机号 ",
      "auth": "（可选）登录账号的 auth_token，从<https://yun.139.com/>的 COOKIE 或 PC 客户端获取",
      "shake": {
        "enable": false,
        "num": 15,
        "delay": 2
      },
      "garden": {
        "enable": false
      }
    }
  ]
}
```
