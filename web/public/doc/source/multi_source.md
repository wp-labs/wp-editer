## 多数据源

* 支持多源同时接收数据处理. 把源的 onoff 设置为 “on" 即可.

  

#### 示例: 两端口接收syslog

```toml
[[source_syslog]]
key = "syslog_1"
addr = "0.0.0.0"
port = 514
protocol = "tcp"
tcp_recv_bytes = 10485760
onoff = "on"

[[source_syslog]]
key = "syslog_2"
addr = "0.0.0.0"
port = 614
protocol = "tcp"
tcp_recv_bytes = 10485760
onoff = "on"
```

#### 示例:  kafka + syslog 

```toml
[[source_kafka]]
key = "kafka_1"
brokers = "localhost:9092"
topic = ["test"]
config = ["enable.partition.eof = false", "enable.auto.commit = true", "enable.auto.offset.store = true", "receive.message.max.bytes = 100001000", "auto.offset.reset = earliest"]
onoff = "on"

[[source_syslog]]
key = "syslog_1"
addr = "0.0.0.0"
port = 514
protocol = "tcp"
tcp_recv_bytes = 10485760
onoff = "on"
```