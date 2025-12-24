# Wparse配置规范

完整示例（推荐默认）
```toml
version = "1.0"
robust  = "normal"           # debug|normal|strict

[models]
wpl     = "./models/wpl"
oml     = "./models/oml"

[topology]
sources = "./topology/sources"
sinks   = "./topology/sinks"

[performance]
rate_limit_rps = 10000        # 限速（records/second）
parse_workers  = 2            # 解析并发 worker 数

[rescue]
path = "./data/rescue"        # 兜底/残留/错误数据目录

[log_conf]
output = "File"               # Console|File|Both
level  = "warn,ctrl=info"

[log_conf.file]
path = "./data/logs"          # 文件输出目录；文件名自动取可执行名（wparse.log）

[stat]

[[stat.pick]]                 # 采集阶段统计
key    = "pick_stat"
target = "*"

[[stat.parse]]                # 解析阶段统计
key    = "parse_stat"
target = "*"

[[stat.sink]]                 # 下游阶段统计
key    = "sink_stat"
target = "*"
```

字段说明与默认值
- `version`：固定为 `1.0`
- `[models]`：各目录的相对路径（相对工作根）；默认如示例
- `[performance].rate_limit_rps`：整型，默认 `10000`
- `[performance].parse_workers`：整型，默认 `2`；可被 `--parse-workers` 覆盖
- `[rescue].path`：兜底/残留/错误数据目录，默认 `./data/rescue`
- `[log_conf]`：日志配置
  - `output`：`Console|File|Both`
  - `level`：字符串预设（逗号分隔的 root 与定向级别）；或使用结构化写法：
    ```toml
    [log_conf]
    output = "File"
    [log_conf.levels]
    global = "warn"
    ctrl   = "info"
    launch = "info"
    ```
  - `[log_conf.file].path`：文件输出目录（不存在会自动创建）
- `[stat]`：统计窗口秒数（默认 60）；分阶段条目置于 `[[stat.pick]]/[[stat.parse]]/[[stat.sink]]`
  - `key`：统计项标识；`target`：`"*"|"ignore"|自定义（如 "sink:demo"）`
  - `fields`：聚合维度数组；`top_n`：输出条目上限（默认 20）
