# dvkit : 工具箱

```
Usage: dvkit <COMMAND>

Commands:
  ana     analyse log ;
  verify  verify dvlang  parse rule;
  check   check  knowledge lib....
  sink    sink tools
  conf    conf file sub command
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```

## dvkit sink



```
> dvkit sink 
sink tools

Usage: dvkit sink <COMMAND>

Commands:
  kafka   
  syslog  
  mysql   
  ck      
  es      
  help    Print this message or the help of the given subcommand(s)

Options:
  -h, --help  Print help
```






## dvkit ana  解析数据


```bash
dvkit ana -i <logpath> -r <rule>
```

### 示例

命令

```
dvkit  ana -i ./data/nginx.log -r "(*)"    
```

输出:

```
================================================================================
192.168.1.2 - - [06/Aug/2019:12:12:19 +0800] "GET /nginx-logo.png HTTP/1.1" 200 368 "http://119.122.1.4/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36" "-"
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
separator analyse best:sp :' ' cnt:24 99% false
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
--------------------------------------------------------------------------------
[ip              ] ip                   : 192.168.1.2
[chars           ] chars                : -
[chars           ] chars                : -
[time            ] time                 : 2019-Aug-06 12:12:19 
[http/method     ] http/method          : GET
[http/status     ] http/status          : 200 
[port            ] port                 : 368
[str             ] str                  : http://119.122.1.4/
[http/agent      ] http/agent           : Mozilla/5.0(Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36 
[str             ] str                  : -

rule:
(ip,chars,chars,time,http/method,http/status,port,str,http/agent,str,)

 === Recognition Rate:80.0% ===
```

```
-r #指定解析规则. (*) 是默认的解析规则
```

日志的正确的解析依赖于规则.
