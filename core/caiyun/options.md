### `auth`

- **类型**: `字符串`

cookie authorization 字段

### `shake`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `true`

是否开启该功能

#### `num`

- **类型**: `数字`
- **默认值**: `15`

摇一摇次数

#### `delay`

- **类型**: `数字`
- **默认值**: `2`

每次间隔时间（秒）

### `garden`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `true`

是否开启该功能，需要注意的是果园需要自己去 APP 手动激活一下，否则等待你的全是报错

#### `digest`

- **类型**: `字符串`
- **默认值**: `"202CB962AC59075B964B07152D234B70"`

上传文件的 md5，必须为本账号已经上传过的文件的 md5。用于上传视频和图片任务

### `blindbox`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `false`

是否开启该功能，目前测试中，请不要开启

### 示例

```json
{
  "caiyun": [
    {
      "auth": "terminatio",
      "shake": {
        "enable": false,
        "num": 15,
        "delay": 2
      },
      "garden": {
        "enable": true,
        "digest": "aperteYdymFxytOGTgOnNvBAOupvykEK"
      },
      "blindbox": {
        "enable": true
      }
    }
  ]
}
```

### 默认值

```json
{
  "shake": {
    "enable": true,
    "num": 15,
    "delay": 2
  },
  "garden": {
    "enable": true,
    "digest": "202CB962AC59075B964B07152D234B70"
  },
  "blindbox": {
    "enable": false
  }
}
```
