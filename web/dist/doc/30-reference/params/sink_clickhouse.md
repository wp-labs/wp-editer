# Sink:clickhouse
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段说明
- `endpoint`（string）
  - 默认：`"http://127.0.0.1:8123"`
- `username`（string）/ `password`（string）
  - 默认：`dayu` / `wparse`
- `database`（string）
  - 默认：`wparse`

示例（连接器）
```toml
[[connectors]]
id = "ck_main"
type = "clickhouse"
allow_override = []
[connectors.params]
endpoint = "http://127.0.0.1:8123"
database = "wparse"
username = "dayu"
password = "wparse"
```
