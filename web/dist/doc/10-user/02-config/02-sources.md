# 源配置（Sources）
<!-- 角色：使用配置者 | 最近验证：2025-12-21 -->

## 概览

Source（源）是 warp-flow 系统中负责数据输入的组件，支持多种数据源和协议。采用统一的连接器架构，提供灵活的数据接入能力。

### 定位与目录
- **配置文件**：`$WORK_ROOT/topology/sources/wpsrc.toml`
- **连接器定义**：从 `$WORK_ROOT/models/sources` 起向上查找最近的 `connectors/source.d/*.toml`（≤32 层）

### 核心概念
- **连接器**：可复用的输入连接定义，包含 `id/type/params/allow_override`
- **参数覆写**：通过白名单机制安全覆写连接器参数
- **标签系统**：支持为数据源添加标签，便于路由和过滤

## 支持的 Source 类型

### 内置 Source
- **file**：文件输入，支持监控和轮询
- **null**：空输入，用于测试
- **syslog**：Syslog 协议输入（UDP/TCP）
- **tcp**：Syslog 协议输入（UDP/TCP）

### 扩展 Source
- **kafka**：Apache Kafka 消息队列输入

## 配置规则

### 基本规则
- 仅支持 `[[sources]] + connect/params` 格式
- 覆写键必须 ∈ connector `allow_override` 白名单；超出即报错
- `enable` 字段控制是否启用（默认 true）
- `tags` 字段支持添加数据源标签

### 配置结构
```toml
[[sources]]
key = "source_identifier"           # 源的唯一标识
connect = "connector_id"            # 引用的连接器 ID
enable = true                       # 是否启用（可选，默认 true）
tags = ["source:tag1", "type:log"]  # 标签（可选）
params = {                 # 参数覆写（可选）
    # 覆写连接器参数
}
```

## 配置示例

### 最小示例
```toml
[[sources]]
key = "file_1"
connect = "file_src"
params = { base = "data/in_dat", file = "gen.dat" }
```

### 文件输入示例
```toml
# models/sources/wpsrc.toml
[[sources]]
key = "access_log"
connect = "file_src"
params = {
    base = "./logs",
    file = "access.log",
    encode = "text"
}
tags = ["type:access", "env:prod"]
```

### Syslog 输入示例
```toml

# models/sources/wpsrc.toml
[[sources]]
key = "syslog_udp"
connect = "syslog_udp_src"
params = {
    port = 1514,
    header_mode = "parse",
    prefer_newline = true
}
tags = ["protocol:syslog", "transport:udp"]
```



### TCP 输入示例（通用 TCP 行/长度分帧）
```toml

# models/sources/wpsrc.toml
[[sources]]
key = "tcp_in"
connect = "tcp_src"
enable = true
params= {
  port = 19000,
  framing = "auto",
  prefer_newline = true
}
```


## 标签系统

### 标签用途
- **路由选择**：基于标签进行数据路由
- **过滤条件**：在处理流程中基于标签过滤
- **监控统计**：按标签维度进行数据统计