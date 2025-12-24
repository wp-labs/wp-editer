#  过滤器

在 sink  group 中 对数据进行过滤输出.

##  配置

基于sink.toml

```toml
[[sink_group.sinks]]
name = "/sink/example/simple_filter_sink"
fmt = "kv"
target = "file"
path = "./out//sink/example/simple.kv"
filter = "./filter.conf"

```
*  filter 支持相对路径文件(相对sink.toml目录) 和绝对路径文件


## filter.conf

```
$src_ip > ip(10.0.10.0) && $src_ip < ip(10.0.20.0)
```








## filter.conf 语法

wpflow cond 表达式, 包括:

```
(变量  比较操作符 值) 关系操作符  ...
```



```
变量: $<name>
值:   <type>(<value>)
非数比较操作符:  == , != 
数值比较操作符:  >, < , == , >= , <= , != 
关系操作符:  && , ||
```



### 示例

```toml
$src_ip > ip(10.0.10.0) && $src_ip < ip(10.0.20.0)

$name == chars(http_accs_local_sink) && 
            ( $hav_rate < float(5.0) || $hav_rate > float(30.0) )
```