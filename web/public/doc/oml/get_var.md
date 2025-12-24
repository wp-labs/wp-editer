# 数据获取

## read : 读取数据

读取原数据和生成的新数据, 数据项保留, 可以再次read

### 示例

```
src_ip  =  read() ;
src_ip  =  read(ip) ;
src_ip  =  read(option:[src-ip,source_ip]) ;
src_ip  =  read() { _ : ip(127.0.0.1)} ;
happen  =  read() { _ : Time::now() } ;
happen2 =  read(happen)  ;
```

### 简写

在读取明确对象,可以使用简写.

```
src_ip = read(ip);
src_ip = @ip ;
```



## take: 提取源数据

数据项不保留, 提取后,不能再  take

```
src_ip =  take() ;
src_ip =  take(ip) ;
src_ip =  take(option:[src-ip,source_ip]) ;
src_ip =  take() { _ : ip(127.0.0.1)} ;
```



## 通配获取
oml支持 wild 规则, 当前只能支持从 crate 提取 字段对象.
```
*  = take() ;
alert*  = read();
```
