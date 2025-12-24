# Sink Route Struct

* sink route 由多 标准的 sink framework 和 diy sink group 组成
* sink group 由 1或多个 sink 组成 



![](../images/wpflow/‎wpflow.‎015.jpeg)



## Sink Group 框架 :  

**./sink/framework.toml**

* default
* miss 
* residue
* intercept
* monitor
* error

``` toml
[default]
name = "default"

[[default.sinks]]
name = "default_sink"
fmt = "proto-text"
target = "file"
path = "./out/default.dat"

[miss]
name = "miss"

[[miss.sinks]]
name = "miss_sink"
fmt = "raw"
target = "file"
path = "./out/miss.dat"

[residue]
name = "residue"

[[residue.sinks]]
name = "residue_sink"
fmt = "raw"
target = "file"
path = "./out/residue.dat"

[intercept]
name = "intercept"

[[intercept.sinks]]
name = "intercept_sink"
fmt = "proto-text"
target = "file"
path = "./out/intercept.dat"

[monitor]
name = "monitor"
rule = []
oml = []

[[monitor.sinks]]
name = "monitor_sink"
fmt = "proto-text"
target = "file"
path = "./out/monitor.dat"

[error]
name = "error"

[[error.sinks]]
name = "err_sink"
fmt = "raw"
target = "file"
path = "./out/error.dat"
```





##   自定义 Sink



```toml
version = "1.0"

[sink_group]
name = "csv_example"
oml = ["csv_example"]

[[sink_group.sinks]]
name = "csv_example_file_sink"
fmt = "proto-text"
target = "file"
path = "./out/csv_example.dat"
```



## 配置说明



### SinkGroup

#### oml 

​	匹配输出到此 sink group 的模型

### Sink

#### fmt 

* json
* csv
* proto-text
* raw

#### Target

* File

* Kafka

* Mysql

* ES

* CK

  