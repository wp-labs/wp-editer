# 连接器管理

本文档介绍 Warp Parse 系统中连接器（Connectors）的定义、结构和使用方法。

## 连接器概念

### 什么是连接器
连接器是数据源和数据输出的配置模板，定义了特定类型连接器的默认参数和行为。通过将连接器定义与实例配置分离，实现了配置的复用和统一管理。

### 连接器的作用
1. **配置复用**: 多个源可以引用同一个连接器
2. **参数标准化**: 统一同类数据源的配置规范
3. **权限控制**: 通过 `allow_override` 控制可覆盖的参数
4. **版本管理**: 便于连接器配置的版本控制

## 连接器定义结构

### 基础结构
```toml
# connectors/source.d/{connector_name}.toml
[[connectors]]
id = "unique_connector_id"
type = "connector_type"
allow_override = ["param1", "param2", "param3"]

[connectors.params]
param1 = "default_value1"
param2 = "default_value2"
param3 = "default_value3"
```

### 字段说明

#### id (必需)
- 连接器的唯一标识符
- 在源配置中通过 `connect` 字段引用
- 命名规范：sources 连接器以 `_src` 结尾（如 `file_src`），sinks 连接器以 `_sink` 结尾（如 `file_json_sink`）

#### type (必需)
- 连接器类型，决定使用哪种数据源/输出实现
- Sources 支持的类型：`file`, `kafka`, `syslog`, `tcp`
- Sinks 支持的类型：`file`, `syslog`, `tcp`, `kafka`, `prometheus`, `blackhole`

#### allow_override (可选)
- 允许源/sink 配置覆盖的参数列表
- 为空时表示不允许覆盖任何参数
- 提供配置灵活性，同时保证安全性

#### params (必需)
- 连接器的默认参数配置
- 被 `allow_override` 包含的参数可以在实例配置中覆盖

## 目录结构

```
connectors/
├── source.d/                  # 源连接器目录
│   ├── 00-file-default.toml   # 文件连接器
│   ├── 10-syslog-udp.toml     # UDP Syslog 连接器
│   ├── 11-syslog-tcp.toml     # TCP Syslog 连接器
│   ├── 12-tcp.toml            # TCP 连接器
│   └── 30-kafka.toml          # Kafka 连接器
└── sink.d/                    # 输出连接器目录
    ├── 00-blackhole-sink.toml # 黑洞连接器
    ├── 02-file-json.toml      # JSON 文件输出
    ├── 10-syslog-udp.toml     # UDP Syslog 输出
    ├── 11-syslog-tcp.toml     # TCP Syslog 输出
    ├── 12-tcp.toml            # TCP 输出
    ├── 30-kafka.toml          # Kafka 输出
    └── 30-prometheus.toml     # Prometheus 输出
```

## 连接器类型

### Source 连接器

#### File 连接器
```toml
# connectors/source.d/00-file-default.toml
[[connectors]]
id = "file_src"
type = "file"
allow_override = ["base", "file", "encode"]

[connectors.params]
base = "data/in_dat"
file = "gen.dat"
encode = "text"
```

#### Kafka 连接器
```toml
# connectors/source.d/30-kafka.toml
[[connectors]]
id = "kafka_src"
type = "kafka"
allow_override = ["topic", "group_id", "config"]

[connectors.params]
brokers = "localhost:9092"
topic = ["access_log"]
group_id = "wparse_default_group"
```

#### Syslog 连接器
```toml
# connectors/source.d/11-syslog-tcp.toml
[[connectors]]
id = "syslog_tcp_src"
type = "syslog"
allow_override = ["addr", "port", "protocol", "tcp_recv_bytes", "header_mode", "prefer_newline"]

[connectors.params]
addr = "127.0.0.1"
port = 1514
protocol = "tcp"
header_mode = "strip"
tcp_recv_bytes = 256000
```

#### TCP 连接器
```toml
# connectors/source.d/12-tcp.toml
[[connectors]]
id = "tcp_src"
type = "tcp"
allow_override = ["addr", "port", "framing", "tcp_recv_bytes", "prefer_newline", "instances"]

[connectors.params]
addr = "0.0.0.0"
port = 9000
framing = "auto"
prefer_newline = false
tcp_recv_bytes = 256000
```

### Sink 连接器

#### File 连接器
```toml
# connectors/sink.d/02-file-json.toml
[[connectors]]
id = "file_json_sink"
type = "file"
allow_override = ["base", "file"]

[connectors.params]
fmt = "json"
base = "./data/out_dat"
file = "default.json"
```

#### Syslog 连接器
```toml
# connectors/sink.d/11-syslog-tcp.toml
[[connectors]]
id = "syslog_tcp_sink"
type = "syslog"
allow_override = ["addr", "port", "protocol"]

[connectors.params]
addr = "127.0.0.1"
port = 1514
protocol = "tcp"
```

#### TCP 连接器
```toml
# connectors/sink.d/12-tcp.toml
[[connectors]]
id = "tcp_sink"
type = "tcp"
allow_override = ["addr", "port", "framing", "max_backoff"]

[connectors.params]
addr = "127.0.0.1"
port = 9000
framing = "line"
```

## 连接器最佳实践

### 1. 参数覆盖设计
```toml
# ✅ 好的设计：明确的覆盖权限
[[connectors]]
id = "file_main"
type = "file"
allow_override = ["base", "file", "encode"]

# ❌ 避免：过度开放覆盖权限
[[connectors]]
id = "file_too_open"
type = "file"
allow_override = ["*"]  # 不支持且不安全
```

### 2. 默认值设置
```toml
# ✅ 好的设计：合理的默认值
[[connectors]]
id = "syslog_secure"
type = "syslog"
allow_override = ["addr", "port"]

[connectors.params]
addr = "127.0.0.1"    # 安全的默认地址
port = 1514           # 非特权端口
protocol = "tcp"      # 可靠的协议
header_mode = "strip" # 剥离协议头
```

## 相关文档

- [源配置基础](./01-sources/01-sources_basics.md)
- [文件源配置](./01-sources/02-file_source.md)
- [Kafka 源配置](./01-sources/03-kafka_source.md)
- [Syslog 源配置](./01-sources/04-syslog_source.md)
- [TCP 源配置](./01-sources/08-tcp_source.md)
- [Sink 配置基础](./02-sinks/00-sinks_basics.md)
