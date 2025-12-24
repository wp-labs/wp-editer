# 日志设置与问题定位

本文面向使用者与一线开发，给出在 Warp Parse 中开启/调整日志与进行常见问题定位的实操指南。

```
{YYYY-mm-dd HH:MM:SS.ssssss} [LEVEL] [target] message
```

- 目标域（targets）见《开发者文档：Logging Targets And Levels》。
- 文件日志默认滚动：10MB/10 份，gzip 压缩。

## 快速上手

### wparse / wprescue  （conf/wparse.toml）

生产推荐（文件输出 + 低噪声）：
```toml
[log_conf]
output = "File"   # Console|File|Both
level  = "warn,ctrl=info，dfx=info"
[log_conf.file]
path = "./data/logs"   # 目录会自动创建；文件名按可执行名自动命名，如 wparse.log
```

本地联调（同时输出到控制台）：
```toml
[log_conf]
output = "Both"
level  = "debug"
[log_conf.file]
path = "./data/logs"
```
