# WPL 管道函数

本页描述 WPL 中可在字段级管道中使用的内置函数。这些函数用于对解析后的字段进行条件判断、过滤与转换。

## 函数分类

WPL 管道函数分为两类：

| 类型 | 前缀 | 说明 |
|------|------|------|
| **字段集合操作** | `f_` | 在字段集合中查找指定字段进行操作 |
| **直接函数** | 无前缀 | 直接对当前数据进行处理 |

## 函数概览

### 字段集合操作函数（`f_` 前缀）

| 函数名 | 参数 | 说明 |
|--------|------|------|
| `f_has` | 1 | 检查字段是否存在 |
| `f_chars_has` | 2 | 检查字段是否包含指定字符串 |
| `f_chars_not_has` | 2 | 检查字段是否不包含指定字符串 |
| `f_chars_in` | 2 | 检查字段值是否在字符串列表中 |
| `f_digit_has` | 2 | 检查字段是否包含指定数字 |
| `f_digit_in` | 2 | 检查字段值是否在数字列表中 |
| `f_ip_in` | 2 | 检查 IP 地址是否在列表中 |

### 直接函数（无前缀）

| 函数名 | 参数 | 说明 |
|--------|------|------|
| `chars_unescape` | 1 | 对所有字段进行反转义 |

---

## 字段集合操作函数详解

### 1. `f_has`

检查指定字段是否存在于字段集合中。

**语法：**
```
f_has(<field_name>)
```

**参数：**
- `field_name`：要检查的字段名

**示例：**
```wpl
rule check_field {
  (
    json |f_has(age)
  )
}
```

---

### 2. `f_chars_has`

检查字段集合中指定字段是否包含指定的字符串。

**语法：**
```
f_chars_has(<field_name>, <pattern>)
```

**参数：**
- `field_name`：要检查的字段名
- `pattern`：要匹配的字符串模式

**示例：**
```wpl
rule check_error {
  (
    json |f_chars_has(message, error)
  )
}
```

---

### 3. `f_chars_not_has`

检查字段集合中指定字段是否不包含指定的字符串（`f_chars_has` 的否定形式）。

**语法：**
```
f_chars_not_has(<field_name>, <pattern>)
```

**参数：**
- `field_name`：要检查的字段名
- `pattern`：不应存在的字符串模式

**示例：**
```wpl
rule filter_success {
  (
    json |f_chars_not_has(status, failed)
  )
}
```

---

### 4. `f_chars_in`

检查字段集合中指定字段值是否在给定的字符串列表中。

**语法：**
```
f_chars_in(<field_name>, [<value1>, <value2>, ...])
```

**参数：**
- `field_name`：要检查的字段名
- `[...]`：允许的字符串值列表

**示例：**
```wpl
rule check_method {
  (
    json |f_chars_in(method, [GET, POST, PUT])
  )
}
```

---

### 5. `f_digit_has`

检查字段集合中指定字段是否包含指定的数字值。

**语法：**
```
f_digit_has(<field_name>, <number>)
```

**参数：**
- `field_name`：要检查的字段名
- `number`：要匹配的数字

**示例：**
```wpl
rule check_status {
  (
    json |f_digit_has(code, 200)
  )
}
```

---

### 6. `f_digit_in`

检查字段集合中指定数字字段值是否在给定的数字列表中。

**语法：**
```
f_digit_in(<field_name>, [<num1>, <num2>, ...])
```

**参数：**
- `field_name`：要检查的字段名
- `[...]`：允许的数字值列表

**示例：**
```wpl
rule check_success_codes {
  (
    json |f_digit_in(status, [200, 201, 204])
  )
}
```

---

### 7. `f_ip_in`

检查字段集合中指定 IP 地址是否在给定的 IP 列表中。支持 IPv4 和 IPv6。

**语法：**
```
f_ip_in(<field_name>, [<ip1>, <ip2>, ...])
```

**参数：**
- `field_name`：要检查的字段名
- `[...]`：允许的 IP 地址列表

**示例：**
```wpl
rule check_trusted_ips {
  (
    json(ip@client_ip) |f_ip_in(client_ip, [127.0.0.1, 192.168.1.1])
  )
}

rule check_ipv6 {
  (
    json(ip@src) |f_ip_in(src, [::1, 2001:db8::1])
  )
}
```

---

## 直接函数详解

### `chars_unescape`

对所有字段进行反转义处理。

**语法：**
```
chars_unescape(<type>)
```

**参数：**
- `type`：反转义类型

**支持的类型：**

| 类型 | 说明 |
|------|------|
| `json` | JSON 转义字符反转义 |

**转换效果（json）：**
```
"hello\\nworld"  →  "hello\nworld"
"path\\\\to"     →  "path\to"
"say\\\"hi\\\""  →  "say\"hi\""
```

**示例：**
```wpl
rule parse_json_log {
  (
    json(
      chars@message
    ) |chars_unescape(json)
  )
}
```

---

## 组合使用示例

多个管道函数可以链式调用：

```wpl
rule complex_filter {
  (
    json(
      chars@method,
      digit@status,
      ip@client_ip
    )
  )
  |f_has(method)
  |f_chars_in(method, [GET, POST])
  |f_digit_in(status, [200, 201, 204])
  |f_ip_in(client_ip, [10.0.0.1, 10.0.0.2])
}
```

## 相关文档

- 语法定义：[WPL 语法（EBNF）](./03-wpl_grammar.md)
- 实现代码：`crates/wp-lang/src/parser/wpl_fun.rs`
