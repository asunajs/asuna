---
title: 阿里云盘
description: 阿里云盘使用文档
sidebar:
  order: 2
---

## Node.js 依赖名

[`@asunajs/alipan`](https://www.npmjs.com/package/@asunajs/alipan)

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
