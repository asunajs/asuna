## 邮箱配置

### `pass`

- **类型**: `字符串`

邮箱密码/授权码

### `from`

- **类型**: `字符串`

发件人邮箱

### `port`

- **类型**: `数字`
- **默认值**: `465`

端口

### `host`

- **类型**: `字符串`

邮箱服务器

### `to`

- **类型**: `字符串`

收件人邮箱，默认发件人

### 示例

```json
{
  "email": {
    "pass": "carus",
    "from": "Wilton43@example.com",
    "port": 465,
    "host": "id",
    "to": "Loraine_Lemke97@example.org"
  }
}
```

### 默认值

```json
{
  "email": {
    "port": 465
  }
}
```

## 自定义配置

### `method`

- **类型**: `字符串`
- **默认值**: `"POST"`

请求方法

### `url`

- **类型**: `字符串`

请求地址

### `headers`

### `body`

### `timeout`

- **类型**: `数字`

超时时间

### 示例

```json
{
  "customPost": {
    "method": "PATCH",
    "url": "https://royal-suggestion.info",
    "headers": {
      "cuppedia": "vestrum"
    },
    "body": {
      "strenuus": "tam"
    },
    "timeout": 7879751639236608
  }
}
```

### 默认值

```json
{
  "customPost": {
    "method": "POST",
    "headers": {},
    "body": {}
  }
}
```

## 企业微信 App 配置

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### `touser`

- **类型**: `字符串`
- **默认值**: `"@all"`

接收人

### `agentid`

- **类型**: `数字`

### `corpsecret`

- **类型**: `字符串`

### `corpid`

- **类型**: `字符串`

### 示例

```json
{
  "workWeixin": {
    "msgtype": "text",
    "touser": "@all",
    "agentid": 3385496287838208,
    "corpsecret": "vereor",
    "corpid": "error"
  }
}
```

### 默认值

```json
{
  "workWeixin": {
    "msgtype": "text",
    "touser": "@all"
  }
}
```

## 企业微信机器人配置

### `url`

- **类型**: `字符串`

机器人 webhook

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### 示例

```json
{
  "workWeixinBot": {
    "url": "https://gleeful-spec.biz",
    "msgtype": "text"
  }
}
```

### 默认值

```json
{
  "workWeixinBot": {
    "msgtype": "text"
  }
}
```

## Bark 配置

### `key`

- **类型**: `字符串`

### `level`

- **类型**: `字符串`
- **默认值**: `"passive"`

消息等级

### 示例

```json
{
  "bark": {
    "key": "acquiro",
    "level": "passive"
  }
}
```

### 默认值

```json
{
  "bark": {
    "level": "passive"
  }
}
```

## 回逍配置

### `key`

- **类型**: `字符串`

### `sid`

- **类型**: `字符串`

### `query`

#### `plat`

- **类型**: `字符串`

#### `group`

- **类型**: `字符串`

#### `icon`

- **类型**: `string,number`

推送 icon，详见其文档

### `msgtype`

- **类型**: `字符串`
- **默认值**: `"text"`

消息类型

### 示例

```json
{
  "twoIm": {
    "key": "cras",
    "sid": "comptus",
    "query": {
      "plat": "templum",
      "group": "deprecator",
      "icon": 4487967120818176
    },
    "msgtype": "text"
  }
}
```

### 默认值

```json
{
  "twoIm": {
    "query": {},
    "msgtype": "text"
  }
}
```

## ServerChan 配置

### `token`

- **类型**: `字符串`

### 示例

```json
{
  "serverChan": {
    "token": "desidero"
  }
}
```

### 默认值

```json
{
  "serverChan": {}
}
```

## Telegram 配置

### `apiHost`

- **类型**: `字符串`
- **默认值**: `"api.telegram.org"`

api 地址，默认官方地址，如果你有镜像 api 可以在此配置

### `token`

- **类型**: `字符串`

### `chat_id`

- **类型**: `string,number`

### `disable_web_page_preview`

- **类型**: `布尔值`
- **默认值**: `true`

### `proxy`

- **类型**: `字符串`

代理地址，例如 `http://127.0.0.1:10809` ，当然也可以使用验证，如 `http://catlair:passwd@127.0.0.1:10809`

### `agent`

- **类型**: `undefined`

### 示例

```json
{
  "tgBot": {
    "apiHost": "api.telegram.org",
    "token": "voluptas",
    "chat_id": 6476868762992640,
    "disable_web_page_preview": true,
    "proxy": "https://outrageous-balloon.biz"
  }
}
```

### 默认值

```json
{
  "tgBot": {
    "apiHost": "api.telegram.org",
    "disable_web_page_preview": true
  }
}
```

## PushPlus 配置

### `token`

- **类型**: `字符串`

### 示例

```json
{
  "pushplus": {
    "token": "ver"
  }
}
```

### 默认值

```json
{
  "pushplus": {}
}
```
