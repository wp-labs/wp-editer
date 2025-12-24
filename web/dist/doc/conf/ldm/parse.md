# 解析规则文件



```
package /example {
   #[tag(src_tag : "nginx")]
   rule nginx {
        (ip:sip,_^2,time<[,]>,http/request",http/status,digit,chars",http/agent",_")
   }
}
```

