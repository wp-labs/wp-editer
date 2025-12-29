# Wparse配置

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
path = "./data/rescue"        

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
