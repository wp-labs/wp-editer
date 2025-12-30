# OML 函数参考

本文档详细介绍 OML 中所有可用的内置函数和管道函数。

## 目录

1. [内置函数 (Builtin Functions)](#内置函数-builtin-functions)
   - [Now 命名空间](#now-命名空间)
2. [管道函数 (Pipe Functions)](#管道函数-pipe-functions)
   - [编码函数](#编码函数)
   - [转义函数](#转义函数)
   - [时间函数](#时间函数)
   - [数据访问函数](#数据访问函数)
   - [转换函数](#转换函数)
   - [控制函数](#控制函数)

---

## 内置函数 (Builtin Functions)

内置函数可以直接在赋值表达式中使用，不需要 `pipe` 关键字。

### Now 命名空间

获取当前时间相关的函数。

#### `Now::time()`

获取当前时间。

**返回类型**: `time`

**示例**:
```oml
occur_time : time = Now::time() ;
```

#### `Now::date()`

获取当前日期，格式为 `YYYYMMDD` 的整数。

**返回类型**: `digit`

**示例**:
```oml
today : digit = Now::date() ;
# 输出示例: 20251225
```

#### `Now::hour()`

获取当前时间精确到小时，格式为 `YYYYMMDDHH` 的整数。

**返回类型**: `digit`

**示例**:
```oml
current_hour : digit = Now::hour() ;
# 输出示例: 2025122515
```

---

## 管道函数 (Pipe Functions)

管道函数通过 `pipe` 关键字和 `|` 操作符链式调用。

```oml
result = pipe read(field) | function1 | function2(param) ;
```

---

### 编码函数

#### `base64_encode`

将字符串进行 Base64 编码。

**语法**: `base64_encode`

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
encoded = pipe read(payload) | base64_encode ;
# "hello" -> "aGVsbG8="
```

#### `base64_decode`

将 Base64 编码的字符串解码。

**语法**: `base64_decode` | `base64_decode(<encoding>)`

**参数**:
- `encoding` (可选): 解码后的字符编码，支持 `Utf8`（默认）、`Imap`（IMAP 变体，处理非 ASCII 字符）

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
# 标准 UTF-8 解码
decoded = pipe read(data) | base64_decode ;
decoded = pipe read(data) | base64_decode(Utf8) ;

# IMAP 变体解码（处理二进制/非 ASCII 数据）
raw = pipe read(binary_data) | base64_decode(Imap) ;
```

---

### 转义函数

#### `html_escape`

对 HTML 特殊字符进行转义。

**语法**: `html_escape`

**输入**: `chars`
**输出**: `chars`

**转义规则**:
- `<` → `&lt;`
- `>` → `&gt;`
- `&` → `&amp;`
- `"` → `&quot;`
- `'` → `&#x27;`

**示例**:
```oml
safe_html = pipe read(user_input) | html_escape ;
# "<script>" -> "&lt;script&gt;"
```

#### `html_unescape`

将 HTML 实体还原为原始字符。

**语法**: `html_unescape`

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
original = pipe read(escaped_html) | html_unescape ;
# "&lt;div&gt;" -> "<div>"
```

#### `json_escape`

对 JSON 字符串中的特殊字符进行转义。

**语法**: `json_escape`

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
json_safe = pipe read(text) | json_escape ;
# 转义引号、反斜杠、控制字符等
```

#### `json_unescape`

将 JSON 转义序列还原为原始字符。

**语法**: `json_unescape`

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
original = pipe read(escaped_json) | json_unescape ;
```

#### `str_escape`

对字符串中的特殊字符进行转义（主要是引号和反斜杠）。

**语法**: `str_escape`

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
escaped = pipe read(raw_string) | str_escape ;
# 'hello"world' -> 'hello\"world'
```

---

### 时间函数

#### `Time::to_ts`

将时间转换为 Unix 时间戳（秒）。

**语法**: `Time::to_ts`

**输入**: `time`
**输出**: `digit`

**示例**:
```oml
timestamp = pipe read(occur_time) | Time::to_ts ;
# 2000-10-10 00:00:00 -> 971107200
```

#### `Time::to_ts_ms`

将时间转换为 Unix 时间戳（毫秒）。

**语法**: `Time::to_ts_ms`

**输入**: `time`
**输出**: `digit`

**示例**:
```oml
timestamp_ms = pipe read(occur_time) | Time::to_ts_ms ;
# 2000-10-10 00:00:00 -> 971107200000
```

#### `Time::to_ts_us`

将时间转换为 Unix 时间戳（微秒）。

**语法**: `Time::to_ts_us`

**输入**: `time`
**输出**: `digit`

**示例**:
```oml
timestamp_us = pipe read(occur_time) | Time::to_ts_us ;
# 2000-10-10 00:00:00 -> 971107200000000
```

#### `Time::to_ts_zone`

将时间转换为指定时区的 Unix 时间戳。

**语法**: `Time::to_ts_zone(<timezone_offset>, <unit>)`

**参数**:
- `timezone_offset`: 时区偏移（小时），如 `0` 表示 UTC，`8` 表示 UTC+8
- `unit`: 时间戳单位
  - `s` 或 `ss`: 秒
  - `ms`: 毫秒
  - `us`: 微秒

**输入**: `time`
**输出**: `digit`

**示例**:
```oml
# UTC 时间戳（秒）
utc_ts = pipe read(occur_time) | Time::to_ts_zone(0, ss) ;

# UTC+8 时间戳（毫秒）
beijing_ts_ms = pipe read(occur_time) | Time::to_ts_zone(8, ms) ;

# UTC 时间戳（微秒）
utc_ts_us = pipe read(occur_time) | Time::to_ts_zone(0, us) ;
```

---

### 数据访问函数

#### `nth`

获取数组中指定索引的元素。

**语法**: `nth(<index>)`

**参数**:
- `index`: 数组索引（从 0 开始）

**输入**: `array`
**输出**: 数组元素类型

**示例**:
```oml
first_item = pipe read(items) | nth(0) ;
third_item = pipe read(items) | nth(2) ;
```

#### `get`

获取对象中指定路径的值。

**语法**: `get(<path>)`

**参数**:
- `path`: 对象路径，使用 `/` 分隔嵌套层级

**输入**: `obj`
**输出**: 字段值类型

**示例**:
```oml
# 获取嵌套对象的值
name = pipe read(user) | get(profile/name) ;

# 结合 nth 使用
first_name = pipe read(users) | nth(0) | get(name) ;
```

#### `path`

从文件路径中提取指定部分。

**语法**: `path(<part>)`

**参数**:
- `part`: 要提取的部分
  - `name`: 文件名（含扩展名）
  - `stem`: 文件名（不含扩展名）
  - `ext`: 扩展名
  - `dir`: 目录路径
  - `parent`: 父目录

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
# 输入: "C:\Users\test\file.txt"
filename = pipe read(file_path) | path(name) ;   # "file.txt"
stem = pipe read(file_path) | path(stem) ;       # "file"
ext = pipe read(file_path) | path(ext) ;         # "txt"
dir = pipe read(file_path) | path(dir) ;         # "C:\Users\test"
```

#### `url`

从 URL 中提取指定部分。

**语法**: `url(<part>)`

**参数**:
- `part`: 要提取的部分
  - `domain`: 域名（不含端口）
  - `host`: 主机（含端口）
  - `path`: 路径
  - `uri`: 完整 URI（路径 + 查询 + 片段）
  - `params`: 查询参数

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
# 输入: "https://api.example.com:8080/v1/users?id=1#section"
domain = pipe read(http_url) | url(domain) ;  # "api.example.com"
host = pipe read(http_url) | url(host) ;      # "api.example.com:8080"
path = pipe read(http_url) | url(path) ;      # "/v1/users"
uri = pipe read(http_url) | url(uri) ;        # "/v1/users?id=1#section"
params = pipe read(http_url) | url(params) ;  # "id=1"
```

#### `sxf_get`

从特定格式的文本中提取字段值（用于解析特殊格式的日志或消息）。

**语法**: `sxf_get(<field_name>)`

**参数**:
- `field_name`: 要提取的字段名

**输入**: `chars`
**输出**: `chars`

**示例**:
```oml
# 从格式化文本中提取字段
status = pipe read(log_line) | sxf_get(statusCode) ;
password = pipe read(log_line) | sxf_get(password) ;
```

---

### 转换函数

#### `to_str`

将值转换为字符串。

**语法**: `to_str`

**输入**: 任意类型
**输出**: `chars`

**示例**:
```oml
ip_str = pipe read(src_ip) | to_str ;
num_str = pipe read(count) | to_str ;
```

#### `to_json`

将值转换为 JSON 字符串。

**语法**: `to_json`

**输入**: 任意类型
**输出**: `chars`

**示例**:
```oml
# 数组转 JSON
ports_json = pipe read(ports) | to_json ;
# [80, 443] -> "[80,443]"

# 对象转 JSON
user_json = pipe read(user) | to_json ;
# {name: "John", age: 30} -> '{"name":"John","age":30}'
```

#### `ip4_to_int`

将 IPv4 地址转换为整数。

**语法**: `ip4_to_int`

**输入**: `ip`
**输出**: `digit`

**示例**:
```oml
ip_int = pipe read(src_ip) | ip4_to_int ;
# 127.0.0.1 -> 2130706433
# 10.0.0.1 -> 167772161
```

---

### 控制函数

#### `skip_empty`

如果输入值为空（空字符串、空数组、零值等），则跳过该字段的输出。

**语法**: `skip_empty`

**输入**: 任意类型
**输出**: 原类型或跳过

**示例**:
```oml
# 如果 optional_field 为空，则不输出 result 字段
result = pipe read(optional_field) | skip_empty ;

# 常用于过滤空数组
items = pipe read(items_array) | skip_empty ;
```

---

## 函数组合示例

### 示例 1: 时间处理

```oml
name : time_processing
---
# 获取当前时间
occur_time : time = Now::time() ;

# 转换为各种时间戳格式
ts_seconds = pipe read(occur_time) | Time::to_ts ;
ts_millis = pipe read(occur_time) | Time::to_ts_ms ;

# 指定时区
ts_utc = pipe read(occur_time) | Time::to_ts_zone(0, ss) ;
ts_beijing = pipe read(occur_time) | Time::to_ts_zone(8, ms) ;
```

### 示例 2: 数据提取与转换

```oml
name : data_extraction
---
# URL 解析
request_host = pipe read(http_url) | url(host) ;
request_path = pipe read(http_url) | url(path) ;

# 文件路径处理
file_name = pipe read(file_path) | path(name) ;
file_ext = pipe read(file_path) | path(ext) ;

# 数组处理
first_port = pipe read(ports) | nth(0) ;
ports_json = pipe read(ports) | to_json ;
```

### 示例 3: 编码与转义

```oml
name : encoding_example
---
# Base64 编解码
encoded_payload = pipe read(raw_data) | base64_encode ;
decoded_data = pipe read(b64_data) | base64_decode ;

# HTML 安全处理
safe_content = pipe read(user_input) | html_escape ;

# JSON 处理
json_safe_str = pipe read(text) | json_escape ;
```

### 示例 4: 链式处理

```oml
name : chained_processing
---
# 从数组中获取第一个元素的特定字段
first_user_name = pipe read(users) | nth(0) | get(name) ;

# 编码后再进行 Base64
encoded_json = pipe read(data) | to_json | base64_encode ;

# IP 转整数后跳过空值
ip_int = pipe read(src_ip) | ip4_to_int | skip_empty ;
```

---

## 版本说明

以下是函数命名的历史变更记录：

| 旧名称 | 新名称 | 说明 |
|--------|--------|------|
| `Time::now` | `Now::time` | 移至 Now 命名空间 |
| `Time::now_date` | `Now::date` | 移至 Now 命名空间 |
| `Time::now_hour` | `Now::hour` | 移至 Now 命名空间 |
| `to_timestamp` | `Time::to_ts` | 移至 Time 命名空间 |
| `to_timestamp_ms` | `Time::to_ts_ms` | 移至 Time 命名空间 |
| `to_timestamp_us` | `Time::to_ts_us` | 移至 Time 命名空间 |
| `to_timestamp_zone` | `Time::to_ts_zone` | 移至 Time 命名空间 |
| `arr_get` | `nth` | 简化命名 |
| `obj_get` | `get` | 简化命名 |
| `path_get` | `path` | 简化命名 |
| `url_get` | `url` | 简化命名 |
| `base64_en` | `base64_encode` | 更清晰的命名 |
| `base64_de` | `base64_decode` | 更清晰的命名 |
| `html_escape_en` | `html_escape` | 简化命名 |
| `html_escape_de` | `html_unescape` | 使用 unescape 更准确 |
| `json_escape_en` | `json_escape` | 简化命名 |
| `json_escape_de` | `json_unescape` | 使用 unescape 更准确 |
| `str_escape_en` | `str_escape` | 简化命名 |
| `skip_if_empty` | `skip_empty` | 简化命名 |
| `to_string` | `to_str` | 简化命名 |
| `to_ip4_int` | `ip4_to_int` | 统一命名风格 |
