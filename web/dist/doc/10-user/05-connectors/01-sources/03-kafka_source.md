# Kafka 源配置

本文档详细介绍如何配置和使用 Warp Parse 系统的 Kafka 数据源。

## 概述

Kafka 源用于从 Apache Kafka 消息队列消费数据，支持消费单个主题和灵活的配置选项。

> **注意**：系统会自动创建配置的主题（如果不存在），消费者组 ID 可以通过 `group_id` 参数配置，默认为 `wparse_default_group`。

## 连接器定义

### 基础 Kafka 连接器

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

## 支持的参数

### 基础连接参数

#### brokers (必需)
Kafka 集群地址，支持字符串格式

```toml
[[sources.params]]
brokers = "localhost:9092"
```

#### topic (必需)
消费的主题名称（数组形式）

```toml
[[sources.params]]
topic = ["access_log"]
```

#### group_id (可选)
消费者组 ID

```toml
[[sources.params]]
group_id = "my_consumer_group"
```

### 安全配置

所有安全相关参数必须通过 `config` 数组配置，格式为 `key=value` 字符串。

#### SSL/TLS 配置
```toml
[[sources.params]]
config = [
    "security_protocol=SSL",
    "ssl_ca_location=/path/to/ca.pem",
    "ssl_certificate_location=/path/to/client.pem",
    "ssl_key_location=/path/to/client.key",
    "ssl_key_password=key_password"
]
```

#### SASL 认证
```toml
[[sources.params]]
config = [
    "security_protocol=SASL_PLAINTEXT",
    "sasl_mechanisms=PLAIN",
    "sasl_username=consumer_user",
    "sasl_password=consumer_pass"
]
```

#### SASL/SCRAM 认证
```toml
[[sources.params]]
config = [
    "security_protocol=SASL_SSL",
    "sasl_mechanisms=SCRAM-SHA-256",
    "sasl_username=consumer_user",
    "sasl_password=consumer_pass"
]
```

### 高级配置

#### 消费策略
```toml
[[sources.params]]
config = [
    "auto_offset_reset=earliest",
    "enable_auto_commit=false",
    "auto_commit_interval_ms=5000"
]
```

#### 会话和心跳配置
```toml
[[sources.params]]
config = [
    "session_timeout_ms=30000",
    "heartbeat_interval_ms=3000",
    "max_poll_interval_ms=300000"
]
```

#### 批量消费配置
```toml
[[sources.params]]
config = [
    "max_poll_records=500",
    "fetch_min_bytes=1",
    "fetch_max_wait_ms=500"
]
```

## 配置示例

### 基础配置
```toml
# wpsrc.toml
[[sources]]
enable = true
key = "kafka_access_logs"
connect = "kafka_src"
tags = ["env:production", "type:access_log"]

[[sources.params]]
topic = ["nginx_access_log"]
```

### 高级配置
```toml
# wpsrc.toml
[[sources]]
enable = true
key = "kafka_advanced"
connect = "kafka_src"
tags = ["env:production", "type:advanced"]

[[sources.params]]
topic = ["access_log"]
config = [
    "auto_offset_reset=earliest",
    "enable_auto_commit=false"
]
```

### 安全集群配置
```toml
# wpsrc.toml
[[sources]]
enable = true
key = "kafka_secure_logs"
connect = "kafka_src"
tags = ["env:production", "security:tls"]

[[sources.params]]
topic = ["secure_events"]
config = [
    "auto_offset_reset=latest",
    "enable_auto_commit=true",
    "auto_commit_interval_ms=1000"
]
```

### 开发环境配置
```toml
# wpsrc.toml
[[sources]]
enable = true
key = "kafka_dev_logs"
connect = "kafka_src"
tags = ["env:development", "team:backend"]

[[sources.params]]
brokers = "dev-kafka:9092"
topic = ["dev_events"]
```

## 数据处理特性

### 1. 消息结构
每个 Kafka 消息被转换为数据包，包含：
- **消息体**: 消息的实际内容（payload）

### 2. 自动标签添加
系统会自动添加以下标签：
- `access_source`: 消息来源主题名称

示例：
```json
{
  "data": "原始消息内容",
  "tags": {
    "access_source": "access_log",
    "env": "production",
    "type": "access_log"
  }
}
```

### 3. 消费语义
- **消费者组 ID**: 通过 `group_id` 参数配置
- **Topic 自动创建**: 配置的主题不存在时会自动创建（1 个分区，复制因子为 1）
- **偏移量提交**: 由底层 rdkafka 库处理，可通过 config 参数配置

## 性能优化

### 1. 批量消费
```toml
[[sources.params]]
config = [
    "max_poll_records=1000",
    "fetch_min_bytes=1024",
    "fetch_max_wait_ms=100"
]
```

### 2. 连接优化
```toml
[[sources.params]]
config = [
    "session_timeout_ms=60000",
    "heartbeat_interval_ms=5000",
    "max_poll_interval_ms=600000"
]
```

## 相关文档

- [源配置基础](./01-sources_basics.md)
- [连接器管理](../README.md)
