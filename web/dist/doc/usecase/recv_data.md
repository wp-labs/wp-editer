#  接收数据

 

wpflow 可以接收来自于 syslog、Kafka 的数据.



在工作目录下运行

```
#生成配置文件
wpflow init 

```



配置 srouce/wpsrc.toml 



```toml
[[source_file]]
key = "file_gen1"
path = "./src_dat/gen.dat"
onoff = "on"
encode = "text"

[[source_file]]
key = "file_gen2"
path = "./src_dat/gen2.dat"
onoff = "on"
encode = "text"

[[source_kafka]]
key = "kafka_1"
brokers = "localhost:9092"
topic = ["test"]
config = ["enable.partition.eof = false", "enable.auto.commit = true", "enable.auto.offset.store = true", "receive.message.max.bytes = 100001000", "auto.offset.reset = earliest"]
onoff = "off"

[[source_syslog]]
key = "syslog_514"
addr = "0.0.0.0"
port = 514
protocol = "udp"
tcp_recv_bytes = 10485760
onoff = "off"
```



