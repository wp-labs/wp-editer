# Source:file
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

字段说明
- `base`（string）+ `file`（string）或单一 `path`（string）
  - 类型：字符串（目录 + 文件名，或完整路径）
  - 默认：通常在 connector.params 指定
  - 约束：应指向可读文件；相对路径相对于工作目录
  - 示例：`base="data/in_dat"`、`file="gen.dat"` 或 `path="./data/in_dat/gen.dat"`
- `encode`（string）
  - 类型：`text|base64|hex`
  - 默认：`text`
  - 约束：与输入文件实际编码一致
  - 示例：`"text"`

allow_override（示例）
- 推荐：`allow_override = ["base","file","encode"]`（也兼容只暴露 `path` 的旧模板）

最小示例
```toml
[[sources]]
key = "file_1"
connect = "file_src"
params_override = { base = "data/in_dat", file = "gen.dat" }
```
