# Sink:syslog
<!-- 角色：开发者 | 最近验证：2025-10-15 -->

## 概述

Syslog sink 用于将数据输出到 Syslog 服务器，支持 UDP 和 TCP 协议，遵循 RFC3164 格式标准。

## 字段说明

### `addr`（string）
- **类型**：IP 地址或主机名
- **默认值**：`"127.0.0.1"`
- **说明**：Syslog 服务器地址
- **示例**：`"192.168.1.100"`、`"syslog.example.com"`

### `port`（int）
- **类型**：端口号（1-65535）
- **默认值**：`514`
- **说明**：Syslog 服务器端口
- **注意**：514 是标准 syslog 端口，但需要特权权限，生产环境建议使用非特权端口如 1514

### `protocol`（string）
- **类型**：协议类型
- **可选值**：`"UDP"`、`"TCP"`（不区分大小写）
- **默认值**：`"UDP"`
- **说明**：传输协议选择
- **UDP**：无连接，性能更好，可能丢包
- **TCP**：有连接，可靠传输，性能略低

## allow_override 示例

```toml
allow_override = ["addr", "port", "protocol"]
```

## 连接器示例

```toml
# connectors/sink.d/syslog-main.toml
[[connectors]]
id = "syslog_main"
type = "syslog"
allow_override = ["addr", "port", "protocol"]
[connectors.params]
addr = "127.0.0.1"
port = 514
protocol = "udp"
```

## 路由配置示例

```toml
# models/sinks/business.d/syslog-alerts.toml
version = "2.0"
[sink_group]
name = "syslog_alerts"
oml = ["/oml/alert/*"]

[[sink_group.sinks]]
name = "alerts"
connect = "syslog_main"
params = {
    addr = "syslog.example.com",
    port = 1514,
    protocol = "tcp"
}
```

## 消息格式

输出消息遵循 RFC3164 格式：
```
<PRI>TIMESTAMP HOSTNAME TAG: MESSAGE
```

- **PRI**：固定为 13（facility=user, severity=notice）
- **TIMESTAMP**：本地时间格式（如：`Oct 14 10:30:45`）
- **HOSTNAME**：本地主机名
- **TAG**：固定为 `wpgen`
- **MESSAGE**：实际数据内容

### TCP 协议注意事项
- TCP 连接会在每条消息后自动添加换行符 `\n`
- 支持连接重连机制

### UDP 协议注意事项
- 使用 4MB 发送缓冲区提高可靠性
- 绑定到本地临时端口进行发送

## 常见配置场景

### 开发环境
```toml
[[connectors]]
id = "syslog_dev"
type = "syslog"
allow_override = ["addr", "port", "protocol"]
[connectors.params]
addr = "127.0.0.1"
port = 1514    # 非特权端口
protocol = "udp"
```

### 生产环境（TCP）
```toml
[[connectors]]
id = "syslog_prod"
type = "syslog"
allow_override = ["addr", "port"]
[connectors.params]
addr = "syslog.company.com"
port = 514
protocol = "tcp"
```

### 高可用配置
```toml
# models/sinks/business.d/syslog-ha.toml
version = "2.0"
[sink_group]
name = "syslog_ha"
oml = ["/oml/critical/*"]

[[sink_group.sinks]]
name = "primary"
connect = "syslog_main"
params = { addr = "syslog1.example.com" }

[[sink_group.sinks]]
name = "backup"
connect = "syslog_main"
params = { addr = "syslog2.example.com" }
```

## 故障排查

### 连接问题
- 检查防火墙设置，确保端口开放
- 验证 Syslog 服务器是否正常运行
- 确认网络连通性

### UDP 丢包
- 考虑使用 TCP 协议提高可靠性
- 检查网络带宽和延迟
- 监控系统缓冲区使用情况

### 性能优化
- 对于高吞吐场景，建议使用 TCP 协议
- 调整系统网络参数优化 UDP 性能
- 考虑使用负载均衡分散多个 Syslog 服务器
