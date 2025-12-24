# Sink  Group 



## 结构

```
Group
|--Sink1
|--Sink2
|--Sink3
```



### 规则

* Group 下可以存在多个 Sink
* 默认下, Sink 复制全量数据
* Sink 可以设置 Filter



## 示例

```toml
version = "1.0"

[sink_group]
name = "skyeye_stat"
rule = ["skyeye_stat/*"]
adm = "skyeye_stat/adm.toml"

[[sink_group.sinks]]
name = "skyeye_stat_file_sink"

[sink_group.sinks.fmt]
fmt = "json"

[sink_group.sinks.target.file]
path = "./out/skyeye_stat.dat"
```





## 可用Sink

* File
* Kafka
* Mysql
* ES
* CK
* Null



### Null 配置示例

```toml
[[sink_group.sinks]]
name = "benchmark_null_sink"
fmt = "kv"
[sink_group.sinks.target.null]

```



### kafka 



#### wpcfg 指令

```
wpcfg ldm example --sink kafka
```
#### wpcfg 输出
```
success init : ./ldm/example/adm.toml
success init : ./sink/example/pdm.toml
success init : ./ldm/example/table.sql
success init : ./ldm/example/gen_rule.wpl
success init : ./ldm/example/gen_field.toml
success init : ./ldm/example/parse.wpl
success init : ./ldm/example/sample.dat
success init : ./ldm/example/tolerance.dat
success init : ./sink/example/sink.toml
```

#### 生成的sink.toml

```toml
version = "1.0"

[sink_group]
name = "example"
rule = ["/example/*"]
adm = "example/#adm.toml"

[[sink_group.sinks]]
name = "example_kafka_sink"

[sink_group.sinks.fmt]
fmt = "kv"

[sink_group.sinks.target.kafka]
brokers = "localhost:9092"
topic = "example"
num_partitions = 3
replication = 1
config = ["queue.buffering.max.messages = 50000", "queue.buffering.max.kbytes = 2147483647", "message.max.bytes = 10485760"]

```



可以在此文件上进行修改.

### mysql

```
wpcfg ldm example --sink mysql
```



```
success init : ./ldm/example/adm.toml
success init : ./sink/example/pdm.toml
success init : ./ldm/example/table.sql
success init : ./ldm/example/gen_rule.wpl
success init : ./ldm/example/gen_field.toml
success init : ./ldm/example/parse.wpl
success init : ./ldm/example/sample.dat
success init : ./ldm/example/tolerance.dat
success init : ./sink/example/sink.toml
```



#### sink.toml

```toml
version = "1.0"

[sink_group]
name = "example"
rule = ["/example/*"]
adm = "example/#adm.oml"

[[sink_group.sinks]]
name = "example_mysql_sink"
pdm = "example/pdm.oml"

[sink_group.sinks.target.mysql]
endpoint = "localhost:3306"
username = "root"
password = "dayu"
database = "wpflow"


```

