# 文件 Sink 配置

本文档介绍文件型 Sink 的现行配置与能力，已与代码实现对齐。

## 概述

文件 Sink 将处理后的数据写入本地文件系统，支持多种输出格式和灵活的路径配置。常用于离线验收、归档与调试。

支持的输出格式（`fmt`）：`json`、`csv`、`kv`、`raw`、`proto`、`proto-text`（默认 `json`）。

## 连接器定义

推荐直接使用仓库自带模板（位于 `connectors/sink.d/`）：

```toml
# JSON
[[connectors]]
id = "file_json_sink"
type = "file"
allow_override = ["base","file"]
[connectors.params]
fmt  = "json"
base = "./data/out_dat"
file = "default.json"

# Prototext
[[connectors]]
id = "file_proto_sink"
type = "file"
allow_override = ["base","file"]
[connectors.params]
fmt  = "proto-text"
base = "./data/out_dat"
file = "default.dat"

# Raw
[[connectors]]
id = "file_raw_sink"
type = "file"
allow_override = ["base","file"]
[connectors.params]
fmt  = "raw"
base = "./data/out_dat"
file = "default.raw"
```


## 可用参数（路由 `params`）

- `base` + `file`：目标目录与文件名（推荐写法）。
- `fmt`：输出格式（见上）。

说明：文件 Sink 会自动创建父目录；内部使用缓冲写入并按批次刷新，无“手动缓冲大小/同步模式”等参数。

## 配置示例

1) 基础 JSON 输出
```toml
# business.d/json_output.toml
version = "2.0"
[sink_group]
name = "/sink/json_output"
oml  = ["logs"]

[[sink_group.sinks]]
name = "json"
connect = "file_json_sink"
params = { base = "/var/log/warpflow", file = "application.json" }
```

2) 错误日志分离（按过滤器）
```toml
version = "2.0"
[sink_group]
name = "/sink/error_logs"
oml  = ["application_logs"]

[[sink_group.sinks]]
name = "all"
connect = "file_json_sink"
params = { file = "all.json" }

[[sink_group.sinks]]
name = "err"
connect = "file_json_sink"
filter = "./error_filter.wpl"
params = { file = "err.json" }
```
