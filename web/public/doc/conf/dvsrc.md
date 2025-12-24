# dvsrc

## 配置示例:

```toml
[[source_file]]
key = "file_1"
path = "./src_dat/gen.dat"
onoff = "on"
encode = "text"
tags = ["dev_src_ip : 10.0.0.2", "vender_xxx : qax"]

[[source_file]]
key = "file_1"
path = "./src_dat/gen2.dat"
onoff = "off"
encode = "text"
tags = ["dev_src_ip : 10.0.0.1"]

[[source_kafka]]
key = "kafka_1"
brokers = "localhost:9092"
topic = ["test"]
config = ["enable.partition.eof = false", "enable.auto.commit = true", "enable.auto.offset.store = true", "receive.message.max.bytes = 100001000", "auto.offset.reset = earliest"]
onoff = "off"
tags = []

[[source_syslog]]
key = "syslog_1"
addr = "0.0.0.0"
port = 514
protocol = "udp"
tcp_recv_bytes = 10485760
onoff = "off"
tags = []
```



## 说明

当前支持数据源有:   file,syslog,kafka

### 共有的设置

#### key

source key : 必须配置

#### tags

```
tags = ["src_dev_ip : 10.0.0.1","dev_sn: /qax/dayu/1001"]
```

用于设置来自于源的信息. 可以携带到整个处理过程.

#### encode



#### onoff

开关

### source_file

#### path



### source_syslog

#### protocol

* tcp
* udp

```
protocol = "udp"
```





### source_kafka

