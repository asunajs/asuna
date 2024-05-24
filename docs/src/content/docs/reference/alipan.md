---
title: 阿里云盘
description: 阿里云盘使用文档
sidebar:
  order: 2
---

:::caution[特别说明]
由于官方变更，暂时只支持完成设备间备份（不会自动领取）
:::

## Node.js 依赖名

[`@asunajs/alipan`](https://www.npmjs.com/package/@asunajs/alipan)

## WPS 表名

- `alipan`
- `阿里云盘`

## 使用方法

:::tip[提示]
文档在建设中，精力有限，欢迎 PR
:::

安装

```bash
npm install @asunajs/alipan
```

**注意：** `run` 可选参数，配置文件路径

使用 cjs

```js
const { run } = require('@asunajs/alipan')
;(async () => {
  await run()
})()
```

使用 esm

```js
import { run } from '@asunajs/alipan'

await run()
```

在阿里云函数中使用，其他环境请自行摸索

```js
const { run } = require('@asunajs/alipan')

exports.handler = async function(event, context, callback) {
  callback(null, await run())
}
```

### 青龙面板

[青龙面板](/guides/qinglong/)

## 配置

:::note[提示]
以下部分内容为自动生成，可能存在部分不准确，仅供参考
:::

@include: ../core/alipan/options.md

## refresh_token 获取

1. 打开并登录阿里云盘，https://www.alipan.com/
2. 打开开发者工具 F12
3. 选择控制台/Console
4. 输入 `JSON.parse(localStorage.getItem('token')).refresh_token` 回车就能看到 refresh_token 了
