# OML



OML 用于定义 模型聚合.

## 示例

```
name : skyeye_stat
---
pos_sn       =  take() ;
updatetime   =  read() ;
sip          =  read() ;
log_type     =  read() ;

value   = map {
  process,memory_free : float =  read() ;
  cpu_free,cpu_used_by_one_min, cpu_used_by_fifty_min : float =  read() ;
  disk_free,disk_used,disk_used_by_one_min, disk_used_by_fify_min : float =  read() ;
}
```



## 语法

### oml head

```
<NAME> : <name>
---
```



###  oml item

```
item        =  | meta(value) ;
							 | read|take () ;
               | match  ...
               | map ...
```



## 参考示例

* usecase/oml_example
