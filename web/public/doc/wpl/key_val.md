# WPL KV



## 示例: 

### wpl

```
rule x { (kv,kv(digit),kv(digit@x.c, digit@x.c1:x.c))\!\|} 
```
### 数据
```
x.a="hello"!|x.b=18!|x.c=20
x.a="hello"!|x.b=18!|x.c1=20
```



## 语法

```
key-value : kv[(field [,field])]
field     : type[@key][:name]

```



* kv  :  key-value 解析器

* type : 数据类型

* @key :    key 值

* name  :  名称

## 规则
* kv 存在多field,  其中一field匹配即可提取 value

* kv 存在多field,  没有field匹配, 即忽略此字段.

   

