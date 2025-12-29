# Wproj 

wproj 是 Warp Parse 项目管理工具，提供完整的项目生命周期管理功能，包括项目初始化和配置管理、数据源的检查和统计、模型管理和知识库创建维护。

## 命令概览

```
wproj <COMMAND>

Commands:
  rule   规则工具：解析规则的管理和调试 | Rule tools: management and debugging of parsing rules
  init   一键初始化完整工程骨架 | Initialize complete project skeleton
  check  批量检查项目配置和文件完整性 | Batch check project configuration and file integrity
  data   数据管理工具：清理、统计、验证 | Data management tools: cleanup, statistics, validation
  model  模型管理工具：规则、源、汇、知识库 | Model management tools: rules, sources, sinks, knowledge base
```

---


## init - 项目初始化

一键创建项目目录结构和默认配置。

```bash
wproj init [OPTIONS]
```

| 参数 | 短选项 | 长选项 | 默认值 | 说明 |
|------|--------|--------|--------|------|
| mode | `-m` | `--mode` | `conf` | 初始化模式 |

**初始化模式：**

| 模式 | 说明 |
|------|------|
| `full` | 完整项目（配置+模型+数据+示例+链接器） |
| `normal` | 完整项目（配置+模型+数据+示例） |
| `model` | 仅模型文件 |
| `conf` | 仅配置文件 |
| `data` | 仅数据目录 |

**示例：**

```bash
# 初始化配置（默认）
wproj init -w /project

# 初始化完整项目
wproj init -w /project --mode full
```

---

## check - 项目检查

批量检查项目配置和文件完整性。

```bash
wproj check [OPTIONS]
```

| 参数 | 短选项 | 长选项 | 默认值 | 说明 |
|------|--------|--------|--------|------|
| work_root | `-w` | `--work-root` | `.` | 根目录 |
| what | - | `--what` | `all` | 检查项 |
| console | - | `--console` | false | 控制台日志输出 |
| fail_fast | - | `--fail-fast` | false | 首次失败即退出 |
| json | - | `--json` | false | JSON 格式输出 |
| only_fail | - | `--only-fail` | false | 仅输出失败项 |

**检查项（--what）：**

| 值 | 说明 |
|----|------|
| `conf` | 主配置文件 |
| `connectors` | 连接器配置 |
| `sources` | 数据源配置 |
| `sinks` | 数据汇配置 |
| `wpl` | WPL 规则语法 |
| `oml` | OML 模型语法 |
| `all` | 全部检查（默认） |

**示例：**

```bash
# 全面检查
wproj check -w /project --what all

# 仅检查配置和规则，首次失败即退出
wproj check -w /project --what conf,wpl --fail-fast

# JSON 输出，仅显示失败项
wproj check -w /project --json --only-fail
```

---

## data - 数据管理

```bash
wproj data <SUBCOMMAND>

Subcommands:
  clean     清理本地输出文件
  check     检查数据源连通性
  stat      统计数据量和性能
  validate  验证数据分布和比例
```

### data clean

清理项目输出数据。

```bash
wproj data clean
```


### data stat

统计数据量。

```bash
wproj data stat 
```


### data validate

验证数据分布和比例。

```bash
wproj data validate [OPTIONS]
```

| 参数 | 短选项 | 长选项 | 默认值 | 说明 |
|------|--------|--------|--------|------|
| input_cnt | - | `--input-cnt` | - | 输入总数（分母） |

**示例：**

```bash
# 清理输出数据
wproj data clean 

# 统计源+SINK文件行数
wproj data stat 

# 验证数据分布
wproj data validate 
```

---

## model - 模型管理
TODO!

---

## rule - 规则工具

离线解析测试，验证 WPL 规则。

```bash
wproj rule parse [OPTIONS]
```

**示例：**

```bash
# 使用规则执行离线解析测试
wproj rule parse 
```

---
