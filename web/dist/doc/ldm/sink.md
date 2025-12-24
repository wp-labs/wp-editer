# Sink.toml





## 示例



输出到文件


```toml
[sink]
version = "1.0"
name = "http_accs"
rule = ["/svc/http_accs/*"]
adm = "./ldm/http_accs/adm.toml"

[sink.sink.fmt]
fmt = "kv"

[sink.sink.target.file]
path = "./out/http_accs.dat"
```



输出到mysql

```toml
version = "1.0"

[sink]
name = "http_accs"
rule = ["/svc/http_accs/*"]
adm = "./ldm/http_accs/adm.toml"

[sink.sink.fmt.pdm]
db= "./ldm/http_accs/pdm.toml"

[sink.sink.target.mysql]
table = "./out/http_accs.dat"
connect=""
```

