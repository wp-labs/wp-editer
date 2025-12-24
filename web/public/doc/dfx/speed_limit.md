# 限速



为保护后端的sink 的接收能力.  wpflow 提供读取  source  的限速能力.



##  wpflow.toml 配置:

```toml
[main_conf]
source_ref = "source_file"
rule = "./ldm/"
parallel = 2
#每秒读取数
speed_limit = 100000
```



