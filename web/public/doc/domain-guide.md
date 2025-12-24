# 领域建模指南



当积累多个客户或多个场景下的数据解析时,  我们可以进行领域建模. 以可以执行模型,快速赋能新的客户需要.



**注意:**

> 模型工程由 rust 实现.  但工程比较简单,  开发工程师都可以掌握.

## Fork [cfg-demo](https://git-biz.qianxin-inc.cn/qax-platform/etl-mdl/cfg-demo)



## 添加 MDL-Entity

创建 src/mdl/\<new-item\> 目录, 并添加 mod.rs

实现 ModelFactory 



## 添加命令入口

Main.rs

```rust
    match args.command {
        Commands::Item(item) => match item.command {
            ModelEnum::HttpAccs(args) => {
                model_build::<HttpAccsModel>(args, "http_accs", "/svc/http_accs/*")?;
            }
            ModelEnum::Benchmark(args) => {
                model_build::<BenchmarkModel>(args, "benchmark", "/sys/*")?;
            }
            ModelEnum::Terminal(args) => {
                model_build::<TerminalModel>(args, "terminal", "/cpu/terminal/*")?;
            }
            ModelEnum::TdLog(args) => {
                model_build::<TdSyskeyeLoginModel>(
                    args.clone(),
                    "td_skyeye_login",
                    "/svc/td_log/login*",
                )?;
                model_build::<TdSyskeyeDnsModel>(args, "td_skyeye_dns", "/svc/td_log/dns")?;
            }
            ModelEnum::All(args) => {
                model_build::<HttpAccsModel>(args.clone(), "http_accs", "/svc/http_accs/*")?;
                model_build::<BenchmarkModel>(args.clone(), "benchmark", "/sys/*")?;
                model_build::<TerminalModel>(args, "terminal", "/cpu/terminal/*")?;
            }
        },
```

