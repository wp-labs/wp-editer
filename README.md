# wp-editor

![License](https://img.shields.io/badge/license-Apache%202.0-blue)

wp-editor is a standalone web system designed for writing and validating WPL (log parsing rules) and OML (data transformation rules).

## Features

- **Log Parsing**: Supports WPL (Warp Parse Language) rules, capable of parsing logs in multiple formats
- **Data Transformation**: Supports OML (Object Mapping Language) rules to transform parsed data into specified formats
- **Real-time Preview**: Supports real-time parsing and transformation result preview
- **Rule Editor**: Built-in CodeJar editor with syntax highlighting and Tab key indentation support

## Tech Stack

### Backend

- **Language**: Rust (Edition 2024)
- **Web Framework**: Actix Web 4.4
- **Core Engine**: warp-flow
- **Async Runtime**: Tokio

### Frontend

- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.3.5
- **UI Components**: Ant Design 5.24.9
- **Editor**: CodeJar

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

### Apache License 2.0 Overview

The Apache License 2.0 is a permissive open-source license that:

- Allows commercial use, modification, and distribution
- Requires preservation of copyright and license notices
- Provides an explicit grant of patent rights from contributors
- Disclaims warranties and limits liability
- Is compatible with various other open-source licenses

For the full license terms, please refer to the [LICENSE](LICENSE) file.

## Contributing

We welcome contributions of all kinds! For detailed contribution guidelines, development workflow, and the release process, please refer to our [CONTRIBUTING.md](CONTRIBUTING.md) guide.

Key highlights:
- Three-stage release process: alpha → beta → main
- Pull requests should target the `alpha` branch
- Code review is required before merging

## Support

If you have any questions or suggestions, please submit an Issue or contact the development team.

---

# wp-editor

![License](https://img.shields.io/badge/license-Apache%202.0-blue)

wp-editor 是一个独立运行的 WEB 系统，专门用于 WPL（日志解析规则）和 OML（数据转换规则）的编写和验证。

## 功能特性

- **日志解析**: 支持 WPL (Warp Parse Language) 规则，可解析多种格式的日志
- **数据转换**: 支持 OML (Object Mapping Language) 规则，将解析后的数据转换为指定格式
- **实时预览**: 支持实时解析和转换结果预览
- **规则编辑**: 内置 CodeJar 编辑器，支持语法高亮和 Tab 键缩进

## 技术栈

### 后端

- **语言**: Rust (Edition 2024)
- **Web 框架**: Actix Web 4.4
- **核心引擎**: warp-flow
- **异步运行时**: Tokio

### 前端

- **框架**: React 19.0.0
- **构建工具**: Vite 6.3.5
- **UI 组件**: Ant Design 5.24.9
- **编辑器**: CodeJar

## 许可证

本项目采用 Apache License 2.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

### Apache License 2.0 概述

Apache License 2.0 是一个宽松的开源许可证，具有以下特点：

- 允许商业使用、修改和分发
- 要求保留版权和许可证声明
- 为贡献者明确授予专利权
- 免除担保并限制责任
- 与多种其他开源许可证兼容

有关完整的许可证条款，请参考 [LICENSE](LICENSE) 文件。

## 贡献指南

我们欢迎任何形式的贡献！有关详细的贡献指南、开发流程和发布流程，请参考我们的 [CONTRIBUTING.md](CONTRIBUTING.md) 文档。

主要亮点：
- 三阶段发布流程：alpha → beta → main
- Pull Request 应该针对 `alpha` 分支
- 合并前需要代码审查

## 支持

如有问题或建议，请提交 Issue 或联系开发团队。
