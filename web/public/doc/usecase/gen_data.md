# 数据生成



## 使用命令 wpgen

```bash
wpgen gen -n 1000
```

两种模式

* rule_gen.  规则生成
* sample_gen : 样本生成

## 配置 wpgen



### rule.wpl

```
rule dayu_1 { (ip:src-ip,chars:dev_name,ip:dst-ip,time",kv,kv,sn,kv,ip,sn,kv,chars,chars,http/request")\, }
```



### wpgen.toml

```toml
[main_conf]
gen_ref = "sample_gen"
gen_speed = 1000
gen_count = 1000
gen_secs = 0
gen_parallel = 1
out_ref = "out_syslog"
out_fmt = "Raw"

[rule_gen]
rule = "./rule.wpl"

[rule_field]
example_3 = "ip:rand(10.0.10.0,10.0.100.255)"
example_2 = "chars:rand(0,100) > SN-{val}"
example_1 = "digit:rand(100,200)"

[[sample_gen.samples]]
file = "./sample_hello.log"
ratio = 0.1

[[sample_gen.samples]]
file = "./sample_nginx.log"
ratio = 0.1

[out_file]
path = "./gen.dat"

[out_kafka]
brokers = "localhost:9092"
topic = "wpflow"

[out_syslog]
addr = "127.0.0.1"
port = 514
protocol = "udp"
```





#### gen-rule

规则:

```
<field-name>=<data-type>:rand(<beg>,<end>) [> <fmt_str>]
```

##### data-type 

支持 digit, chars, ip 

##### beg, end

区间的开始与结束. 

##### fmt_str

格式串, 如: 

```
xxx{val}  
xxx-{val}
xx{val}xx
```



## 示例: 生成 nginx日志



### 生成规则:



```
rule nginx {
   (ip:sip,
   chars[0]<-,>,chars[0<-,>,
   time:occur_time<[,]>,http/request",
   http/status,digit,
   ip<"http://,/">,
   http/agent",
   chars[0]<"-,">"
   )
}
```

放置到 ./conf/gen.wpl 文件



### 生成数据

```
//生成 1万条
wpgen rule -n 100000
```







### 编写解析规则

```
rule /service/http_accs/nginx{   (ip:sip,_^2,time_iso<[,]>,http/request",http/status,digit,chars",http/agent",_")
}
```



### 生成ADM,PDM配置

```
dymdl http_accs 
```



### 配置 wpflow.toml



```
wpflow init --sink_file
```





### 解析数据

```
wpflow work 
```



### 结果



```
================================ Proc Stat ================================== 
total      :24157
suc        :24157
use time 1.07 sec, speed : 2.25 w/s   

------------------------------ rule hit stat --------------------------------

wplang:    /service/for_test/dayu_1                            |   hit  33.41%
wplang:    /service/for_test/dayu_2                            |   hit  32.80%
wplang:    /network/traffic_probe/qianxin/tianyan              |   hit   0.00%
wplang:    /service/http_accs/nginx                            |   hit  33.80%
wplang:    anheng                                              |   hit   0.00%

------------------------------ load hit stat --------------------------------
load data:    src_city                    | total: 9473  , suc: 4690    49.51%
```

