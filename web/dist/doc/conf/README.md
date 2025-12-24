# 配置文件示例



##  配置结构

```

├── conf
│   ├── wpadm.toml
│   └── wpflow.toml
├── ldm
│   ├── example
│   │   ├── adm.toml
│   │   ├── gen_field.toml
│   │   ├── gen_rule.wpl
│   │   ├── parse.wpl
│   │   ├── sample.dat
│   │   ├── table.sql
│   │   └── tolerance.dat
│   └── syslog.wpl
├── logs
├── out
├── rescue
├── sink
│   ├── example
│   │   ├── pdm.toml
│   │   └── sink.toml
│   └── framework.toml
├── source
│   ├── wpsrc.toml
│   └── syslog_1
│       └── source.wpl
└── src_dat
```

* conf   运行配置

* ldm    模型规则

* sink    输出配置

## 配置文件

### 运行配置

####  wpflow.toml

限速、日志



#### wpadm.toml



### 模型规则

#### parse.wpl

模型解析规则

#### adm.toml

模型转换配置



### 输入源配置
#### source/wpsrc.toml

数据源配置
### 输出配置

#### framework.toml

sink framework  设置, 如 default 、miss、moni 

#### sink.toml

输出接收器配置:

#### pdm.toml

输出转换配置:
