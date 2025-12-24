# WPL 解析示例

本文档整理了 WPL 语言中各种数据解析的示例，包括测试数据、解析规则和预期结果，用于学习和参考。

## 目录

1. [基础类型解析](#基础类型解析)
2. [时间格式解析](#时间格式解析)
3. [网络数据解析](#网络数据解析)
4. [JSON 数据解析](#json-数据解析)
5. [协议解析](#协议解析)
6. [字段管道（Field Pipes）示例](#字段管道field-pipes示例)
7. [复杂组合示例](#复杂组合示例)

## 基础类型解析

### 1. 数字解析

**解析规则**:
```wpl
digit
```

**带名称的数字解析**:
```wpl
digit:length
digit:id
digit:port
```

**测试数据**:
```
200
368
190
34616
```

**预期结果**:
```
length: 200
port: 8080
id: 12345
```

### 2. 字符串解析

**解析规则**:
```wpl
chars
```

**带名称的字符串解析**:
```wpl
chars:dev-name
chars:http/referer
chars:user-agent
```

**测试数据**:
```
nginx-server
https://www.example.com
curl/7.68.0
```

**预期结果**:
```
dev-name: "nginx-server"
http/referer: "https://www.example.com"
user-agent: "curl/7.68.0"
```

### 3. 分隔符解析

**下划线分隔符**:
```wpl
_        # 单个下划线
_^2      # 重复2次
```

**逗号分隔符**:
```wpl
<[,]>    # 逗号分隔
```

**引号分隔符**:
```wpl
"        # 引号
```

**空格分隔符**:
```wpl
' '      # 空格字符
```

**示例用法**:
```wpl
(ip, _^2, time, chars)
```

## 时间格式解析

### 1. CLF (Common Log Format) 时间解析

**解析规则**:
```wpl
time/clf
```

**测试数据**:
```
06/Aug/2019:12:12:19 +0800
```

**预期结果**:
```
2019-08-06 12:12:19  # 转换为标准时间格式
```

**带方括号的时间**:
```
[06/Aug/2019:12:12:19 +0800]
```

**测试示例**:
```wpl
rule test {
    (time/clf)
}
```

### 2. 标准时间格式解析

**解析规则**:
```wpl
time
```

**测试数据示例**:
```
2023-05-15 07:09:12
2023/5/15 15:09:12
```

**预期结果**:
```
time: "2023-05-15 07:09:12"
time: "2023-05-15 15:09:12"
```

## 网络数据解析

### 1. HTTP 请求解析

**解析规则**:
```wpl
http/request
```

**测试数据**:
```
GET /nginx-logo.png HTTP/1.1
```

**预期结果**:
```
http/request: "GET /nginx-logo.png HTTP/1.1"
```

### 2. HTTP 状态码解析

**解析规则**:
```wpl
http/status
```

**测试数据**:
```
200
```

**预期结果**:
```
http/status: 200
```

### 3. HTTP User-Agent 解析

**解析规则**:
```wpl
http/agent
```

**测试数据**:
```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36
```

**预期结果**:
```
http/agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"
```

### 4. URL 解析

**解析规则**:
```wpl
chars:url  # 或直接使用 chars
```

**测试数据**:
```
http://119.122.1.4/
```

**预期结果**:
```
url: "http://119.122.1.4/"
```

### 5. IP 地址解析

**解析规则**:
```wpl
ip
```

**测试数据**:
```
192.168.1.2
```

**预期结果**:
```
ip: 192.168.1.2
```

### 6. Email 解析

**解析规则**:
```wpl
email
```

**测试数据示例**:
```
johnjoke@example.com
user+tag@example-domain.com
first_last@example.com
foo-bar@example.co
```

**预期结果**:
```
email: "johnjoke@example.com"
```

## JSON 数据解析

### 1. 基础 JSON 解析

**解析规则**:
```wpl
rule test {
    (json)
}
```

**测试数据**:
```json
{ "age": 18}
```

**预期结果**:
```
age: 18
```

### 2. 指定字段解析

**解析规则**:
```wpl
rule test {
    (json(chars@path, chars@txt) | str_mode(decoded))
}
```

**测试数据**:
```json
{"path":"c:\\users\\fc\\file","txt":"line1\nline2"}
```

**预期结果**:
```
path: "c:\\users\\fc\\file"
txt: "line1\nline2"  # 包含实际换行符
```

### 3. JSON 字段存在性检查

**解析规则**:
```wpl
rule test {
    (json | exists(age))
}
```

**测试数据**:
```json
{ "age": 18}
```

**预期结果**:
```
age: 18
```

**失败示例**:
```wpl
rule test {
    (json | exists(age1))  # 字段不存在
}
```

### 4. JSON 数值范围检查

**解析规则**:
```wpl
rule test {
    (json | exists_digit(age, 18))
}
```

**测试数据**:
```json
{ "name": "china", "age": 18}
```

**预期结果**:
```
name: "china"
age: 18
```

### 5. JSON 数值列表检查

**解析规则**:
```wpl
rule test {
    (json | exists_digit_in(age, [18, 19]))
}
```

**测试数据**:
```json
{ "name": "china", "age": 18}
```

**预期结果**:
```
name: "china"
age: 18
```

## 协议解析

### 1. Base64 解码

**解析规则**:
```wpl
|decode/base64|
# 或
|base64|
```

**完整示例**:
```wpl
|decode/base64|(digit:id<<,>>,time,sn,chars\:),opt(kv\;), (*kv\,)
```

**测试数据**:
Base64 编码的华为防火墙日志

**预期结果**:
解码后的文本格式日志

### 2. KV 键值对解析

**基础 KV 解析**:
```wpl
kv
```

**带字段名的 KV 解析**:
```wpl
kv(@CID)
```

**测试数据**:
```
CID=0x814f041e;vsys=CSG_Security
```

**预期结果**:
```
CID: "0x814f041e"
vsys: "CSG_Security"
```

### 3. 重复模式解析

**重复固定次数**:
```wpl
12*kv    # 重复12个KV对
2*_      # 重复2个下划线
7*kv     # 重复7个KV对
```

**任意重复**:
```wpl
*kv      # 重复任意次数的KV
```

### 4. 可选字段解析

**可选字段**:
```wpl
opt(kv\;)  # 可选的KV对（以分号结尾）
```

### 5. 转义和引用处理

**字符串解码模式**:
```wpl
|str_mode(decoded)|
```

**取消引用/反转义**:
```wpl
|unquote/unescape|
```

## 字段管道（Field Pipes）示例

字段管道（Field Pipes）是 WPL 的强大特性，允许对解析后的字段进行进一步的处理、验证和转换。管道操作符 `|` 用于链接多个处理步骤。

### 1. 编码解码管道

#### Base64 解码

**解析规则**:
```wpl
rule test {
    (|decode/base64| (digit:id, time, chars:message))
}
```

**测试数据**:
```
SGVsbG8gV29ybGQxMjM0NTY3OjAwOjAwOjAw
```

**预期结果**:
```
id: 1234567
time: "00:00:00"
message: "Hello World"
```

#### Hex 解码

**解析规则**:
```wpl
rule test {
    (|decode/hex| (chars:data))
}
```

**测试数据**:
```
48656c6c6f20576f726c64
```

**预期结果**:
```
data: "Hello World"
```

### 2. 字符串处理管道

#### 反转义/去引号处理

**解析规则**:
```wpl
rule test {
    (|unquote/unescape| (json(chars@path, chars@txt)))
}
```

**测试数据**:
```json
{"path":"c:\\users\\fc\\file","txt":"line1\nline2"}
```

**预期结果**:
```
path: "c:\users\fc\file"  # 反斜杠被正确处理
txt: "line1\nline2"       # 换行符被保留
```

#### 字符串模式切换

**解析规则**:
```wpl
rule test {
    (json(chars@path, chars@txt) | str_mode(decoded))
}
```

**测试数据**:
```json
{"path":"c:\\users\\fc\\file","txt":"line1\nline2"}
```

**预期结果**:
```
path: "c:\\users\\fc\\file"
txt: "line1\nline2"  # 包含实际换行符
```

### 3. 字段验证管道

#### 字段存在性检查

**解析规则**:
```wpl
rule test {
    (json | exists(name))
}
```

**测试数据**:
```json
{"name": "Alice", "age": 25}
```

**预期结果**:
```
name: "Alice"
age: 25
```

**失败示例**:
```wpl
rule test {
    (json | exists(email))  # email 字段不存在
}
```

#### 字符串值检查

**解析规则**:
```wpl
rule test {
    (json | chars_exists(status, "success"))
}
```

**测试数据**:
```json
{"status": "success", "message": "Operation completed"}
```

**预期结果**:
```
status: "success"
message: "Operation completed"
```

#### 字符串不在列表检查

**解析规则**:
```wpl
rule test {
    (json | chars_not_exists(level, "error"))
}
```

**测试数据**:
```json
{"level": "info", "msg": "Normal operation"}
```

**预期结果**:
```
level: "info"
msg: "Normal operation"
```

#### 字符串值范围检查

**解析规则**:
```wpl
rule test {
    (json | chars_in(priority, ["high", "medium"]))
}
```

**测试数据**:
```json
{"priority": "high", "task": "Backup"}
```

**预期结果**:
```
priority: "high"
task: "Backup"
```

### 4. 数值验证管道

#### 数值等于检查

**解析规则**:
```wpl
rule test {
    (json | digit_exists(age, 25))
}
```

**测试数据**:
```json
{"name": "Bob", "age": 25}
```

**预期结果**:
```
name: "Bob"
age: 25
```

#### 数值范围检查

**解析规则**:
```wpl
rule test {
    (json | digit_in(score, [80, 85, 90, 95, 100]))
}
```

**测试数据**:
```json
{"student": "Tom", "score": 90}
```

**预期结果**:
```
student: "Tom"
score: 90
```

### 5. IP 地址验证管道

**解析规则**:
```wpl
rule test {
    (json | ip_in(client_ip, ["192.168.1.0/24", "10.0.0.0/8"]))
}
```

**测试数据**:
```json
{"client_ip": "192.168.1.100", "action": "login"}
```

**预期结果**:
```
client_ip: "192.168.1.100"
action: "login"
```

### 6. 多步骤管道处理

**解析规则**:
```wpl
rule test {
    (|decode/base64| (json | exists_digit(age, 25)) | str_mode(decoded))
}
```

**数据流程**:
1. Base64 解码原始数据
2. 解析 JSON
3. 验证 age 字段等于 25
4. 应用字符串解码模式

**测试数据** (Base64编码):
```
eyJuYW1lIjogIkFsaWNlIiwgImFnZSI6IDI1fQ==
```

**解码后的数据**:
```json
{"name": "Alice", "age": 25}
```

**预期结果**:
```
name: "Alice"
age: 25
```

### 7. 管道与分组结合

**解析规则**:
```wpl
rule test {
    (|decode/base64| (digit:id, chars:name) | (exists(id) & chars_exists(name, "admin")))
}
```

**功能说明**:
- 先进行 Base64 解码
- 解析数字 ID 和字符 name
- 验证 ID 字段存在且 name 等于 "admin"

### 8. 实际应用示例

#### 华为防火墙日志处理

**解析规则**:
```wpl
rule huawei_firewall {
    |decode/base64|
    (digit:id<<,>>, time, sn, chars\:,),
    opt(kv\;),
    (*kv\,)
}
```

**处理流程**:
1. Base64 解码日志数据
2. 解析固定格式的头部（ID、时间、序列号等）
3. 解析可选的键值对
4. 解析多个键值对

#### 带验证的 JSON 解析

**解析规则**:
```wpl
rule api_response {
    (json |
        exists(status_code) &
        digit_in(status_code, [200, 201, 202]) &
        chars_in(result_type, ["success", "partial"])
    )
}
```

**功能说明**:
- 解析 JSON 响应
- 验证 status_code 字段存在
- 验证 status_code 在成功范围内
- 验证 result_type 为成功类型

## 复杂组合示例

### 1. Nginx 访问日志解析

**完整解析规则**:
```wpl
rule nginx_log {
    (ip, _^2, time/clf<[,]>, http/request", http/status, digit:length, chars", http/agent", _")
}
```

**测试数据**:
```
192.168.1.2 - - [06/Aug/2019:12:12:19 +0800] "GET /nginx-logo.png HTTP/1.1" 200 368 "http://119.122.1.4/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" "-"
```

**预期结果**:
```
ip: 192.168.1.2
time: 2019-08-06 12:12:19
http/request: "GET /nginx-logo.png HTTP/1.1"
http/status: 200
length: 368
chars: "http://119.122.1.4/"
http/agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36"
```

### 2. 华为防火墙日志解析

**解析规则**:
```wpl
|decode/base64|(digit:id<<,>>,time,sn,chars\:),opt(kv\;), (*kv\,)
```

**数据流程**:
1. Base64 解码
2. 解析数字 ID
3. 解析时间
4. 解析序列号
5. 解析字符
6. 解析可选的 KV 对
7. 解析多个 KV 对

### 3. JSON 地理位置增强

**解析规则**:
```wpl
rule geo_enhance {
    (json(chars@src-ip +geo(city_name), @dst-ip +zone(zone_name), @dev-name +device(device_val)))
}
```

**功能说明**:
- 解析 JSON 中的 src-ip、dst-ip、dev-name 字段
- 对 IP 地址进行地理位置查询
- 对设备名称进行设备类型识别

### 4. 带管道处理的复杂解析

**多步骤处理**:
```wpl
rule complex_parse {
    (|decode/base64| (json | exists_digit(age, 18)) | str_mode(decoded))
}
```

## WPL 语法要点

### 1. 基本语法结构
```wpl
package package_name {
    rule rule_name {
        (解析表达式)
    }
}
```

### 2. 管道操作符
```wpl
|操作符|  # 应用管道操作
```
常用操作：
- `|decode/base64|` - Base64解码
- `|str_mode(decoded)|` - 字符串解码模式
- `|exists(field)|` - 检查字段存在
- `|exists_digit(field, value)|` - 检查数字字段值
- `|unquote/unescape|` - 取消引用/反转义

### 3. 字段命名
```wpl
类型:字段名    # digit:length
类型@JSON路径  # json(chars@path)
类型+增强     # ip+geo(city_name)
```

### 4. 分组和分隔符
```wpl
(...)         # 分组
<分隔符>      # 指定分隔符
"分隔符"      # 字符串分隔符
_             # 下划线
^N            # 重复N次
```

### 5. 可选和重复
```wpl
opt(表达式)   # 可选匹配
N*表达式      # 重复N次
*表达式      # 任意次数重复
```

### 6. 特殊字符转义
```wpl
\;            # 转义分号
\:            # 转义冒号
\,            # 转义逗号
\\            # 转义反斜杠
```

## 总结

WPL 提供了强大的数据解析能力，支持：

1. **多种数据格式**：JSON、KV、时间、网络协议等
2. **灵活的语法**：支持命名、管道、分组、重复等
3. **数据增强**：支持地理位置、设备识别等增强功能
4. **组合解析**：可以将多种解析器组合使用
5. **编码处理**：支持 Base64、转义字符等编码解码

学习建议：
- 从基础类型开始，理解数字、字符串、分隔符的解析
- 掌握时间格式和网络协议的解析方法
- 学习 JSON 解析和字段操作
- 理解管道操作和组合解析的高级用法
- 通过实际日志解析案例练习复杂场景

通过以上示例，可以快速掌握 WPL 的数据解析方法和技巧。
