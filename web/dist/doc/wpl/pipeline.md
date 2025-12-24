# WPL PipeLine


## 示例

###  数据1

```
[192.168.1.2 _ 06/Aug/2019:12:12:19 +0800]
```

### 解析规则
```
(chars<[,]> | (ip,_,time ) )

```



### 数据2

```
data : [192.168.1.2 _ 06/Aug/2019:12:12:19 +0800]
```

### 解析规则

```
(kv(chars<[,]> | (ip,_,time ) ))
```



### 数据3

```
{ "data" : "[192.168.1.2 _ 06/Aug/2019:12:12:19 +0800]" } 
```



###  解析规则

```
(json(chars@data<[,]> | (ip,_,time ) ))
```



## 语法



 ```
 <WPLFieldEx> :: = <WPLField> [ "|" <WPLGroup>]  |
 									<WPLField>( <WPLField>"@"<PATH> [| <WPLGroup>)]
 ```



## 示例

### 数据

```
dat : "222.133.52.20 - - [06/Aug/2019:12:12:19 +0800] "
```

### 规则

```c
//添加pipe 进行重命名
( kv(chars@dat" | (ip:src_ip,_,_,time:current<[,]>)))
```

