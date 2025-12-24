# symbol

symbol 用于无格式匹配数据

## 示例
数据
```
syslog:{"a" : 12, "b" 24}
```
wpl
```
(symbol(syslog:), json)
```



# peek_symbol


## 示例


数据
```
{"a" : 12, "b" 24}
```
wpl
```
(peek_symbol({"a"), json)
```
