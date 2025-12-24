# wpLang 语法



## 示例:

```
rule example {
	|base64|
	(digit,time,ip:src-ip,port:src-port, ip:dst-ip, port:dst-port)\,
}

rule /ervice/for_test/dayu_1 { 
				(digit<<,>>,digit,time_3393,5*_),
				(digit:id,digit:len,time,sn,chars:dev-name,time,kv,sn,chars:dev-name,
						time,time,ip,kv,chars,kv,kv,chars,kv,kv,chars,chars,ip,chars,
						http/request<[,]>,http/agent")\,
}
```



## 结构说明

### rule

```
rule <name> {  [|<proc>] <*group>   }
```

* rule :  定义一条解析规则

*  \<name\>  : 规则名, 必有

* { } : 确定规则范围, 支持多行!

* |\<proc\> :  数据行处理过程. 如 base64

* \<\*group\>:  一到多个字段解析定义组

#### 示例:

```
rule example  { 
		|base64|
		(ip,...)
}
```



### group

```
 (<*field>)[\<g_sep>]、
```

* ()  : 确定group 范围
* \*field : 字段解析定义, 
* g_sep :  group分割符, 作用于 group所有的字段.

  

#### 示例

```
(digit, chars, ip ), ( digit, digit, ip)\:

```

### Field 

```
[[num]*]<data_type>[:name][(sub-proc)[scope_tag][\f_sep]
```

* num  : 重复数
* \*   : 重复符
* data-type  :  数据处理类型
* name  :   数据名称
* sub-proc : 子处理过程
* scope_tag :  范围作用符
* f_sep  :   分割符

#### 示例

```
digit<<,>>,
time,
chars\:,
time\|\!,
2*ip\|\!,
chars\|\!,
```

#### 分隔符

```
chars   #以空格为结束的字符串
chars\,  #以逗号为结束的字符串
```
#### 范围

```
chars<",">
chars<[,]>
chars"
```





### sub-proc

```
<data_type>@<sub_path|*>[:sub_newname]
```

* Data_type :  数据处理类型
* sub_path :  数据路径,指向确定子数据字段
* \* : 通配符
* sub_newname: 新字段名

#### 示例

Json 处理

```
(json(_@*,ip@alarm_sip , json@_origin, _@_origin/*,ip@_origin/sip))
```



## 插件

```
@plugin(id: tianyan/protubuf/)

```

