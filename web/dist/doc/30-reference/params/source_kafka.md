# Source:kafka
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

## 概述

Kafka source 用于从 Apache Kafka 消息队列中消费数据，支持多主题消费、消费者组管理和自动主题创建。

## 字段说明

### `brokers`（string）
- **类型**：字符串
- **必需**：是
- **说明**：Kafka broker 地址列表，多个地址用逗号分隔
- **示例**：`"localhost:9092"`、`"kafka1:9092,kafka2:9092,kafka3:9092"`

### `topic`（array）
- **类型**：字符串数组或单个字符串
- **必需**：是
- **说明**：要消费的主题列表
- **示例**：`"access_log"`、`["user_events", "system_events", "error_logs"]`

### `group_id`（string）
- **类型**：字符串
- **必需**：否
- **默认值**：基于 source key 自动生成（格式：`{key}_group`）
- **说明**：消费者组 ID，相同 group_id 的消费者会分摊主题分区
- **示例**：`"access_consumer"`

### `config`（array）
- **类型**：字符串数组
- **必需**：否
- **说明**：额外的 Kafka 配置参数，格式为 `"key=value"`
- **约束**：每项必须符合 `key=value` 格式
- **示例**：`["auto.offset.reset=earliest", "enable.auto.commit=true"]`

## allow_override 示例

```toml
allow_override = ["topic", "group_id", "config"]
```

## 连接器示例

```toml
# connectors/source.d/kafka-main.toml
[[connectors]]
id = "kafka_main"
type = "kafka"
allow_override = ["topic", "group_id", "config"]
[connectors.params]
brokers = "localhost:9092"
topic = ["access_log"]
group_id = "wpgen_consumer"
```

## 路由配置示例

### 最小示例
```toml
[[sources]]
key = "kafka_access"
connect = "kafka_main"
params_override = {
    topic = ["access_log"],
    config = ["auto.offset.reset=earliest"]
}
```

### 基础配置
```toml
[[sources]]
key = "kafka_events"
connect = "kafka_main"
params_override = {
    topic = ["user_events", "system_events"],
    group_id = "event_processor",
    config = [
        "auto.offset.reset=earliest",
        "enable.auto.commit=true"
    ]
}
tags = ["source:kafka", "type:event"]
```

### 高级配置
```toml
[[sources]]
key = "kafka_production"
connect = "kafka_cluster"
params_override = {
    topic = ["prod_orders", "prod_payments"],
    group_id = "production_processor",
    config = [
        "auto.offset.reset=latest",
        "enable.auto.commit=false",
        "isolation.level=read_committed",
        "session.timeout.ms=30000",
        "heartbeat.interval.ms=10000",
        "max.poll.records=100"
    ]
}
tags = ["source:kafka", "env:production", "type:transaction"]
```

## 常用配置参数

### 偏移量管理
- `auto.offset.reset=earliest`：从最早的消息开始消费
- `auto.offset.reset=latest`：从最新的消息开始消费
- `auto.offset.reset=none`：抛出异常如果找不到有效偏移量

### 提交策略
- `enable.auto.commit=true`：自动提交偏移量
- `enable.auto.commit=false`：手动提交偏移量（推荐精确控制）
- `auto.commit.interval.ms=1000`：自动提交间隔

### 会话管理
- `session.timeout.ms=10000`：消费者会话超时时间
- `heartbeat.interval.ms=3000`：心跳发送间隔
- `max.poll.interval.ms=300000`：最大轮询间隔

### 性能调优
- `max.poll.records=500`：单次轮询最大记录数
- `fetch.min.bytes=1`：最小拉取字节数
- `fetch.max.wait.ms=500`：最大等待时间

### 事务支持
- `isolation.level=read_uncommitted`：读取未提交消息（默认）
- `isolation.level=read_committed`：仅读取已提交消息

## 配置场景示例

### 开发环境
```toml
[[sources]]
key = "kafka_dev"
connect = "kafka_main"
params_override = {
    topic = ["dev_logs"],
    config = [
        "auto.offset.reset=earliest",
        "max.poll.records=50"
    ]
}
```

### 生产环境
```toml
[[sources]]
key = "kafka_prod"
connect = "kafka_cluster"
params_override = {
    topic = ["prod_events"],
    group_id = "prod_consumer_v1",
    config = [
        "auto.offset.reset=latest",
        "enable.auto.commit=false",
        "isolation.level=read_committed"
    ]
}
```

### 高吞吐场景
```toml
[[sources]]
key = "kafka_high_throughput"
connect = "kafka_main"
params_override = {
    topic = ["high_volume_logs"],
    config = [
        "max.poll.records=1000",
        "fetch.min.bytes=1024",
        "fetch.max.wait.ms=100"
    ]
}
```

## 故障排查

### 连接问题
- 检查 broker 地址和网络连通性
- 验证 Kafka 集群状态
- 确认防火墙设置

### 主题问题
- 主题不存在时会自动创建（1个分区，1个副本）
- 建议预先创建主题并配置合适的分区数
- 检查主题权限

### 消费延迟
- 监控消费者 lag 指标
- 调整消费者实例数量
- 优化处理逻辑性能

### 配置错误
- 检查 `group_id` 是否唯一
- 验证 `config` 参数格式
- 确认 `topic` 名称正确

## 最佳实践

1. **消费者组命名**：使用有意义的 group_id，包含应用版本信息
2. **偏移量管理**：生产环境建议手动提交偏移量以确保精确控制
3. **错误处理**：实现合适的重试机制和异常处理
4. **监控告警**：设置消费延迟和错误率监控
5. **性能调优**：根据数据量调整批处理和轮询参数
6. **版本兼容**：考虑序列化格式的向后兼容性
