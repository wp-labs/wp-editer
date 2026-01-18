<p align="center">
  <img src="docs/WP—LOGO.V2.png" alt="WP Editor Logo" width="200"/>
</p>

<h1 align="center">🚀 WP Editor</h1>

<p align="center">
  <strong>面向 WPL/OML 的可视化调试与规则编辑 Web 应用</strong>
</p>

<p align="center">
  <a href="https://github.com/wp-labs/wp-editor/actions/workflows/build-and-test.yml">
    <img src="https://github.com/wp-labs/wp-editor/actions/workflows/build-and-test.yml/badge.svg" alt="Build & Test"/>
  </a>
  <a href="https://github.com/wp-labs/wp-editor/actions/workflows/release.yml">
    <img src="https://github.com/wp-labs/wp-editor/actions/workflows/release.yml/badge.svg" alt="Release & Docker"/>
  </a>
  <a href="https://www.elastic.co/licensing/elastic-license">
    <img src="https://img.shields.io/badge/License-Elastic%202.0-green.svg" alt="License: Elastic 2.0"/>
  </a>
  <img src="https://img.shields.io/badge/Rust-1.89+-orange.svg" alt="Rust Version"/>
  <img src="https://img.shields.io/badge/Node.js-18+-green.svg" alt="Node.js Version"/>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-使用指南">使用指南</a> •
  <a href="#-api-文档">API 文档</a> •
  <a href="#-部署">部署</a>
</p>

---

## 📖 项目简介

**WP Editor** 是一个基于 Warp Parse 解析引擎的现代化 Web 应用，专为日志解析、字段转换和结果验证而设计。它提供了完整的 WPL（Web Processing Language）解析和 OML（Output Mapping Language）转换的在线调试能力。

🌐 **在线体验**: [https://editor.warpparse.ai/](https://editor.warpparse.ai/)

### 🏗️ 架构特点

- **🦀 Rust 后端**: 使用 Actix Web 构建高性能 API 服务
- **⚛️ React 前端**: 现代化的用户界面，支持多语言
- **📦 单二进制部署**: 通过 `rust-embed` 将前端资源打包进服务端
- **🔧 零配置启动**: 开箱即用，无需复杂配置

## ✨ 功能特性


### 🔍 **调试功能**
- **WPL 规则解析调试** - 实时解析日志并查看字段结果
- **OML 规则转换调试** - 基于解析结果执行字段转换
- **Base64 解码** - 快速处理编码日志数据
- **错误诊断** - 详细的错误信息和调试提示

### 🎨 **用户体验**
- **代码编辑器** - CodeJar + 语法高亮 + 行号显示
- **多视图展示** - 表格/JSON 切换，支持空值显示
- **规则格式化** - WPL/OML 一键美化
- **多语言界面** - 中英文无缝切换

### 📚 **示例库**
- **规则库加载** - 从本地读取 WPL/OML 示例，并自动根据WPL匹配相应的OML。
- **样本数据** - 配套的测试日志数据
- **快速复现** - 一键加载完整的调试场景

### 🔧 **开发友好**
- **版本信息** - 实时显示组件版本
- **API 文档** - 完整的接口说明
- **热重载** - 开发模式下的实时更新

## 🛠️ 技术栈


| 类别 | 技术 | 版本 | 描述 |
|------|------|------|------|
| **后端** | ![Rust](https://img.shields.io/badge/Rust-000000?style=flat&logo=rust&logoColor=white) | 1.89+ | 高性能系统编程语言 |
| | ![Actix Web](https://img.shields.io/badge/Actix%20Web-4.x-blue) | 4.x | 异步 Web 框架 |
| | ![Tokio](https://img.shields.io/badge/Tokio-async-green) | Latest | 异步运行时 |
| **前端** | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) | 19 | 用户界面库 |
| | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) | 5 | 现代构建工具 |
| | ![Ant Design](https://img.shields.io/badge/Ant%20Design-0170FE?style=flat&logo=ant-design&logoColor=white) | 5 | UI 组件库 |
| **工具** | ![CodeJar](https://img.shields.io/badge/CodeJar-editor-orange) | Latest | 轻量级代码编辑器 |
| | ![i18next](https://img.shields.io/badge/i18next-i18n-blue) | Latest | 国际化框架 |

## 🚀 快速开始

### 📋 环境要求

- **Rust**: Stable 版本（支持 Edition 2024）
- **Node.js**: 18+ （推荐 20+）
- **操作系统**: Linux, macOS, Windows

### 📥 安装步骤


#### 1️⃣ 克隆项目

```bash
git clone https://github.com/wp-labs/wp-editor.git
cd wp-editor
```

#### 2️⃣ 构建前端

```bash
cd web
npm install
npm run build
cd ..
```

#### 3️⃣ 构建并运行

```bash
# 开发模式
cargo run

# 生产模式
cargo build --release
./target/release/wp-editor
```

#### 4️⃣ 访问应用

打开浏览器访问: **http://localhost:8080**

### 🔧 开发模式

如需前端热重载开发：

```bash
# 终端 1: 启动后端
cargo run

# 终端 2: 启动前端开发服务器
cd web
npm run dev
```

> 💡 Vite 会自动将 `/api` 请求代理到后端服务器

## ⚙️ 配置说明

配置文件位于 `config/config.toml`：

```toml
[log]
level = "debug"          # 日志级别: debug, info, warn, error
output = "Console"       # 输出方式: Console, File
output_path = "./logs/"  # 日志文件路径

[web]
host = "0.0.0.0"        # 监听地址
port = 8080             # 监听端口

[repo]
wpl_rule_repo = "../wp-rule/models/wpl"  # WPL 规则库路径
oml_rule_repo = "../wp-rule/models/oml"  # OML 规则库路径
```

### 📁 规则库配置

支持绝对路径或相对路径。如果团队成员的规则库路径不同，建议使用软链接：

```bash
# 创建软链接避免路径冲突
ln -sf /your/path/to/warp-rules/models/wpl ../wp-rule/models/wpl
ln -sf /your/path/to/warp-rules/models/oml ../wp-rule/models/oml
```

## 📖 使用指南

### 🔍 WPL 解析调试

1. **输入日志数据** - 在左侧输入框粘贴待解析的日志
2. **编写 WPL 规则** - 在规则编辑器中编写或选择示例规则
3. **执行解析** - 点击"解析"按钮查看结果
4. **查看结果** - 支持表格和 JSON 两种视图模式

**示例 WPL 规则:**

```wpl
package /nginx/access {
    rule access_log {
        (ip:client_ip, _, chars:user, time:timestamp<[,]>, 
         http/request", http/status, digit:size)
    }
}
```

### 🔄 OML 转换调试

<strong>详细步骤</strong>

1. **完成 WPL 解析** - 系统会自动带出解析结果
2. **编写 OML 规则** - 定义字段转换和映射逻辑
3. **执行转换** - 点击"转换"查看转换后的结果
4. **验证输出** - 检查转换后的字段和 JSON 输出

**示例 OML 规则:**
```oml
name : /nginx/access/transform

rule :
    /nginx/access*
---
source_ip = take(option:[client_ip]) ;
user_name = take(option:[user]) ;
request_time = take(option:[timestamp]) ;
```

### 🛠️ 实用工具

- **🎨 规则格式化**: 一键美化 WPL/OML 代码
- **🔓 Base64 解码**: 快速解码编码的日志数据
- **👁️ 空值显示**: 切换是否显示空字段
- **🌐 语言切换**: 中英文界面切换

## 📡 API 文档

### 基础信息

| 方法 | 路径 | 描述 |
|------|------|------|
| `GET` | `/api/version` | 获取版本信息 |

### 调试功能

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/debug/parse` | WPL 规则解析 |
| `POST` | `/api/debug/transform` | OML 规则转换 |
| `GET` | `/api/debug/examples` | 获取示例规则库 |

### 工具功能

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/debug/wpl/format` | WPL 规则格式化 |
| `POST` | `/api/debug/oml/format` | OML 规则格式化 |
| `POST` | `/api/debug/decode/base64` | Base64 解码 |

### 请求示例

```bash
# 获取版本信息
curl -X GET http://localhost:8080/api/version

# WPL 解析
curl -X POST http://localhost:8080/api/debug/parse \
  -H "Content-Type: application/json" \
  -d '{"rules": "...", "logs": "..."}'
```

## 📁 项目结构

```
wp-editor/
├── 📁 config/                 # 配置文件
│   └── config.toml
├── 📁 crates/                 # 子模块
│   └── migrations/            # 数据库迁移
├── 📁 docs/                   # 项目文档
├── 📁 src/                    # Rust 后端源码
│   ├── api/                   # API 路由
│   ├── db/                    # 数据库相关
│   ├── server/                # 服务器配置
│   └── utils/                 # 工具函数
├── 📁 web/                    # React 前端源码
│   ├── src/
│   │   ├── components/        # React 组件
│   │   ├── services/          # API 服务
│   │   └── views/             # 页面视图
│   └── dist/                  # 构建输出
├── 📁 tests/                  # 测试文件
├── 🦀 Cargo.toml             # Rust 项目配置
├── 🐳 Dockerfile             # Docker 配置
└── 📖 README.md              # 项目说明
```

## 🧪 开发与测试

### 🔍 代码质量

```bash
# Rust 测试
cargo test

# 代码检查
cargo clippy

# 格式化
cargo fmt

# 前端测试
cd web
npm run test
npm run lint
```

### 📊 测试覆盖率

项目维护了高质量的测试覆盖率（73%+），包括：

- ✅ 单元测试
- ✅ 集成测试  
- ✅ API 测试
- ✅ 错误处理测试

## 🚀 部署

### 🐳 Docker 部署

```bash
# 构建镜像
docker build -t wp-editor .

# 运行容器
docker run -p 8080:8080 wp-editor
```

### 📦 二进制部署

```bash
# 构建发布版本
cargo build --release

# 运行
./target/release/wp-editor
```

### ☁️ 云平台部署

支持部署到各种云平台：

- **Docker**: 容器化部署
- **云服务器**: 直接部署二进制文件

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. **🍴 Fork** 项目
2. **🌿 创建** 特性分支 (`git checkout -b feature/AmazingFeature`)
3. **💾 提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
4. **📤 推送** 分支 (`git push origin feature/AmazingFeature`)
5. **🔀 创建** Pull Request

## 📄 许可证

本项目采用 **Elastic License 2.0** 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

[🐛 报告问题](https://github.com/wp-labs/wp-editor/issues) • 
[💡 功能建议](https://github.com/wp-labs/wp-editor/issues) • 