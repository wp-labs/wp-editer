# Source:syslog
<!-- 角色：开发者 | 最近验证：2025-10-29 -->

字段说明
- `addr`（string）
  - 类型：IP/主机名（监听）
  - 默认：`"0.0.0.0"`
- `port`（int）
  - 类型：0..=65535
  - 默认：`1514`（建议非特权端口）
- `protocol`（string）
  - 类型：`UDP|TCP`（不区分大小写）
  - 默认：`UDP`
- `tcp_recv_bytes`（int）
  - 类型：> 0（可选）
  - 默认：无
- `header_mode`（string）
  - 类型：`keep|strip|parse`
  - 默认：`parse`
  - 含义：头部处理模式
    - `keep`：保留头部，原样透传（不注入标签）
    - `strip`：去掉头部，仅保留消息体（不注入标签）
    - `parse`：解析头部，注入标签，并去掉头部
- `prefer_newline`（bool）
  - 类型：布尔
  - 默认：`false`
  - 含义：优先按换行进行分帧；对纯换行流量可降低固定解析开销（3%~8%），混合场景仍保持正确性（遇到合法长度前缀但数据未齐时会等待）

allow_override（示例）
- `allow_override = ["addr","port","protocol","tcp_recv_bytes","header_mode","prefer_newline"]`

示例
```toml
[[sources]]
key  = "syslog_udp"
connect = "syslog_udp_main"
params_override = { header_mode = "parse", prefer_newline = true }

升级说明（Breaking）
- 移除：`strip_header`、`attach_meta_tags`、`process_header`；请改用三态 `header_mode`。
- 语义映射：
  - `keep`  ⇔ 旧 `strip_header=false` 且 `attach_meta_tags=false`
  - `strip` ⇔ 旧 `strip_header=true`  且 `attach_meta_tags=false`
  - `parse` ⇔ 旧 `strip_header=true`  且 `attach_meta_tags=true`
```
