# 源配置基础

本文档介绍 Warp Parse 系统中数据源配置的基础概念和用法。

## 概述

数据源（Source）是 Warp Parse 系统的数据输入端，负责从各种数据源接收数据并输入到处理流程中。

## 核心概念

### 1. 连接器（Connectors）

连接器定义了如何与特定类型的数据源建立连接和通信。系统内置了多种连接器类型：

- **File Connector**: 从文件读取数据
- **Kafka Connector**: 从 Kafka 消息队列消费数据
- **Syslog Connector**: 接收 Syslog 协议数据
- **TCP Connector**: 通过 TCP 套接字接收数据

### 2. 连接器定义

连接器定义存储在 `connectors/source.d/` 目录下：

```toml
# connectors/source.d/kafka_src.toml
[[connectors]]
id = "kafka_src"
type = "kafka"
allow_override = ["topic", "group_id", "config"]

[connectors.params]
brokers = "localhost:9092"
topic = ["access_log"]
group_id = "wparse_default_group"
```

### 3. 源配置结构

```toml
# wpsrc.toml
[[sources]]
key = "main_source"
enable = true
connect = "kafka_src"
tags = ["env:production"]

[[sources.params]]
topic = "events"
# 或使用 params_override (别名)
```

## 配置步骤

1. **定义连接器**: 在 `connectors/source.d/` 目录下创建连接器配置文件
2. **配置源**: 在源配置文件中引用连接器并指定参数
3. **验证配置**: 使用 CLI 工具验证配置正确性
4. **启动系统**: 启动 Warp Parse 系统开始接收数据

## 配置字段说明

### 通用字段

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `key` | String | 是 | 源的唯一标识符 |
| `enable` | Boolean | 否 | 是否启用该源（默认 true） |
| `connect` | String | 是 | 引用的连接器 ID |
| `tags` | Array | 否 | 源的标签列表 |
| `params` | Table | 否 | 连接器参数（可覆盖连接器默认值） |
| `params_override` | Table | 否 | 参数覆盖的别名（与 params 等价） |

### 参数覆盖规则

- 只有在连接器的 `allow_override` 列表中的参数才能被覆盖
- 未在列表中的参数使用连接器定义中的默认值
- `params` 和 `params_override` 是等价的别名

## 配置示例

### 基础文件源

```toml
# wpsrc.toml
[[sources]]
key = "file_access_log"
enable = true
connect = "file_src"

[sources.params]
base = "/var/log/nginx"
file = "access.log"
```

### Kafka 源配置

```toml
# wpsrc.toml
[[sources]]
key = "kafka_access_logs"
enable = true
connect = "kafka_src"
tags = ["env:production", "type:access_log"]

[sources.params]
topic = "nginx_access_log"
```

### Syslog 源配置

```toml
# wpsrc.toml
[[sources]]
key = "syslog_tcp_1"
enable = true
connect = "syslog_tcp_src"
tags = ["protocol:tcp", "env:production"]

[sources.params]
addr = "127.0.0.1"
port = 1514
protocol = "tcp"
```

## 相关文档

- [连接器管理](../README.md)
- [文件源配置](./02-file_source.md)
- [Kafka 源配置](./03-kafka_source.md)
- [Syslog 源配置](./04-syslog_source.md)
- [TCP 源配置](./08-tcp_source.md)
