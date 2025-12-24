# Sink:kafka
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段说明
- `brokers`（string）
  - 类型：host:port 列表（逗号分隔）
  - 默认：`"localhost:9092"`（示例）
- `topic`（string|array<string>）
  - 类型：字符串或字符串数组
  - 默认：`"test"`（示例）
- `num_partitions`（int）
  - 类型：整数（可选）
  - 默认：`1`
- `replication`（int）
  - 类型：整数（可选）
  - 默认：`1`
- `config`（array<string>）
  - 类型：字符串数组（可选）
  - 默认：无；项形如 `key=value`

allow_override（示例）
- `allow_override = ["topic","config","num_partitions","replication"]`

示例（连接器）
```toml
[[connectors]]
id = "kafka_main"
type = "kafka"
allow_override = ["topic"]
[connectors.params]
brokers = "localhost:9092"
topic   = ["access_log"]
```
