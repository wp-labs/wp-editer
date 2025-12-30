# Sinks 配置指南

本指南介绍如何配置和使用 Warp Parse 系统的各种数据输出（Sink）。

## 内容概览

- [Sink 配置基础](./00-sinks_basics.md)
- [Defaults 配置](./01-defaults.md)
- [Sinks 路由](./02-routing.md)
- [文件 Sink 配置](./12-file_sink.md)
- [Syslog Sink 配置](./13-syslog_sink.md)
- [Prometheus Sink 配置](./14-prometheus_sink.md)
- [TCP Sink 配置](./15-tcp_sink.md)

## 快速开始

1. 了解 [Sink 配置基础概念](./00-sinks_basics.md)
2. 阅读 [Defaults 配置](./01-defaults.md) 理解全局默认值
3. 阅读 [Sinks 路由](./02-routing.md) 了解路由配置
4. 根据你的输出类型选择相应的配置指南

## 支持的 Sink 类型

| 类型 | 说明 | 文档 |
|------|------|------|
| `blackhole` | 黑洞输出（用于测试） | - |
| `file` | 输出到本地文件 | [文件 Sink 配置](./12-file_sink.md) |
| `syslog` | 输出到 Syslog 服务器 (UDP/TCP) | [Syslog Sink 配置](./13-syslog_sink.md) |
| `tcp` | 输出到 TCP 服务端 | [TCP Sink 配置](./15-tcp_sink.md) |
| `kafka` | 输出到 Kafka | - |
| `prometheus` | Prometheus 指标暴露 | [Prometheus Sink 配置](./14-prometheus_sink.md) |

## 相关文档

- [连接器管理](../README.md)
- [Sources 配置指南](../01-sources/README.md)
