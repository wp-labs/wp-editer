# Wpgen配置

配置写法
- conf/wpgen.toml（关键字段）
```toml
version = "1.0"

[generator]
mode = "sample"
count = 1000
# 0 为无限速，无限速并不一定是最快。
speed = 1000
parallel = 1

[output]
# 引用 connectors/sink.d 中的连接器 id；当该字段存在时，type/format 将被忽略
connect = "file_kv_sink"
name = "gen_out"
# 仅能覆写 allow_override 白名单内的键（新版使用 params；误写 params_override 将报错）
params = { base = "./src_dat", file = "gen.dat" }

[logging]
level = "warn"
output = "file"
file_path = "./data/logs/"

```

运行规则
- `wpgen` 会在加载 `conf/wpgen.toml` 时，若检测到 `[output].connect`：
- 从 `ENGINE_CONF.sink_root` 向上查找最近的 `connectors/sink.d/` 目录。
- 读取目标连接器并与 `params` 合并（仅允许 `allow_override` 中的键）。
