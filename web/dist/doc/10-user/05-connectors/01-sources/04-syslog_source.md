# Syslog 源配置

本文档详细介绍如何配置和使用 Warp Parse 系统的 Syslog 数据源。

## 概述

Syslog 源用于接收和解析标准的 Syslog 协议消息，支持 UDP 和 TCP 两种传输协议，以及多种 Syslog 格式。

## 连接器定义

### UDP Syslog 连接器

```toml
# connectors/source.d/10-syslog-udp.toml
[[connectors]]
id = "syslog_udp_src"
type = "syslog"
allow_override = ["addr", "port", "protocol", "tcp_recv_bytes", "header_mode", "prefer_newline"]

[connectors.params]
addr = "0.0.0.0"
port = 1514
protocol = "udp"
header_mode = "strip"
tcp_recv_bytes = 256000
```

### TCP Syslog 连接器

```toml
# connectors/source.d/11-syslog-tcp.toml
[[connectors]]
id = "syslog_tcp_src"
type = "syslog"
allow_override = ["addr", "port", "protocol", "tcp_recv_bytes", "header_mode", "prefer_newline"]

[connectors.params]
addr = "127.0.0.1"
port = 1514
protocol = "tcp"
header_mode = "strip"
tcp_recv_bytes = 256000
```

## 支持的参数

### 基础网络参数

#### addr (必需)
监听地址

```toml
[[sources.params]]
addr = "0.0.0.0"    # 监听所有接口
addr = "127.0.0.1"   # 仅本地接口
addr = "10.0.0.100"  # 特定接口
```

#### port (必需)
监听端口

```toml
[[sources.params]]
port = 1514          # 自定义端口
port = 514           # 标准 syslog 端口 (需要 root 权限)
```

#### protocol (必需)
传输协议

```toml
[[sources.params]]
protocol = "udp"     # UDP 协议 (低延迟)
protocol = "tcp"     # TCP 协议 (可靠传输)
```

### 消息处理参数

#### header_mode
头部处理模式

```toml
[[sources.params]]
header_mode = "strip"   # 仅剥离头部，不注入标签 (默认)
header_mode = "parse"   # 解析+注入标签+剥离头部
header_mode = "keep"    # 保留头部，原样透传
```

#### prefer_newline
优先按换行进行分帧（对纯换行流量更高效）

```toml
[[sources.params]]
prefer_newline = true   # 优先换行分帧
prefer_newline = false  # 默认：先尝试长度前缀，再回退换行
```

### TCP 专用参数

#### tcp_recv_bytes
TCP 接收缓冲区大小

```toml
[[sources.params]]
tcp_recv_bytes = 256000      # 256KB (默认)
tcp_recv_bytes = 10485760    # 10MB
tcp_recv_bytes = 104857600   # 100MB (高性能)
```

## 配置示例

### 基础 UDP 配置
```toml
# wpsrc.toml
[[sources]]
enable = true
key = "syslog_udp_1"
connect = "syslog_udp_src"
tags = ["protocol:udp", "env:production"]

[[sources.params]]
addr = "0.0.0.0"
port = 1514
protocol = "udp"
```

### 基础 TCP 配置
```toml
# wpsrc.toml
[[sources]]
enable = true
key = "syslog_tcp_1"
connect = "syslog_tcp_src"
tags = ["protocol:tcp", "env:production"]

[[sources.params]]
addr = "127.0.0.1"
port = 1514
protocol = "tcp"
prefer_newline = true
```

### 双协议配置
```toml
# wpsrc.toml
[[sources]]
enable = true
key = "syslog_udp_collector"
connect = "syslog_udp_src"

[[sources.params]]
addr = "0.0.0.0"
port = 1514
protocol = "udp"
header_mode = "strip"

[[sources]]
enable = true
key = "syslog_tcp_aggregator"
connect = "syslog_tcp_src"

[[sources.params]]
addr = "127.0.0.1"
port = 1515
protocol = "tcp"
header_mode = "parse"
prefer_newline = true
tcp_recv_bytes = 1048576
```

## 数据处理特性

### 1. Syslog 格式支持

#### RFC3164 格式 (传统 BSD Syslog)
```
<34>Oct 11 22:14:15 mymachine su: 'su root' failed for lonvick on /dev/pts/8
```

#### RFC5424 格式 (现代 Syslog)
```
<165>1 2003-10-11T22:14:15.003Z mymachine.example.com evntslog - ID47 [exampleSDID@32473 iut="3" eventSource="Application" eventID="1011"] BOMAn application event log entry
```

### 2. 解析字段

当 `header_mode = "parse"` 时，系统会解析并添加以下标签：

```json
{
  "data": "原始消息内容",
  "tags": {
    "source_type": "syslog",
    "syslog_priority": 34,        // 数值优先级
    "syslog_facility": 4,         // 设施代码
    "syslog_severity": 2,         // 严重性级别
    "syslog_hostname": "mymachine",
    "syslog_app_name": "su",
    "syslog_proc_id": "1234",     // 进程ID (RFC5424)
    "syslog_msg_id": "ID47",      // 消息ID (RFC5424)
    "syslog_timestamp": "Oct 11 22:14:15"
  }
}
```

### 3. 分帧/头部处理优化
```toml
# 高性能场景：
header_mode = "strip"         # 仅去头，减少解析与标签注入

# 分析场景：
header_mode = "parse"         # 解析并注入协议相关元信息
prefer_newline = false        # 混合/长度前缀较多时保持默认顺序
```

## 相关文档

- [源配置基础](./01-sources_basics.md)
- [连接器管理](../README.md)
