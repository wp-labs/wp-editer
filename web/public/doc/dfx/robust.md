# 键壮性



## 背景需求

在不同环境下, 对于系统运行键壮性有不同的需求:

* 快速暴露问题
* 虽存在错误,但还需要持续运行.
* 通常下运行.



## 键壮性模式

###  debug

   用于开发、测试过程,快速发现问题

### normal

### hard 
	用于关键业务的运营, 虽出现较多错误,但还是需要继续服务. 

##  键壮性设置

wpflow.conf 提供

wpflow  提供 --robust 参数



```
wpflow work --stat -p --robust debug
wpflow work --stat -p --robust normal
wpflow work --stat -p --robust hard
```

