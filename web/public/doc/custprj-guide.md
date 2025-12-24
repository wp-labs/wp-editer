# 客户工程指南.

开启自己项目的数据集成旅程

注意:

* 客户项目的各种规则与配置 (非敏感信息), 应该通过配置服务(GIt) 管理起来.



## 创建Git Repo 



## 工程初始化

##  

```bash
dvron conf init
dvgen conf init
```



## 运行示例

```
dvcfg ldm example 

dvgen sample 
dvron work 
```



```
======================= dvron sum up stat ===========================


ParsStat:0.0w
+--------+-------+---------+----------+-------+
| rule   | total | success | hav-rate | speed |
+=============================================+
| @nginx | 999   | 999     | 100.0%   | 0.46  |
+--------+-------+---------+----------+-------+

 SinkStat:
+-----------+---------------------+-------+---------+----------+-------+
| group     | sink                | total | success | hav-rate | speed |
+======================================================================+
| http_accs |                     | 999   | 999     | 0.0%     | 0.03  |
|-----------+---------------------+-------+---------+----------+-------|
|           | example_bak_sink    | 0     | 0       | 0.0%     | 0.00  |
|-----------+---------------------+-------+---------+----------+-------|
|           | example_file_sink   | 999   | 999     | 100.0%   | 0.03  |
+-----------+---------------------+-------+---------+----------+-------+
```

## 创建自己的LDM Entity

```
dvcfg ldm new --name auth  --path /sys/linux

```



```
├── ldm
│   └── auth
│       ├── adm.toml
│       ├── gen_field.toml
│       ├── gen_rule.dvl
│       ├── parse.dvl
│       ├── pdm.toml
│       ├── sample.dat
│       ├── sink.toml
│       └── table.sql
```





##  解析日志数据

通过[dv-view](https://org.rd.qianxin-inc.cn/dayu/dvron-view/) 或 dvkit ana 进行解析规则的编写



![image-20231208182935531](images/image-20231208182935531.png)



成功后:

* 把样本数据, 写入到 ldm/auth/sample.dat 

* 把解析规则,写入到 ldm/auth/parse.dvl



```
dvgen sample 
dvron work 
```
执行结果:
```
======================= dvron sum up stat ===========================

ParsStat:0.0w
+---------+-------+---------+----------+-------+
| rule    | total | success | hav-rate | speed |
+==============================================+
| @name_1 | 999   | 999     | 100.0%   | 0.33  |
+---------+-------+---------+----------+-------+
LoadStat:0.1w

 SinkStat:
+---------+----------------+-------+---------+----------+-------+
| group   | sink           | total | success | hav-rate | speed |
+===============================================================+
| auth    |                | 999   | 999     | 0.0%     | 0.03  |
|---------+----------------+-------+---------+----------+-------|
|         | auth_bak_sink  | 0     | 0       | 0.0%     | 0.00  |
|---------+----------------+-------+---------+----------+-------|
|         | auth_file_sink | 999   | 999     | 100.0%   | 0.03  |
|---------+----------------+-------+---------+----------+-------|
| default |                | 0     | 0       | 0.0%     | 0.00  |
|---------+----------------+-------+---------+----------+-------|
|         | default_sink   | 0     | 0       | 0.0%     | 0.00  |
|---------+----------------+-------+---------+----------+-------|
| miss    |                | 999   | 999     | 0.0%     | 0.03  |
|---------+----------------+-------+---------+----------+-------|
|         | miss_sink      | 999   | 999     | 100.0%   | 0.03  |
+---------+----------------+-------+---------+----------+-------+
```



## 根据LDM编写 ADM

* 需要标准化的字段
* 标准字段可转化字段名
* 标准字段富化方式



```toml
[[adm_item]]
name = "src_ip"
meta = "ip"
# 可以映射转化的兼容字段
[adm_item.fetch.parse]
mapping = ["src-ip", "sip", "source-ip"]
```



```toml
[[adm_item]]
name = "src_city"
meta = "chars"
default = "unknown"

# 通过arg_key 在lib获得 dat_key 的数据
[adm_item.fetch.load]
lib = "geo"
dat_key = "city_name"
arg_key = "src_ip"
```



## 根据后续处理PDM

在标准聚合数据后, 可能你需要

* A: 以某种格式输出,如 Json, 
* B: 存储到如Mysql 或 CK , ES  的服务里

假设你想把数据存到mysql 



### A 某种格式输出到后端

```toml
[[sink_group.sinks]]
name = "auth_file_sink"

[sink_group.sinks.fmt]
fmt = "kv"

[sink_group.sinks.target.file]
path = "./out/auth.dat"
```



### B 存储到Mysql 或CK、ES

```toml
[[sink_group.sinks]]
name = "http_accs_mysql_sink"

[sink_group.sinks.fmt.pdm]
db = "./ldm/http_accs/pdm.toml"

[sink_group.sinks.target.mysql]
endpoint = "127.0.0.1:3306"
username = "root"
password = "***"
database = "dvron"
```



如果存在ADM 的标准与 存储服不一致, 使用pdm.toml 进行转换

####  pdm.toml

```toml
#存储的表名
store_table = "table_example"

#需要转换的字段名称
[[field]]
model_name = "from_ip"
field_name = "x_from_ip"

[[field]]
model_name = "occur_time"
field_name = "x_occur_time"
```



## 保存配置到GitLab

* 忽略生成的数据
* 提交并push 工程





