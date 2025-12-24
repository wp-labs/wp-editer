# DVLang 的 组织



## 示例

```conf
package /svc/http_accs {

   rule nginx_1 {
        (ip:sip,_^2,time<[,]>,http/request",http/status,digit,chars",http/agent",_")
    }
   rule nginx_2 {
        (ip:sip,_^2,time<[,]>,http/request",http/status,digit,chars",)
    }
}
```



##  package



packapge 用以组织多个 rule.
