# wpgen



```toml
version = "1.0"

[main_conf]
gen_ref = "sample_gen"
gen_speed = 1000
gen_count = 1000
gen_secs = 0
# 并行数
gen_parallel = 1
#输出设置
out_ref = "out_file"

[rule_gen]
rule_path = "./ldm/"

[sample_gen]
path = "./ldm/"
fmt = "raw"

[out_file.target.file]
path = "./gen.dat"

[out_kafka.fmt]
fmt = "raw"

[out_kafka.target.kafka]
brokers = "localhost:9092"
topic = "test"
fmt = "raw"

[out_syslog.target.syslog]
addr = "127.0.0.1"
port = 514
protocol = "udp"
```



