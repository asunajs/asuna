# asign

AirScript Sign

## 功能支持

默认实现普通的 Node.js （一般情况下兼容青龙/云函数）和金山文档环境的支持，其他平台如有特殊需求会添加。

- alipan 阿里云盘
  - [ ] qinglong 青龙面板（可刷新 token）
  - [x] 普通 Node.js 环境
  - [ ] 云函数（可刷新 token）
  - [x] wps （语法转换，可刷新 token）
- caiyun 移动云盘
  - [x] 普通 Node.js 环境
  - [x] wps （语法转换）
- bilicomic 哔哩漫画
  - [ ] 普通 Node.js 环境
  - [ ] wps （语法转换）

## 金山文档开发说明

- 不支持 class，本项目并不推荐~~甚至禁用~~ class，即使不是 wps，故无所谓
- 不支持可选链，尽量避免使用，但不禁止，wps 通过 `transform-optional-chaining` 转换
- 不完全支持对象属性简写（不支持对象中的方法简写），通过 `transform-shorthand-properties` 转换
- 请求不支持端口，故非默认端口的任务只能放弃
- 请求头 `content-type` 中不能使用 `charset=UTF-8`，例如 `application/json;charset=UTF-8`，使用文本替换转换
- `console.log` 不支持输出 `Error` 等对象，需要通过 `JSON.stringify` / `error.message` 转为字符串。编写代码时需要注意，转换为 wps 代码时通过代码替换转换 `error.message`，普通对象暂无处理
- 不能直接赋值 `console.info` 而需要 `(...args) => console.info(...args)`
- 不支持 new Promise （SyntaxError:Unexpected token）
- 不支持 new Function （EvalError:Code generation from strings disallowed for this context）
- 不支持 Array.from 的第二个参数，不管写的什么，都是填充 `{}`
- 与 EcamaScript 完全不一致的 Array.prototype 循环类方达，但至今不知道怎么才能复现，fuck。
- 响应类型不支持 `text/plain` Error `unsupported body type: text/plain`。这简直是大坑

## 目录说明

- `core`：签到 api 和主要逻辑、主要功能，且与运行平台无关，纯 `ECMAScript`
- `build`：放置 build 脚本，例如转换 `core` 代码到 wps
- `packages`：NodeJS 环境代码，例如发布到 npm 的 `@asunajs/caiyun`
- `wps`：wps 环境代码
