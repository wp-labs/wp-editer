# OML 语言基础

本文档介绍 OML (Object Modeling Language) 的基础语法和核心概念，帮助您快速理解 OML 的设计理念和基本用法。

## 目录

1. [什么是 OML](#什么是-oml)
2. [基本语法结构](#基本语法结构)
3. [数据读取模式](#数据读取模式)
4. [数据类型](#数据类型)
5. [表达式与操作符](#表达式与操作符)
6. [核心构造](#核心构造)
   - [map/object 对象聚合](#mapobject-对象聚合)
   - [collect 数组聚合](#collect-数组聚合)
   - [match 模式匹配](#match-模式匹配)
   - [pipe 管道操作](#pipe-管道操作)
7. [高级特性](#高级特性)
   - [SQL 查询](#sql-查询)
   - [批量目标](#批量目标)
   - [格式化字符串](#格式化字符串)
   - [隐私段](#隐私段)
8. [注释](#注释)
9. [易错提醒](#易错提醒)
10. [最佳实践](#最佳实践)

## 什么是 OML

OML (Object Modeling Language) 是一种对象构建语言，用于对解析后的数据进行组装与聚合。它提供了强大的数据转换能力，可以将结构化的输入数据转换为所需的输出格式。

### 核心特点

- **声明式语法**：描述要什么，而不是如何做
- **类型安全**：支持丰富的数据类型和自动类型推断
- **管道处理**：支持链式数据转换
- **模式匹配**：基于条件的分支处理
- **SQL 集成**：可以直接查询数据库进行数据增强

## 基本语法结构

### 最小可运行示例

```oml
name : minimal
---
# 从输入记录读取 user_id；未指定类型时默认为 auto
user_id = read(user_id) ;
# 调用内置时间函数
occur_time : time = Now::time() ;
```

### 语法要素

1. **名称声明**
   ```oml
   name : <配置名称>
   ---
   ```

2. **分隔符**：`---` 分隔声明区和配置区

3. **配置条目**
   ```oml
   <目标字段>[:<类型>] = <表达式>;
   ```

4. **结束符**：每个条目必须以分号 `;` 结束

## 数据读取模式

OML 在读取输入记录时提供两种语义明确的模式：

### read（非破坏性读取）

- **特点**：多次读取同一键仍可读到值
- **机制**：先从目标记录 dst 查找，未命中再从输入 src 克隆值
- **用途**：同一字段被多个目标复用，或不希望"消费"源字段

### take（破坏性读取）

- **特点**：读取后会将该键从 src 中移除
- **机制**：从 src 取走值（并移除），后续再 take 同名键将失败
- **用途**：一次性消费字段、避免被后续逻辑重复使用

### 示例对比

```oml
name : read_take_diff
---
# 假设输入 src: A1=hello, B1=world

# 非破坏性读取：可重复
X1 = read(A1) ;   # X1 <- hello
X2 = read(A1) ;   # X2 <- hello（仍可读到）

# 破坏性读取：取走后 src 移除
Y1 = take(B1) ;   # Y1 <- world（同时从 src 移除 B1）
Y2 = take(B1) ;   # 取不到（B1 已不在 src）
```

### 读取参数

read/take 支持以下参数：

1. **无参数**：读取当前字段
   ```oml
   value = read() ;
   ```

2. **指定字段名**
   ```oml
   value = read(user_id) ;
   ```

3. **选项参数**：按优先级尝试
   ```oml
   value = read(option:[user_id, uid]) ;
   ```

4. **批量参数**：收集多个字段
   ```oml
   value = read(keys:[sport, dport]) ;
   ```

5. **JSON 路径**
   ```oml
   name = read(/details[0]/name) ;
   ```

## 数据类型

OML 支持以下数据类型：

### 基本类型

- `chars` - 字符串
- `digit` - 整数
- `float` - 浮点数
- `ip` - IP地址
- `time` - 时间
- `bool` - 布尔值

### 复合类型

- `array` - 数组
- `obj` - 对象
- `auto` - 自动推断（默认）

### 类型转换示例

```oml
name : type_conversion
---
# 从字符串读取并转换类型
ip_addr : ip = read(src_ip) ;        # "192.168.1.1" -> IP
port_num : digit = read(port) ;      # "8080" -> 8080
cpu_usage : float = read(cpu) ;      # "85.5" -> 85.5
timestamp : time = read(time) ;      # 字符串转时间
is_active : bool = read(active) ;    # "true" -> true
```

## 表达式与操作符

### 字面量

```oml
# 字符串
name = chars("John") ;
# 数字
count = digit(42) ;
# IP
addr = ip(192.168.1.1) ;
# 时间
now = Now::time() ;
# 布尔值
flag = bool(true) ;
```

### 管道操作

```oml
# 管道必须使用 pipe 关键字
result = pipe read(value) | to_json ;
```

### 条件表达式

```oml
# match 表达式
quarter = match read(month) {
    in (digit(1), digit(3)) => chars(Q1) ;
    _ => chars(UNKNOWN) ;
};
```

## 核心构造

### map/object 对象聚合

创建结构化对象，聚合多个字段：

```oml
name : object_example
---
values : obj = object {
  # 多目标 + 指定类型
  cpu_free, memory_free : digit = read() ;
  # 也可省略类型（默认为 auto）
  process, disk_used = read() ;
};
```

**说明**：
- `object { ... }` 内部为一组 `targets = <取值>` 的子赋值
- 分号可省略但推荐保留
- 输出为嵌套的 JSON 对象

### collect 数组聚合

将多个字段收集为数组：

```oml
name : collect_example
---
# 从多个字段收集为数组
ports : array = collect read(keys:[sport,dport]) ;
# 使用通配收集一批
all_vals : array = collect read(keys:[metrics/*]) ;
```

### match 模式匹配

基于条件进行分支处理：

#### 单源匹配

```oml
name : match_single
---
quarter : chars = match read(month) {
  in (digit(1), digit(3))   => chars(Q1) ;
  in (digit(4), digit(6))   => chars(Q2) ;
  in (digit(7), digit(9))   => chars(Q3) ;
  in (digit(10), digit(12)) => chars(Q4) ;
  _ => chars(UNKNOWN) ;
};
```

#### 多源匹配

```oml
name : match_double
---
X : chars = match (read(city1), read(city2)) {
  (ip(127.0.0.1), ip(127.0.0.100)) => chars(bj) ;
  _ => chars(sz) ;
};
```

**注意**：分支末尾逗号和分号均为可选，建议统一使用分号。

### pipe 管道操作

链式处理数据：

```oml
name : pipe_example
---
# 数组转 JSON
ports_json = pipe read(ports) | to_json ;
# 取数组首元素
first_port = pipe read(ports) | nth(0) ;
# URL 解析
host = pipe read(http_uri) | url(host) ;
# 时间戳转换
occur_ms = pipe read(occur_time) | Time::to_ts_zone(0,ms) ;
# Base64 编码
raw_b64 = pipe read(payload) | base64_encode ;
```

## 高级特性

### SQL 查询

直接查询数据库进行数据增强：

```oml
name : sql_example
---
# where 中可使用 read/take/Now::time/常量
name,pinying = select name,pinying from example where pinying = read(py) ;

# 使用内置 UDF（例如 IPv4 区间匹配）
from_zone = select zone from zone
  where ip_start_int <= ip4_int(read(src_ip))
    and ip_end_int   >= ip4_int(read(src_ip)) ;
```

**提示**：实现对 `select <列 from 表>` 做了基础合法化，建议显式列出列与单表名。

### 批量目标

使用通配符处理多个目标：

```oml
name : batch_example
---
# 目标名含 * 时进入批量模式；右值仅支持 take/read
aler* : auto = take() ;
```

### 格式化字符串

```oml
name : fmt_example
---
# 支持 @ref（等价于 read(ref)）与 read/get 混用
full = fmt("{}-{}", @user, read(city)) ;
```

**说明**：`@ref` 仅作为 `read(ref)` 的语法糖，不支持缺省体。

### 隐私段

用于数据脱敏（引擎默认未启用）：

```oml
name : privacy_example
---
# 隐私处理
src_ip : privacy_ip
pos_sn : privacy_keymsg
```

## 注释

```oml
name : with_comment
---
// 单行注释会在解析前被移除
version = chars(1.0.0) ;
```

## 易错提醒

1. **参数键限制**：仅支持 `option`、`keys`、`get` 与 JSON 路径，其他键不被支持
2. **分号必需**：顶层条目必须以分号 `;` 结束
3. **match 分支**：逗号与分号都可选，建议统一使用分号
4. **批量模式**：目标带 `*` 时进入批量模式，右值限定为 `take/read`
5. **@ref 限制**：仅在特定位置作为语法糖使用，不支持缺省体

## 最佳实践

### 1. 命名规范

```oml
# 推荐：使用描述性名称
user_id = read() ;
occur_time = Now::time() ;

# 避免：使用缩写或无意义名称
uid = read() ;
ot = Now::time() ;
```

### 2. 类型声明

```oml
# 推荐：显式声明类型
port : digit = read() ;
is_active : bool = read() ;

# 可接受：简单字段使用 auto
name = read() ;  # 自动推断为 chars
```

### 3. 错误处理

```oml
# 推荐：提供默认值
user_id = read() { _ : chars(unknown) } ;
version = read() { _ : chars(1.0.0) } ;
```

### 4. 组织结构

```oml
# 推荐：按逻辑分组
# === 基础字段 ===
user_id = read() ;
occur_time = Now::time() ;

# === 转换字段 ===
timestamp = pipe read(occur_time) | Time::to_ts_zone(0,ms) ;

# === 聚合字段 ===
summary = object {
    user = read(user_id) ;
    time = read(timestamp) ;
};
```

### 5. 性能考虑

```oml
# 推荐：使用 take 减少数据复制
temp = take(data) ;
result = pipe read(temp) | transform ;

# 避免：多次 read 同一字段
# bad: value1 = read(large_data) ;
#      value2 = read(large_data) ;
```

### 6. SQL 使用

```oml
# 推荐：使用参数化查询
name = select name from users where id = read(user_id) ;

# 避免：字符串拼接（有 SQL 注入风险）
# bad: name = select ... where id = '" + read(id) + "'" ;
```

### 7. 管道链长度

```oml
# 推荐：保持管道简洁
result = pipe read(data) | to_json ;

# 避免：过长的管道链
# bad: result = pipe read(data) | step1 | step2 | step3 | step4 | step5 ;
#      考虑使用中间变量
```

通过遵循这些最佳实践，可以编写出更清晰、更易维护的 OML 配置。