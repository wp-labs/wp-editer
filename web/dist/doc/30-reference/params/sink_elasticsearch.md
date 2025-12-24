# Sink:elasticsearch
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段说明
- `endpoint`（string）
  - 默认：`"http://127.0.0.1:9200"`
- `username`（string）/ `password`（string）
  - 默认：`elastic` / `wparse`
- `batch`（int，可选）
  - 默认：无（不设置则走实现默认）
- `table`（string，可选）
  - 默认：无

示例（连接器）
```toml
[[connectors]]
id = "es_main"
type = "elasticsearch"
allow_override = []
[connectors.params]
endpoint = "http://127.0.0.1:9200"
username = "elastic"
password = "wparse"
```
