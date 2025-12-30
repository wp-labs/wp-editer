# Sources 配置指南

本指南介绍如何配置和使用 Warp Parse 系统的各种数据源。

## 内容概览

- [源配置基础](./01-sources_basics.md)
- [文件源配置](./02-file_source.md)
- [Kafka 源配置](./03-kafka_source.md)
- [Syslog 源配置](./04-syslog_source.md)
- [TCP 源配置](./08-tcp_source.md)
- [DataRecord 机制数据字段](./09-metadata.md)

## 快速开始

1. 了解 [源配置基础概念](./01-sources_basics.md)
2. 根据你的数据源类型选择相应的配置指南
3. 参考连接器管理文档了解连接器定义

## 支持的数据源类型

| 类型 | 说明 | 文档 |
|------|------|------|
| `file` | 从本地文件读取数据 | [文件源配置](./02-file_source.md) |
| `kafka` | 从 Kafka 消费消息 | [Kafka 源配置](./03-kafka_source.md) |
| `syslog` | 接收 Syslog 协议数据 (UDP/TCP) | [Syslog 源配置](./04-syslog_source.md) |
| `tcp` | 通过 TCP 接收数据 | [TCP 源配置](./08-tcp_source.md) |

## 相关文档

- [连接器管理](../README.md)
- [Sinks 配置指南](../02-sinks/README.md)
