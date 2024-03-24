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

### 示例

```json
{
  "caiyun": [
    {
      "auth": "demergo",
      "shake": {
        "enable": false,
        "num": 3761031685865472,
        "delay": 2413749625421824
      },
      "garden": {
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
  }
}
```
