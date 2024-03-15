# @asunajs/alipan

仅供参考，请勿用于非法用途

## 用法

安装

```bash
npm install @asunajs/alipan
```

**注意：** `run` 可选参数，配置文件路径

使用 cjs

```js
const { run } = require('@asunajs/alipan');

(async () => {
  await run();
})();
```

使用 esm

```js
import { run } from '@asunajs/alipan';

await run();
```

在阿里云函数中使用，其他环境请自行摸索

```js
const { run } = require('@asunajs/alipan');

exports.handler = async function (event, context, callback) {
  callback(null, await run());
};
```

在青龙面板中使用

```js
const { run } = require('@asunajs/alipan');
const { resolve } = require('path');

(async () => {
  await run(resolve(process.cwd(), './asign.json')); // 按需修改路径

  // 或者默认路径
  // await run();
})();
```

## 配置文件

与 js 文件同目录的 `asign.json` 文件

```json
{
  "alipan": [
    {
      "token": "refreshToken"
    }
  ]
}
```

## 开发进度

- [x] 时光设备间
- [x] 每日签到
- [x] 每日任务
- [ ] 提交数据/文件/设备 随机化。暂时不考虑，除非有人用并提出整个需求
- [ ] 推送。暂时不考虑，除非有人用并提出整个需求
