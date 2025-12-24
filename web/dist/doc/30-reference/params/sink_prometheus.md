# Sink:prometheus
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段说明
- `endpoint`（string）
  - 默认：`"0.0.0.0:9090"`
- `source_key_format`（string）
  - 默认：`"(?P<source_type>.*)_(?P<access_source>.*)"`
- `sink_key_format`（string）
  - 默认：`"(?P<rule>.*)_(?P<sink_type>.*)_sink"`

示例（连接器）
```toml
[[connectors]]
id = "prometheus_local"
type = "prometheus"
allow_override = []
[connectors.params]
endpoint = "0.0.0.0:9090"
```
