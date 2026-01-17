<p align="center">
  <img src="docs/WP—LOGO.V2.png" alt="Warp Parse Logo" width="200"/>
</p>

<h1 align="center">WP Editor</h1>

<p align="center">
  <a href="https://github.com/wp-labs/wp-editor/actions/workflows/build-and-test.yml">
    <img src="https://github.com/wp-labs/wp-editor/actions/workflows/build-and-test.yml/badge.svg" alt="Build & Test"/>
  </a>
  <a href="https://github.com/wp-labs/wp-editor/actions/workflows/release.yml">
    <img src="https://github.com/wp-labs/wp-editor/actions/workflows/release.yml/badge.svg" alt="Release"/>
  </a>
  <a href="https://codecov.io/gh/wp-labs/wp-editor">
    <img src="https://codecov.io/gh/wp-labs/wp-editor/branch/alpha/graph/badge.svg" alt="codecov"/>
  </a>
  <a href="https://www.elastic.co/licensing/elastic-license">
    <img src="https://img.shields.io/badge/License-Elastic%202.0-green.svg" alt="License: Elastic 2.0"/>
  </a>
</p>

---

# Wp Editor

Wp Editor 是一个面向 WPL/OML 的可视化调试与规则编辑 Web 应用，帮助你快速完成日志解析、字段转换和结果验证，并提供完整的前后端一体化部署体验。

在线地址：`https://editor.warpparse.ai/`

## 目录

- 项目简介
- 功能特性
- 技术栈
- 快速开始
- 配置说明
- 使用指南
- API
- 项目结构
- 开发与测试
- 部署
- 许可证

## 项目简介

Wp Editor 以 Warp Parse 解析引擎为核心，提供 WPL 解析、OML 转换的在线调试能力。后端使用 Rust + Actix Web，前端使用 React + Vite，通过 `rust-embed` 将前端静态资源打包进服务端，单二进制即可运行。

## 功能特性

- WPL 规则解析调试：输入日志 + WPL 规则，一键解析并查看字段结果
- OML 规则转换调试：基于解析结果执行 OML 转换，支持多视图预览
- 示例规则加载：从本地规则库读取 WPL/OML + sample 数据，快速复现
- 规则格式化：WPL/OML 一键格式化，保证规则可读性
- Base64 解码：对日志输入进行快速解码处理
- 结果多视图：表格/JSON 切换，支持空值显示开关
- 代码编辑体验：CodeJar 编辑器 + 行号 + 语法高亮 + Tab 缩进
- 多语言界面与版本展示：支持中英文切换，展示 wp-editor 与 warp-engine 版本

## 技术栈

### 后端

- Rust (Edition 2024)
- Actix Web 4.x
- Tokio
- rust-embed
- warp 系列核心库（WPL/OML 解析与转换）

### 前端

- React 19
- Vite 5
- Ant Design 5
- CodeJar + Prism
- i18next

## 快速开始

### 环境要求

- Rust Stable（支持 Edition 2024）
- Node.js 18+（推荐 20+）

### 安装与构建

1. 克隆项目

```bash
git clone <repository-url>
cd wp-editor
```

1. 构建前端（生成 `web/dist`）

```bash
cd web
npm install
npm run build
cd ..
```

1. 构建并运行后端

```bash
cargo build
cargo run
```

启动后访问：`http://localhost:8080`

### 前端开发模式（可选）

```bash
# 终端 1
cargo run

# 终端 2
cd web
npm run dev
```

Vite 会自动代理 `/api` 到 `http://localhost:8080`。

## 配置说明

配置文件位于 `config/config.toml`：

```toml
[log]
level = "debug"
output = "Console"
output_path = "./logs/"

[web]
host = "0.0.0.0"
port = 8080

[repo]
wpl_rule_repo = "../wp-rule/models/wpl"
oml_rule_repo = "../wp-rule/models/oml"
```

- `wpl_rule_repo` / `oml_rule_repo` 支持绝对路径或相对路径
- 示例数据默认读取同目录下的 `sample.dat`
- 若每个人规则库路径不同，可通过软链接避免提交冲突

```bash
ln -sf /your/path/to/warp-rules/models/wpl ../wp-rule/models/wpl
ln -sf /your/path/to/warp-rules/models/oml ../wp-rule/models/oml
```

## 使用指南

可以通过点击示例库中的实例，查看学习。

### 1. 解析调试（WPL）

- 输入待解析日志
- 编辑或选择示例 WPL 规则
- 点击“解析”查看表格/JSON 结果
- 可切换空值显示、JSON 视图

### 2. 转换调试（OML）

- 先完成一次解析，系统自动带出解析结果
- 编辑 OML 规则
- 点击“转换”查看转换后的字段与 JSON 输出

### 3. 规则格式化 / Base64 解码

- WPL/OML 输入区支持一键格式化
- 日志输入区支持 Base64 解码

## API

- `GET /api/version`：获取版本信息
- `POST /api/debug/parse`：解析日志（WPL）
- `POST /api/debug/transform`：转换记录（OML）
- `GET /api/debug/examples`：加载示例规则与样本
- `POST /api/debug/wpl/format`：格式化 WPL
- `POST /api/debug/oml/format`：格式化 OML
- `POST /api/debug/decode/base64`：Base64 解码

## 项目结构

```
wp-editor/
├── config/                # 配置文件
├── crates/                # 子 crate（数据库迁移等）
├── docs/                  # 项目文档
├── src/                   # 后端源码
├── web/                   # 前端源码（Vite）
├── Cargo.toml
├── Dockerfile
└── README.md
```

## 开发与测试

- Rust 测试：`cargo test`
- Rust 代码检查：`cargo clippy`
- 前端 lint：`npm run lint`
- 前端测试：`npm run test`

## 部署

```bash
cargo build --release
./target/release/wp-editor
```

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE)
