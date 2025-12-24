# Sink:file
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段说明
- `fmt`（string）
  - 类型：`raw|json|kv|proto-text`
  - 默认：`json`（若未指定）
  - 建议：在 connector.params 设置，不在 route 中设置
- `base`（string）
  - 类型：目录路径
  - 默认：`"./data/out_dat"`
- `file`（string）
  - 类型：文件名
  - 默认：`"out.dat"`（示例）
- `path`（string）
  - 类型：完整文件路径（当未提供 base+file 时使用）

allow_override（示例）
- `allow_override = ["base","file","path"]`

示例
```toml
[[connectors]]
id = "file_json_sink"
type = "file"
allow_override = ["base","file","path"]
[connectors.params]
fmt  = "json"
base = "./data/out_dat"
file = "default.json"
```
