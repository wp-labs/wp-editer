# wpflow.toml 

主配置文件



```toml
version = "1.0"
ldm_root = "./ldm"
sink_root = "./sink"
rescue_root = "./rescue"
lib_root = "./lib"
parallel = 2
speed_limit = 10000

[log_conf]
level = "warn,ctrl=info,launch=info"
output = "File"
output_path = "./logs/"
```

