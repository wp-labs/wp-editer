# combinator





## opt

```
opt(digit:sn)

示例：

rule example {
   opt(ip: src),(digit:len)
}
```



## alt

```
alt(time:begin, digit:sn)
```



## one_of

```
one_of(digit:sn ,time:begin, ip:src_ip)
```



## 示例

```
package skyeye_stat {

   rule case1 {
        (
         digit<<,>>,
         time,
         symbol(skyeye),
         _,
         time:updatetime\|\!,
         ip:sip\|\!,
         chars:log_type\|\!\[
        ),

/*
{"name": "空闲CPU百分比", "value": 96.8},
{"name": "空闲内存kB", "value": 102432896.0},
{"name": "1分钟平均CPU负载", "value": 2.52},
{"name": "15分钟平均CPU负载", "value": 4.9},
{"name": "系统启动进程个数", "value": 1340.0},
{"name": "可用磁盘空间kB", "value": 40565575858.0},
{"name": "磁盘使用百分比", "value": 8.63},
{"name": "磁盘1分钟平均负载", "value": 8.63},
{"name": "磁盘15分钟平均负载", "value": 8.64}
]
*/
          some_of (
             json( symbol(空闲CPU百分比)@name,@value:cpu_free),
             json( symbol(空闲内存kB)@name,@value:memory_free),
             json( symbol(1分钟平均CPU负载)@name,@value:cpu_used_by_one_min),
             json( symbol(15分钟平均CPU负载)@name,@value:cpu_used_by_fifty_min),
             json( symbol(系统启动进程个数)@name,@value:process),
             json( symbol(可用磁盘空间kB)@name,@value:disk_free),
             json( symbol(磁盘使用百分比)@name,@value:disk_used),
             json( symbol(磁盘1分钟平均负载)@name,@value:disk_used_by_one_min),
             json( symbol(磁盘15分钟平均负载)@name,@value:dist_used_by_fifty_min),
           _
         )\,
    }
}
```

