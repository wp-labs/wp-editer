# 日志分析指南

推荐使用 可视化分析工具 wp-anaview

## 输入
* 日志格式未知
* 日志为文件



## 操作示例

* 以 nginx 为例:

### step-1

输入

```
wpkit ana -i <you_file> -r '(*)'
```

输出

```

192.168.1.2 - - [06/Aug/2019:12:12:19 +0800] "GET /nginx-logo.png HTTP/1.1" 200 368 "http://119.122.1.4/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" "-"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
================================================================================================================

NO:1          [ip              ] ip                   : 192.168.1.2
NO:2          [chars           ] chars                : -
NO:3          [chars           ] chars                : -
NO:4          [chars           ] chars                : [06/Aug/2019:12:12:19
NO:5          [chars           ] chars                : +0800]
NO:6          [str             ] str                  : GET /nginx-logo.png HTTP/1.1
NO:7          [hex             ] hex                  : 0x200
NO:8          [hex             ] hex                  : 0x368
NO:9          [str             ] str                  : http://119.122.1.4/
NO:10         [str             ] str                  : Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36
NO:11         [str             ] str                  : -


line:
(ip,chars,chars,chars,chars,str,hex,hex,str,str,str,)
```



基本结构已有输出,但字段类型大多不正确.

### step -2

根据日志样本, 可以识别先几个字段: 

IP,  占位符, 占位符,  日期时间,  访问请求

输入:

```
  wpkit ana  -r '(ip,_,_,time<[,]>,char要")'
```

输出:

```

NO:1          [ip              ] ip                   : 192.168.1.2
NO:4          [time            ] time                 : 2019-Aug-06 12:12:19 
NO:5          [str             ] str                  : GET /nginx-logo.png HTTP/1.1
NO:6          [hex             ] hex                  : 0x200
NO:7          [hex             ] hex                  : 0x368
NO:8          [str             ] str                  : http://119.122.1.4/
NO:9          [str             ] str                  : Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36
NO:10         [str             ] str                  : -
```
说明:
```
* _ 表示忽略
* time<[,]> : 表示在[ ] 之内
* chars"  与  chars<",">  一致. 前者更为简略方便
```
### step-3  

分析:

```
200 :  是http状态
368:  是长度
"http://119.122.1.4" : 是HTTP请求
"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" : 是HTTP 请求代理

```



输入:

```
wpkit ana  -r '(ip,_,_,time<[,]>,chars",digit,digit,chars",http/agent",_)' 
```



输出:

```
NO:1          [ip              ] ip                   : 192.168.1.2
NO:4          [time            ] time                 : 2019-Aug-06 12:12:19 
NO:5          [chars           ] chars                : GET /nginx-logo.png HTTP/1.1
NO:6          [digit           ] digit                : 200
NO:7          [digit           ] digit                : 368
NO:8          [chars           ] chars                : http://119.122.1.4/
NO:9          [http/agent      ] http/agent           : Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36 
```



### step-4

输入

```
wpkit ana  -r '(ip,_,_,time<[,]>,chars:uri",digit:status,digit:len,chars:host",http/agent",_)'
```
分析输出
```
NO:1          [ip              ] ip                   : 192.168.1.2
NO:4          [time            ] time                 : 2019-Aug-06 12:12:19 
NO:5          [chars           ] uri                  : GET /nginx-logo.png HTTP/1.1
NO:6          [digit           ] status               : 200
NO:7          [digit           ] len                  : 368
NO:8          [chars           ] host                 : http://119.122.1.4/
NO:9          [http/agent      ] http/agent           : Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36 
```



输出的KV 格式

```
ip:192.168.1.2, time:2019-Aug-06 12:12:19 , uri:GET /nginx-logo.png HTTP/1.1, status:200, len:368, host:http://119.122.1.4/, http/agent:Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36
```



### step-5

把规则存到 rule.wpl中

规则命名为:  nginx

```
rule nginx {
		(ip,_^2,time<[,]>,http/request",http/status,digit,chars",http/agent",_")
}
```

