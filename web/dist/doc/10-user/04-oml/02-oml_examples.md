# OML 实用示例集

本文档提供了丰富的 OML 实用示例，每个示例都包含完整的输入数据、OML 配置和预期输出，帮助您快速掌握 OML 的各种用法。

## 目录

1. [基础操作示例](#基础操作示例)
2. [数据类型转换](#数据类型转换)
3. [管道操作示例](#管道操作示例)
4. [条件匹配示例](#条件匹配示例)
5. [数组操作示例](#数组操作示例)
6. [对象聚合示例](#对象聚合示例)
7. [通配符模式示例](#通配符模式示例)
8. [SQL 查询示例](#sql-查询示例)
9. [高级管道操作](#高级管道操作)
10. [实战案例](#实战案例)
11. [综合示例](#综合示例)

## 基础操作示例

### 1. 简单字段读取

**输入数据**:
```
user_id = "user123"
username = "john_doe"
email = "john@example.com"
```

**OML 配置**:
```oml
name : simple_read
---
# 读取指定字段
uid = read(user_id) ;
name = read(username) ;

# 使用 take（破坏性读取）
email = take(email) ;
```

**输出结果**:
```
uid = "user123"
name = "john_doe"
email = "john@example.com"
```

### 2. 带默认值的读取

**输入数据**:
```
user_id = "user123"
# country 字段不存在
```

**OML 配置**:
```oml
name : read_with_default
---
# 字段不存在时使用默认值
country = read() { _ : chars(CN) } ;
version = read() { _ : chars(1.0) } ;

# 正常读取存在的字段
user_id = read() ;
```

**输出结果**:
```
country = "CN"
version = "1.0"
user_id = "user123"
```

### 3. 多选项读取

**输入数据**:
```
# id 字段不存在
uid = "user456"
```

**OML 配置**:
```oml
name : option_read
---
# 尝试多个字段，按优先级返回
user_id = read(option:[id, uid, user_id]) ;
```

**输出结果**:
```
user_id = "user456"  # uid 存在，被返回
```

### 4. JSON 路径读取

**输入数据**:
```
/details[0]/name = "process1"
/details[0]/pid = "1001"
/details[1]/name = "process2"
/details[1]/pid = "1002"
/user/info/name = "John"
/user/info/age = "30"
```

**OML 配置**:
```oml
name : json_path_read
---
# 读取 JSON 路径
first_process = read(/details[0]/name) ;
first_pid = read(/details[0]/pid) ;
username = read(/user/info/name) ;
age = read(/user/info/age) ;
```

**输出结果**:
```
first_process = "process1"
first_pid = "1001"
username = "John"
age = "30"
```

## 数据类型转换

### 1. 基础类型转换

**输入数据**:
```
ip_addr = "192.168.1.100"
port = "8080"
cpu_usage = "85.5"
is_active = "true"
event_time = "2024-01-15 14:30:00"
```

**OML 配置**:
```oml
name : type_conversion
---
ip : ip = read(ip_addr) ;
port : digit = read() ;
cpu : float = read() ;
active : bool = read() ;
time : time = read() ;
```

**输出结果**:
```
ip = 192.168.1.100     # IP 类型
port = 8080             # 整数
cpu = 85.5              # 浮点数
active = true           # 布尔值
time = "2024-01-15 14:30:00"  # 时间类型
```

### 2. 时间转换示例

**输入数据**:
```
log_time = "15/Jan/2024:14:30:00 +0800"
```

**OML 配置**:
```oml
name : time_conversion
---
# 使用时间函数获取当前时间
now = Time::now() ;
now_date = Time::now_date() ;
now_hour = Time::now_hour() ;
```

**输出结果**:
```
now = "2024-01-15 14:30:45"  # 当前时间
now_date = "2024-01-15"       # 当前日期
now_hour = "14"               # 当前小时
```

## 管道操作示例

### 1. 时间戳转换

**输入数据**:
```
occur_time = "2024-01-15 14:30:00"
```

**OML 配置**:
```oml
name : timestamp_conversion
---
# 不同精度的时间戳
ts_ss = pipe read(occur_time) | to_timestamp_zone(0, ss) ;
ts_ms = pipe read(occur_time) | to_timestamp_zone(0, ms) ;
ts_us = pipe read(occur_time) | to_timestamp_zone(0, us) ;
# 带时区
ts_utc8 = pipe read(occur_time) | to_timestamp_zone(8, s) ;
```

**输出结果**:
```
ts_ss = 1705318200          # 秒级
ts_ms = 1705318200000       # 毫秒级
ts_us = 1705318200000000    # 微秒级
ts_utc8 = 1705285800        # UTC+8 时区秒级
```

### 2. 数组操作管道

**输入数据**:
```
sport = "8080"
dport = "443"
protocol = "tcp"
```

**OML 配置**:
```oml
name : array_pipe
---
# 收集端口到数组
ports = collect read(keys:[sport, dport]) ;
# 转换为 JSON
ports_json = pipe read(ports) | to_json ;
# 获取第一个端口
first_port = pipe read(ports) | arr_get(0) ;
# 统计数组长度
port_count = pipe read(ports) | arr_len ;
```

**输出结果**:
```
ports = [8080, 443]                    # 数组
ports_json = "[8080,443]"              # JSON 字符串
first_port = 8080                      # 第一个元素
port_count = 2                         # 数组长度
```

### 3. URL 解析管道

**输入数据**:
```
url = "https://www.example.com:8080/path/to/resource?param1=value1&param2=value2#section"
```

**OML 配置**:
```oml
name : url_parsing
---
scheme = pipe read(url) | url_get(scheme) ;
domain = pipe read(url) | url_get(domain) ;
host = pipe read(url) | url_get(host) ;
port = pipe read(url) | url_get(port) ;
path = pipe read(url) | url_get(path) ;
params = pipe read(url) | url_get(params) ;
fragment = pipe read(url) | url_get(fragment) ;
```

**输出结果**:
```
scheme = "https"
domain = "www.example.com"
host = "www.example.com"
port = "8080"
path = "/path/to/resource"
params = "param1=value1&param2=value2"
fragment = "section"
```

### 4. 编码转换管道

**输入数据**:
```
message = "Hello, OML!"
html = "<script>alert('xss')</script>"
json_text = '{"key":"value with \"quotes\""}'
```

**OML 配置**:
```oml
name : encoding_pipe
---
# Base64 编解码
b64_encoded = pipe read(message) | base64_en ;
b64_decoded = pipe read(b64_encoded) | base64_de(Utf8) ;

# HTML 转义
html_escaped = pipe read(html) | html_escape_en ;
html_unescaped = pipe read(html_escaped) | html_escape_de ;

# JSON 转义
json_escaped = pipe read(json_text) | json_escape_en ;
json_unescaped = pipe read(json_escaped) | json_escape_de ;
```

**输出结果**:
```
b64_encoded = "SGVsbG8sIE9NTCE="
b64_decoded = "Hello, OML!"
html_escaped = "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;"
html_unescaped = "<script>alert('xss')</script>"
json_escaped = "{\"key\":\"value with \\\"quotes\\\"\"}"
json_unescaped = "{\"key\":\"value with \"quotes\""}"
```

## 条件匹配示例

### 1. 季度判断

**输入数据**:
```
month = "6"  # 6月
```

**OML 配置**:
```oml
name : quarter_match
---
quarter = match read(month) {
    in (digit(1), digit(3)) => chars(Q1) ;
    in (digit(4), digit(6)) => chars(Q2) ;
    in (digit(7), digit(9)) => chars(Q3) ;
    in (digit(10), digit(12)) => chars(Q4) ;
    _ => chars(Invalid) ;
};
```

**输出结果**:
```
quarter = "Q2"  # 6月属于第二季度
```

### 2. 端口服务识别

**输入数据**:
```
port = "22"
```

**OML 配置**:
```oml
name : port_service_match
---
service = match read(port) {
    digit(22) => chars(SSH) ;
    digit(80) => chars(HTTP) ;
    digit(443) => chars(HTTPS) ;
    digit(3306) => chars(MySQL) ;
    digit(5432) => chars(PostgreSQL) ;
    digit(6379) => chars(Redis) ;
    _ => chars(Unknown) ;
};
```

**输出结果**:
```
service = "SSH"
```

### 3. IP 地址范围匹配

**输入数据**:
```
src_ip = "10.0.1.50"
dst_ip = "192.168.1.100"
```

**OML 配置**:
```oml
name : ip_range_match
---
src_zone = match take(src_ip) {
    in (ip(10.0.0.0), ip(10.255.255.255)) => chars(Internal) ;
    in (ip(172.16.0.0), ip(172.31.255.255)) => chars(Internal) ;
    in (ip(192.168.0.0), ip(192.168.255.255)) => chars(Internal) ;
    _ => chars(External) ;
};

dst_zone = match take(dst_ip) {
    ip(192.168.1.100) => chars(Server-1) ;
    ip(192.168.1.101) => chars(Server-2) ;
    _ => chars(Other) ;
};
```

**输出结果**:
```
src_zone = "Internal"
dst_zone = "Server-1"
```

### 4. 多条件组合匹配

**输入数据**:
```
protocol = "tcp"
status = "200"
size = "1024"
```

**OML 配置**:
```oml
name : multi_condition_match
---
traffic_type = match (read(protocol), read(status), read(size)) {
    (chars(tcp), digit(200), in (digit(0), digit(1024))) => chars(Small-TCP-Success) ;
    (chars(tcp), digit(200), digit(_)) => chars(Large-TCP-Success) ;
    (chars(tcp), digit(_), digit(_)) => chars(TCP-Other) ;
    (chars(udp), digit(_), digit(_)) => chars(UDP-All) ;
    _ => chars(Other) ;
};
```

**输出结果**:
```
traffic_type = "Small-TCP-Success"
```

## 数组操作示例

### 1. 收集特定前缀的字段

**输入数据**:
```
cpu_user = "45"
cpu_system = "15"
cpu_idle = "40"
memory_used = "2048"
memory_free = "4096"
disk_used = "102400"
disk_free = "204800"
```

**OML 配置**:
```oml
name : collect_by_prefix
---
# 收集所有 CPU 相关字段
cpu_metrics = collect read(keys:[cpu_*]) ;
# 收集所有内存相关字段
memory_metrics = collect read(keys:[memory_*]) ;
# 收集所有磁盘相关字段
disk_metrics = collect read(keys:[disk_*]) ;
```

**输出结果**:
```
cpu_metrics = [45, 15, 40]
memory_metrics = [2048, 4096]
disk_metrics = [102400, 204800]
```

### 2. 数组转换和过滤

**输入数据**:
```
ports = "80,443,8080,22,3306"
```

**OML 配置**:
```oml
name : array_transform
---
# 分割字符串为数组
port_list = pipe read(ports) | split(',') ;
# 过滤知名端口
well_known_ports = pipe read(port_list) | filter([80, 443, 22]) ;
# 转换为整数类型
port_ints = pipe read(port_list) | to_digit ;
```

**输出结果**:
```
port_list = ["80", "443", "8080", "22", "3306"]
well_known_ports = ["80", "443", "22"]
port_ints = [80, 443, 8080, 22, 3306]
```

## 对象聚合示例

### 1. 系统指标聚合

**输入数据**:
```
hostname = "web-server-01"
cpu_usage = "75.5"
memory_usage = "60.2"
disk_usage = "45.8"
network_in = "1024000"
network_out = "512000"
```

**OML 配置**:
```oml
name : system_metrics
---
system_info = object {
    host : chars = read(hostname) ;
    cpu : float = read() ;
    memory : float = read() ;
    disk : float = read() ;
} ;

network_stats = object {
    host : chars = read(hostname) ;
    bytes_in : digit = read() ;
    bytes_out : digit = read() ;
} ;
```

**输出结果**:
```json
{
    "system_info": {
        "host": "web-server-01",
        "cpu": 75.5,
        "memory": 60.2,
        "disk": 45.8
    },
    "network_stats": {
        "host": "web-server-01",
        "bytes_in": 1024000,
        "bytes_out": 512000
    }
}
```

### 2. 嵌套对象创建

**输入数据**:
```
app_name = "myapp"
version = "1.2.3"
env = "production"
region = "us-west-2"
az = "us-west-2a"
instance_id = "i-1234567890abcdef0"
```

**OML 配置**:
```oml
name : nested_object
---
deployment = object {
    application : object {
        name : chars = read() ;
        version : chars = read() ;
        environment : chars = read() ;
    } ;

    infrastructure : object {
        region : chars = read() ;
        availability_zone : chars = read() ;
        instance : object {
            id : chars = read() ;
            state : chars(running) ;
        } ;
    } ;
} ;
```

**输出结果**:
```json
{
    "deployment": {
        "application": {
            "name": "myapp",
            "version": "1.2.3",
            "environment": "production"
        },
        "infrastructure": {
            "region": "us-west-2",
            "availability_zone": "us-west-2a",
            "instance": {
                "id": "i-1234567890abcdef0",
                "state": "running"
            }
        }
    }
}
```

## 通配符模式示例

### 1. 批量处理警告字段

**输入数据**:
```
alert_cpu_high = "CPU usage above 80%"
alert_memory_low = "Memory below 10%"
alert_disk_full = "Disk usage above 95%"
alert_network_error = "Network connection failed"
normal_field = "This is not an alert"
```

**OML 配置**:
```oml
name : batch_alerts
---
# 所有以 alert_ 开头的字段
aler* : auto = take() ;

# 保留其他字段
normal_field = take() ;
```

**输出结果**:
```
alert_cpu_high = "CPU usage above 80%"
alert_memory_low = "Memory below 10%"
alert_disk_full = "Disk usage above 95%"
alert_network_error = "Network connection failed"
normal_field = "This is not an alert"
```

### 2. 按路径模式收集

**输入数据**:
```
process[0]/name = "chrome"
process[0]/pid = "1001"
process[0]/cpu = "15.5"
process[1]/name = "firefox"
process[1]/pid = "1002"
process[1]/cpu = "8.2"
process[2]/name = "explorer"
process[2]/pid = "1003"
process[2]/cpu = "5.0"
```

**OML 配置**:
```oml
name : path_pattern
---
# 收集所有进程名称
process_names = collect read(keys:[process[*]/name]) ;
# 收集所有进程 PID
process_pids = collect read(keys:[process[*]/pid]) ;
# 收集所有进程 CPU 使用率
process_cpus = collect read(keys:[process[*]/cpu]) ;
```

**输出结果**:
```
process_names = ["chrome", "firefox", "explorer"]
process_pids = [1001, 1002, 1003]
process_cpus = [15.5, 8.2, 5.0]
```

## SQL 查询示例

### 1. 用户信息增强

**输入数据**:
```
user_id = "1001"
```

**数据库表 (users)**:
| id | name | email | department |
|----|------|-------|------------|
| 1001 | 张三 | zhangsan@example.com | 研发部 |
| 1002 | 李四 | lisi@example.com | 产品部 |

**OML 配置**:
```oml
name : user_enrichment
---
user_name, user_email, user_dept =
    select name, email, department
    from users
    where id = read(user_id) ;
```

**输出结果**:
```
user_name = "张三"
user_email = "zhangsan@example.com"
user_dept = "研发部"
```

### 2. IP 地理位置查询

**输入数据**:
```
src_ip = "203.0.113.1"
dst_ip = "198.51.100.1"
```

**数据库表 (ip_geo)**:
| ip_start | ip_end | country | city | isp |
|----------|--------|---------|------|-----|
| 203.0.113.0 | 203.0.113.255 | US | Los Angeles | ISP1 |
| 198.51.100.0 | 198.51.100.255 | CA | Toronto | ISP2 |

**OML 配置**:
```oml
name : ip_geo_enrichment
---
# 将 IP 转换为整数进行比较
src_country, src_city =
    select country, city
    from ip_geo
    where ip_start_int <= ip4_int(read(src_ip))
      and ip_end_int   >= ip4_int(read(src_ip)) ;

dst_country, dst_city =
    select country, city
    from ip_geo
    where ip_start_int <= ip4_int(read(dst_ip))
      and ip_end_int   >= ip4_int(read(dst_ip)) ;
```

**输出结果**:
```
src_country = "US"
src_city = "Los Angeles"
dst_country = "CA"
dst_city = "Toronto"
```

### 3. 多表关联查询

**输入数据**:
```
order_id = "ORD-2024-001"
```

**数据库表**:
- orders: | id | user_id | amount | status |
- users: | id | name | level |
- user_levels: | level | discount |

**OML 配置**:
```oml
name : order_details
---
# 获取订单信息
user_id, order_amount, order_status =
    select user_id, amount, status
    from orders
    where id = read(order_id) ;

# 获取用户信息
user_name, user_level =
    select name, level
    from users
    where id = read(user_id) ;

# 获取折扣信息
discount =
    select discount
    from user_levels
    where level = read(user_level) ;
```

**输出结果**:
```
user_id = "U1001"
order_amount = "199.99"
order_status = "completed"
user_name = "王五"
user_level = "VIP"
discount = "0.9"
```

## 高级管道操作

### 1. JSON 数据处理

**输入数据**:
```
json_data = '{"user":{"id":123,"name":"John","profile":{"age":30,"city":"Beijing"}},"orders":[{"id":"ORD001","amount":100},{"id":"ORD002","amount":200}]}'
```

**OML 配置**:
```oml
name : json_processing
---
# 提取嵌套 JSON 值
user_id = pipe take(json_data) | sxf_get(user.id) ;
user_name = pipe take(json_data) | sxf_get(user.name) ;
user_age = pipe take(json_data) | sxf_get(user.profile.age) ;
user_city = pipe take(json_data) | sxf_get(user.profile.city) ;

# 提取订单数组第一个元素
first_order_id = pipe take(json_data) | sxf_get(orders[0].id) ;
first_order_amount = pipe take(json_data) | sxf_get(orders[0].amount) ;
```

**输出结果**:
```
user_id = "123"
user_name = "John"
user_age = "30"
user_city = "Beijing"
first_order_id = "ORD001"
first_order_amount = "100"
```

### 2. 复杂字符串处理

**输入数据**:
```
log_line = '192.168.1.100 - - [15/Jan/2024:14:30:00 +0800] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0"'
```

**OML 配置**:
```oml
name : log_processing
---
# 提取 IP（使用正则或字符串分割）
ip = pipe read(log_line) | split(' ') | arr_get(0) ;

# 提取时间戳
timestamp = pipe read(log_line) | split('[') | arr_get(1) | split(']') | arr_get(0) ;

# 提取 HTTP 方法
method = pipe read(log_line) | split('"') | arr_get(2) | split(' ') | arr_get(0) ;

# 提取 URL
url = pipe read(log_line) | split('"') | arr_get(2) | split(' ') | arr_get(1) ;

# 提取状态码
status = pipe read(log_line) | split('"') | arr_get(2) | split(' ') | arr_get(2) ;
```

**输出结果**:
```
ip = "192.168.1.100"
timestamp = "15/Jan/2024:14:30:00 +0800"
method = "GET"
url = "/api/users"
status = "200"
```

### 3. IP 地址操作

**输入数据**:
```
src_ip = "192.168.1.100"
dst_ip = "10.0.0.50"
```

**OML 配置**:
```oml
name : ip_operations
---
# IP 转整数
src_ip_int = pipe read(src_ip) | to_ip4_int ;
dst_ip_int = pipe read(dst_ip) | to_ip4_int ;

# 判断是否在特定网段
is_private = match (take(src_ip)) {
    in (ip(10.0.0.0), ip(10.255.255.255)) => chars(True) ;
    in (ip(172.16.0.0), ip(172.31.255.255)) => chars(True) ;
    in (ip(192.168.0.0), ip(192.168.255.255)) => chars(True) ;
    _ => chars(False) ;
} ;
```

**输出结果**:
```
src_ip_int = 3232235876
dst_ip_int = 167772160
is_private = "True"
```

## 实战案例

### 案例1：Web访问日志分析

**输入数据**:
```
timestamp = "15/Jan/2024:14:30:00 +0800"
src_ip = "203.0.113.1"
method = "GET"
url = "/api/users?page=1&limit=10"
status = "200"
response_size = "1234"
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
referer = "https://example.com/"
```

**OML 配置**:
```oml
name : web_access_analysis
---
# 基础字段处理
event_time = pipe read(timestamp) | to_timestamp_zone(0, ss) ;
source_ip = take(src_ip) ;
http_method = read(method) ;
request_uri = read(url) ;
response_code = read(status) ;
size = read(response_size) ;

# URL 解析
protocol = pipe read(request_uri) | url_get(scheme) ;
host = pipe read(request_uri) | url_get(host) ;
path = pipe read(request_uri) | url_get(path) ;
query = pipe read(request_uri) | url_get(params) ;

# 状态码分类
status_category = match read(response_code) {
    in (digit(200), digit(299)) => chars(Success) ;
    in (digit(300), digit(399)) => chars(Redirect) ;
    in (digit(400), digit(499)) => chars(Client_Error) ;
    in (digit(500), digit(599)) => chars(Server_Error) ;
    _ => chars(Unknown) ;
} ;

# 聚合输出
access_log = object {
    time : digit = read(event_time) ;
    client : object {
        ip : ip = read(source_ip) ;
        agent : chars = read(user_agent) ;
    } ;
    request : object {
        method : chars = read(http_method) ;
        protocol : chars = read(protocol) ;
        host : chars = read(host) ;
        path : chars = read(path) ;
        query : chars = read(query) ;
    } ;
    response : object {
        code : digit = read(response_code) ;
        category : chars = read(status_category) ;
        size : digit = read(size) ;
    } ;
    referer : chars = read(referer) ;
} ;
```

**输出结果**:
```json
{
    "access_log": {
        "time": 1705318200,
        "client": {
            "ip": "203.0.113.1",
            "agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        "request": {
            "method": "GET",
            "protocol": "",
            "host": "",
            "path": "/api/users",
            "query": "page=1&limit=10"
        },
        "response": {
            "code": 200,
            "category": "Success",
            "size": 1234
        },
        "referer": "https://example.com/"
    }
}
```

### 案例2：系统监控数据处理

**输入数据**:
```
hostname = "prod-web-01"
timestamp = "2024-01-15 14:30:00"
cpu_user = "65.5"
cpu_system = "15.2"
cpu_idle = "19.3"
mem_total = "8192"
mem_used = "6144"
mem_free = "2048"
disk_read = "1048576"
disk_write = "524288"
net_in = "10485760"
net_out = "5242880"
load_1m = "2.5"
load_5m = "2.1"
load_15m = "1.8"
```

**OML 配置**:
```oml
name : system_monitoring
---
# 时间处理
event_ts = pipe read(timestamp) | to_timestamp_zone(8, ss) ;
event_hour = pipe read(timestamp) | to_timestamp_zone(8, hh) ;

# CPU 指标计算
cpu_total = pipe read(cpu_user) | add(read(cpu_system)) | add(read(cpu_idle)) ;
cpu_usage_percent = pipe read(cpu_user) | add(read(cpu_system)) ;

# 内存指标计算
mem_usage_percent = pipe read(mem_used) | div(read(mem_total)) | mul(100) ;

# I/O 速率（假设是5秒内的数据）
disk_read_rate = pipe read(disk_read) | div(5) ;
disk_write_rate = pipe read(disk_write) | div(5) ;
net_in_rate = pipe read(net_in) | div(5) ;
net_out_rate = pipe read(net_out) | div(5) ;

# 告警判断
cpu_alert = match read(cpu_usage_percent) {
    in (digit(0), digit(80)) => chars(Normal) ;
    in (digit(80), digit(90)) => chars(Warning) ;
    digit(_) => chars(Critical) ;
} ;

mem_alert = match read(mem_usage_percent) {
    in (digit(0), digit(80)) => chars(Normal) ;
    in (digit(80), digit(90)) => chars(Warning) ;
    digit(_) => chars(Critical) ;
} ;

# 最终输出
metrics = object {
    host : object {
        name : chars = read(hostname) ;
        timestamp : digit = read(event_ts) ;
        hour : digit = read(event_hour) ;
    } ;

    cpu : object {
        user : float = read() ;
        system : float = read() ;
        idle : float = read() ;
        usage_percent : float = read() ;
        alert : chars = read(cpu_alert) ;
    } ;

    memory : object {
        total : digit = read() ;
        used : digit = read() ;
        free : digit = read() ;
        usage_percent : float = read() ;
        alert : chars = read(mem_alert) ;
    } ;

    disk : object {
        read_rate : digit = read() ;
        write_rate : digit = read() ;
    } ;

    network : object {
        in_rate : digit = read() ;
        out_rate : digit = read() ;
    } ;

    load : object {
        avg_1m : float = read() ;
        avg_5m : float = read() ;
        avg_15m : float = read() ;
    } ;
} ;
```

**输出结果**:
```json
{
    "metrics": {
        "host": {
            "name": "prod-web-01",
            "timestamp": 1705285800,
            "hour": 14
        },
        "cpu": {
            "user": 65.5,
            "system": 15.2,
            "idle": 19.3,
            "usage_percent": 80.7,
            "alert": "Warning"
        },
        "memory": {
            "total": 8192,
            "used": 6144,
            "free": 2048,
            "usage_percent": 75.0,
            "alert": "Normal"
        },
        "disk": {
            "read_rate": 209715,
            "write_rate": 104857
        },
        "network": {
            "in_rate": 2097152,
            "out_rate": 1048576
        },
        "load": {
            "avg_1m": 2.5,
            "avg_5m": 2.1,
            "avg_15m": 1.8
        }
    }
}
```

## 综合示例

### 示例1：完整的日志处理流水线

**输入数据**:
```
# 基础日志字段
log_time = "2024-01-15T14:30:00Z"
src_ip = "203.0.113.100"
dst_ip = "192.168.1.10"
protocol = "TCP"
sport = "54321"
dport = "443"
action = "allow"
rule_name = "ALLOW-HTTPS-OUT"

# 应用层信息
app_name = "myapp"
app_version = "1.2.3"
user_id = "user1001"
session_id = "sess_abc123"

# 负载信息
cpu_usage = "45.2"
memory_usage = "60.8"
```

**OML 配置**:
```oml
name : complete_log_processing
---
# === 时间和基础信息 ===
event_time = pipe read(log_time) | to_timestamp_zone(0, ss) ;
event_date = Time::now_date() ;

# === 网络信息处理 ===
# IP 地址转换
src_ip_int = pipe read(src_ip) | to_ip4_int ;
dst_ip_int = pipe read(dst_ip) | to_ip4_int ;

# 端口处理
src_port : digit = read() ;
dst_port : digit = read() ;

# 服务识别
service = match read(dst_port) {
    digit(22) => chars(SSH) ;
    digit(80) => chars(HTTP) ;
    digit(443) => chars(HTTPS) ;
    digit(3306) => chars(MySQL) ;
    digit(5432) => chars(PostgreSQL) ;
    _ => chars(Unknown) ;
} ;

# === SQL 增强查询 ===
# 查询源 IP 地理位置
src_country, src_city, src_isp =
    select country, city, isp
    from ip_geo
    where ip_start_int <= read(src_ip_int)
      and ip_end_int   >= read(src_ip_int) ;

# 查询目标资产信息
dst_asset, dst_owner =
    select asset_name, owner
    from assets
    where ip = read(dst_ip) ;

# 查询用户信息
user_name, user_role, user_dept =
    select name, role, department
    from users
    where id = read(user_id) ;

# === 风险评估 ===
# 判断是否为内部通信
is_internal = match (take(src_ip), take(dst_ip)) {
    (in (ip(10.0.0.0), ip(10.255.255.255)), ip(_)) => chars(True) ;
    (in (ip(172.16.0.0), ip(172.31.255.255)), ip(_)) => chars(True) ;
    (in (ip(192.168.0.0), ip(192.168.255.255)), ip(_)) => chars(True) ;
    _ => chars(False) ;
} ;

# 风险等级评估
risk_level = match (read(is_internal), read(action), read(dst_port)) {
    (chars(False), chars(deny), digit(_)) => chars(Low) ;
    (chars(True), chars(deny), digit(_)) => chars(Low) ;
    (chars(False), chars(allow), in (digit(22), digit(3389))) => chars(Medium) ;
    (chars(False), chars(allow), digit(443)) => chars(Low) ;
    (chars(False), chars(allow), digit(_)) => chars(High) ;
    _ => chars(Medium) ;
} ;

# === 格式化输出 ===
# 创建连接标识
connection_id = fmt("{}:{}->{}:{}", @src_ip, read(src_port), @dst_ip, read(dst_port)) ;

# === 最终输出结构 ===
network_event = object {
    # 事件基础信息
    event : object {
        timestamp : digit = read(event_time) ;
        date : chars = read(event_date) ;
        id : chars = read(connection_id) ;
        action : chars = read() ;
        rule : chars = read(rule_name) ;
        risk : chars = read(risk_level) ;
    } ;

    # 网络层信息
    network : object {
        protocol : chars = read(protocol) ;
        source : object {
            ip : ip = read(src_ip) ;
            port : digit = read(src_port) ;
            geo : object {
                country : chars = read(src_country) ;
                city : chars = read(src_city) ;
                isp : chars = read(src_isp) ;
            } ;
        } ;
        destination : object {
            ip : ip = read(dst_ip) ;
            port : digit = read(dst_port) ;
            service : chars = read(service) ;
            asset : chars = read(dst_asset) ;
            owner : chars = read(dst_owner) ;
        } ;
    } ;

    # 应用层信息
    application : object {
        name : chars = read(app_name) ;
        version : chars = read(app_version) ;
        session : chars = read(session_id) ;
        user : object {
            id : chars = read(user_id) ;
            name : chars = read(user_name) ;
            role : chars = read(user_role) ;
            department : chars = read(user_dept) ;
        } ;
    } ;

    # 系统信息
    system : object {
        cpu : float = read() ;
        memory : float = read() ;
    } ;

    # 处理标记
    tags : array = collect read(keys:[is_internal]) ;
} ;
```

**输出结果**:
```json
{
    "network_event": {
        "event": {
            "timestamp": 1705318200,
            "date": "2024-01-15",
            "id": "203.0.113.100:54321->192.168.1.10:443",
            "action": "allow",
            "rule": "ALLOW-HTTPS-OUT",
            "risk": "Low"
        },
        "network": {
            "protocol": "TCP",
            "source": {
                "ip": "203.0.113.100",
                "port": 54321,
                "geo": {
                    "country": "US",
                    "city": "Los Angeles",
                    "isp": "ISP1"
                }
            },
            "destination": {
                "ip": "192.168.1.10",
                "port": 443,
                "service": "HTTPS",
                "asset": "WEB-SRV-01",
                "owner": "IT-Dept"
            }
        },
        "application": {
            "name": "myapp",
            "version": "1.2.3",
            "session": "sess_abc123",
            "user": {
                "id": "user1001",
                "name": "张三",
                "role": "Developer",
                "department": "研发部"
            }
        },
        "system": {
            "cpu": 45.2,
            "memory": 60.8
        },
        "tags": ["False"]
    }
}
```

## 总结

通过以上丰富的示例，您可以看到 OML 的强大功能：

1. **灵活的数据读取**：支持多种读取方式和参数
2. **强大的类型系统**：自动类型推断和显式类型转换
3. **丰富的管道操作**：支持各种数据处理和转换
4. **智能的模式匹配**：基于条件的灵活分支处理
5. **便捷的聚合操作**：数组和对象的创建与操作
6. **通配符支持**：批量处理和模式匹配
7. **SQL 集成**：直接查询数据库进行数据增强
8. **实战案例**：贴近实际应用场景的完整示例

建议从基础示例开始练习，逐步掌握高级特性，最后通过实战案例提升综合运用能力。