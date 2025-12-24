# Sink:tcp 参数参考

通用 TCP 输出，支持 `line`（行分帧）与 `len`（长度前缀）两种模式。

参数
- `addr`（string，默认 `127.0.0.1`）：目标地址
- `port`（int，默认 `9000`）：目标端口
- `framing`（string，默认 `line`）：`line|len`

连接器示例
```toml
[[connectors]]
id = "tcp_sink"
type = "tcp"
allow_override = ["addr", "port", "framing"]
[connectors.params]
addr = "127.0.0.1"
port = 19000
framing = "line"
```

