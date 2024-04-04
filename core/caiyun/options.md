### `auth`

- **类型**: `字符串`

cookie authorization 字段

### `shake`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `false`

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
- **默认值**: `false`

是否开启该功能

#### `digest`

- **类型**: `字符串`

上传文件的 md5，必须为本账号已经上传过的文件的 md5。用于上传视频和图片任务

### `blindbox`

#### `enable`

- **类型**: `布尔值`
- **默认值**: `false`

是否开启该功能

### 示例

```json
{
  "caiyun": [
    {
      "auth": "cohibeo",
      "shake": {
        "enable": false,
        "num": 6093706119610368,
        "delay": 4904536911118336
      },
      "garden": {
        "enable": false,
        "digest": "comedolPOuyASbaGHQCndSBwPqqypmqw"
      },
      "blindbox": {
        "enable": false
      }
    }
  ]
}
```

### 默认值

```json
{
  "shake": {
    "enable": false,
    "num": 15,
    "delay": 2
  },
  "garden": {
    "enable": false
  },
  "blindbox": {
    "enable": false
  }
}
```
