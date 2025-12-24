# sink framework
```toml
[[group]]
name = "default"
rule = ["*"]

[[group.sinks]]
name = "default_sink"
fmt = "kv"

[group.sinks.target.file]
path = "./out/default.dat"

[[miss.sinks]]
name = "miss_sink"
fmt = "raw"

[miss.sinks.target.file]
path = "./out/miss.dat"

[[monitor.sinks]]
name = "monitor_sink"
fmt = "kv"

[monitor.sinks.target.file]
path = "./out/monitor.dat"
```

