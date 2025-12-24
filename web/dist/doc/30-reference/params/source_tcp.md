# Source:tcp 参数参考

通用 TCP 源，支持按行或长度前缀分帧。

参数
- `addr`（string，默认 `0.0.0.0`）：监听地址
- `port`（int，默认 `9000`）：监听端口
- `framing`（string，默认 `auto`）：`auto|line|len`
- `prefer_newline`（bool，默认 `false`）：`auto` 模式下是否优先按行
- `tcp_recv_bytes`（int，默认 `10485760`）：单连接接收缓冲大小

连接器示例
```toml
[[connectors]]
id = "tcp_src"
type = "tcp"
allow_override = ["addr", "port", "framing", "tcp_recv_bytes", "prefer_newline"]
[connectors.params]
addr = "0.0.0.0"
port = 19000
framing = "auto"
prefer_newline = false
tcp_recv_bytes = 10485760
```

