# 数据源

## 支持类型



###  File

```toml
[[source_file]]
key  = "file_1"
path = "./source/gen.dat"
onoff = "on"
```



###  syslog

* syslog 支持TCP/UDP两种协议

```toml
[[source_syslog]]
key  = "syslog_1"
addr = "0.0.0.0"
port = 514
protocol = "udp"
tcp_recv_bytes = 10485760
onoff = "off"
```



### kafka

```toml
[[source_kafka]]
key  = "kafka_1"
brokers = "localhost:9092"
topic = ["test"]
config = ["enable.partition.eof = false", "enable.auto.commit = true", "enable.auto.offset.store = true", "receive.message.max.bytes = 100001000", "auto.offset.reset = earliest"]
onoff = "off"
```

