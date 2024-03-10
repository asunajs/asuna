---
title: 推送配置
description: 推送配置
---

推送配置在配置文件中，形式如下，其他字段忽略，与你实际功能有关，功能指南中会说明，这里只需要关注 `message` 这一个字段即可，例如这个例子就是配置了邮箱（email）推送，且仅在有错误日志时才推送。

```json
{
  "caiyun": [],
  "alipan": [],
  "message": {
    "email": {
      "pass": "xxxxxxxxxxxx",
      "from": "xxxxxx@163.com",
      "host": "smtp.163.com",
      "to": "xxx@mht.com"
    },
    "workWeixin": {
      "corpid": "ww4xxxxxxxxxxxxc12",
      "corpsecret": "NBMUW4fxxxxxxxxxxxxxxxxxxxxxu2roo",
      "touser": "cxxxxxxxxxt",
      "agentid": 1008611266666,
      "msgtype": "markdown"
    },
    "pushplus": {
      "token": ""
    },
    "onlyError": true
  }
}
```

:::caution
文档在建设中，以下内容看不到就算了，你可可以对照一个这里的邮箱配置
:::

## 邮箱

`email`

```typescript
export interface Email {
  pass: string;
  from: string;
  port?: number;
  host: string;
  to?: string;
}
```

## Telegram

`tgBot`

```typescript
export interface TgBot {
  apiHost?: string;
  token: string;
  chat_id: string | number;
  disable_web_page_preview?: boolean;
  proxy?: string;
  agent?: any;
  [x: string]: any;
}
```

## 企业微信

`workWeixin`

```typescript
export interface WorkWeixin {
  msgtype: 'text' | 'markdown' | 'textcard' | 'mpnews';
  touser: string;
  agentid: number;
  corpsecret: string;
  corpid: string;
  [x: string]: any;
}
```

## 企业微信 Bot

`workWeixinBot`

```typescript
export interface WorkWeixinBot {
  url: string;
  msgtype: 'text' | 'markdown';
  [x: string]: any;
}
```

## ServerChan

`serverChan`

```typescript
export interface ServerChan {
  toekn: string;
  [x: string]: any;
}
```

## PushPlus

`pushplus`

```typescript
export interface PushPlus {
  token: string;
  [x: string]: any;
}
```
