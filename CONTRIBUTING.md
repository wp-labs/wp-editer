# Contributing Guide

Thank you for your interest in the wp-editor project! We welcome contributions of all kinds, including but not limited to:

- Reporting bugs
- Discussing the current state of the code
- Submitting fixes
- Proposing new features
- Becoming a maintainer

## Release Process

This project follows a three-stage release model: **alpha → beta → main**

### Environments and Deployment URLs

| Environment | Branch | Deployment URL | Description |
|-------------|--------|----------------|-------------|
| Alpha | `alpha` | [editor.alpha.warpparse.ai](https://editor.alpha.warpparse.ai) | Development testing environment with latest features |
| Beta | `beta` | [editor.beta.warpparse.ai](https://editor.beta.warpparse.ai) | Pre-release environment for final validation |
| Production | `main` | [editor.warpparse.ai](https://editor.warpparse.ai) | Production environment with stable releases |

### Release Flow Details

1. **Alpha Stage**
   - All new features and fixes are first merged into the `alpha` branch
   - Automatically deployed to the alpha environment
   - Used for feature testing and initial validation

2. **Beta Stage**
   - Stable versions validated in alpha are merged into the `beta` branch
   - Automatically deployed to the beta environment
   - Complete integration testing and performance testing

3. **Production Stage**
   - Fully tested versions from beta are merged into the `main` branch
   - Automatically deployed to the production environment
   - Official version tags are released

## Development Workflow

### 1. Fork the Repository

Fork this project to your account on GitHub.

### 2. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/wp-editor.git
cd wp-editor
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/wp-labs/wp-editor.git
```

### 4. Create a Feature Branch

Create your feature branch from the `alpha` branch:

```bash
git checkout alpha
git pull upstream alpha
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/feature-name` - New features
- `fix/issue-description` - Bug fixes
- `docs/documentation-description` - Documentation updates
- `refactor/refactor-description` - Code refactoring
- `test/test-description` - Testing related

### 5. Development

#### Backend Development Guidelines

- Follow Rust coding standards and best practices
- Format code with `cargo fmt`
- Check code quality with `cargo clippy`
- Ensure all tests pass: `cargo test`
- Add unit tests and integration tests for new features

#### Frontend Development Guidelines

- Follow the project's ESLint and Prettier configurations
- Follow development standards defined in `web/AGENTS.md`
- Check code quality with `pnpm lint`
- Format code with `pnpm format`
- Ensure all tests pass: `pnpm test`
- Add comments in Chinese for critical logic

#### General Guidelines

- Write commit messages in Chinese
- Follow Conventional Commits specification
- Each commit should be an independent, meaningful change
- Avoid committing unrelated files (use `.gitignore`)

### 6. Commit Your Changes

```bash
git add .
git commit -m "feat: 添加某某功能"
```

Commit message format:

```
<type>: <short description>

[optional detailed description]

[optional footer]
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting (no functional changes)
- `refactor`: Refactoring (neither feature nor fix)
- `perf`: Performance optimization
- `test`: Testing related
- `chore`: Build process or auxiliary tool changes

### 7. Push to Remote Repository

```bash
git push origin feature/your-feature-name
```

### 8. Create a Pull Request

1. Open your forked repository on GitHub
2. Click "New Pull Request"
3. Select `alpha` as the target branch
4. Fill in the PR title and description:
   - Title: Concise description of the changes
   - Description: Detailed explanation of changes, reasons, and test results
5. Link related issues (if any)
6. Wait for code review

### 9. Code Review

- Maintainers will review your code
- Make necessary modifications based on feedback
- Keep your branch updated:
  ```bash
  git fetch upstream
  git rebase upstream/alpha
  git push origin feature/your-feature-name --force
  ```

### 10. Merge

After code review approval, maintainers will merge your PR into the `alpha` branch.

## Reporting Bugs

If you find a bug, please report it via GitHub Issues:

1. Use a clear and descriptive title
2. Provide detailed reproduction steps
3. Describe expected vs. actual behavior
4. Include relevant logs, screenshots, or error messages
5. Specify your environment (OS, browser version, etc.)

## Proposing New Features

If you have a feature suggestion:

1. Check if a similar suggestion already exists in Issues
2. Create a new Issue with a detailed description of your idea
3. Explain the use cases and value of the feature
4. If possible, provide design proposals or prototypes

## Environment Setup

### Backend Environment

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build project
cargo build

# Run tests
cargo test

# Run service
cargo run
```

### Frontend Environment

```bash
cd web

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows project coding standards
- [ ] All tests pass
- [ ] New features have corresponding tests
- [ ] Documentation is updated (if needed)
- [ ] Commit messages are clear
- [ ] No unrelated file changes
- [ ] Code has been self-reviewed
- [ ] Critical logic has explanatory comments

## License

By contributing code, you agree that your contributions will be licensed under the [Apache License 2.0](LICENSE).

## Contact

If you have any questions, feel free to:

- Submit a GitHub Issue
- Start a Discussion
- Contact project maintainers

---

Thank you for your contribution! 🎉

---

# 贡献指南

感谢您对 wp-editor 项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 报告 Bug
- 讨论代码的当前状态
- 提交修复
- 提出新功能
- 成为维护者

## 发布流程

本项目采用三阶段发布模式：**alpha → beta → main**

### 环境与部署地址

| 环境 | 分支 | 部署地址 | 说明 |
|------|------|----------|------|
| Alpha | `alpha` | [editor.alpha.warpparse.ai](https://editor.alpha.warpparse.ai) | 开发测试环境，包含最新特性 |
| Beta | `beta` | [editor.beta.warpparse.ai](https://editor.beta.warpparse.ai) | 预发布环境，用于最终验证 |
| Production | `main` | [editor.warpparse.ai](https://editor.warpparse.ai) | 生产环境，稳定版本 |

### 发布流程说明

1. **Alpha 阶段**
   - 所有新功能和修复首先合并到 `alpha` 分支
   - 自动部署到 alpha 环境
   - 进行功能测试和初步验证

2. **Beta 阶段**
   - 经过 alpha 验证的稳定版本合并到 `beta` 分支
   - 自动部署到 beta 环境
   - 进行完整的集成测试和性能测试

3. **Production 阶段**
   - 经过 beta 充分测试的版本合并到 `main` 分支
   - 自动部署到生产环境
   - 发布正式版本标签

## 开发流程

### 1. Fork 项目

在 GitHub 上 fork 本项目到您的账户下。

### 2. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/wp-editor.git
cd wp-editor
```

### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/wp-labs/wp-editor.git
```

### 4. 创建功能分支

从 `alpha` 分支创建您的功能分支：

```bash
git checkout alpha
git pull upstream alpha
git checkout -b feature/your-feature-name
```

分支命名规范：
- `feature/功能名称` - 新功能
- `fix/问题描述` - Bug 修复
- `docs/文档说明` - 文档更新
- `refactor/重构说明` - 代码重构
- `test/测试说明` - 测试相关

### 5. 进行开发

#### 后端开发规范

- 遵循 Rust 代码规范和最佳实践
- 使用 `cargo fmt` 格式化代码
- 使用 `cargo clippy` 检查代码质量
- 确保所有测试通过：`cargo test`
- 为新功能添加单元测试和集成测试

#### 前端开发规范

- 遵循项目的 ESLint 和 Prettier 配置
- 遵循 `web/AGENTS.md` 中定义的开发规范
- 使用 `pnpm lint` 检查代码质量
- 使用 `pnpm format` 格式化代码
- 确保所有测试通过：`pnpm test`
- 在关键逻辑处添加中文注释

#### 通用规范

- 提交信息使用中文
- 遵循约定式提交规范（Conventional Commits）
- 每个提交应该是一个独立的、有意义的变更
- 避免提交无关文件（使用 `.gitignore`）

### 6. 提交代码

```bash
git add .
git commit -m "feat: 添加某某功能"
```

提交信息格式：

```
<类型>: <简短描述>

[可选的详细描述]

[可选的脚注]
```

类型说明：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 7. 推送到远程仓库

```bash
git push origin feature/your-feature-name
```

### 8. 创建 Pull Request

1. 在 GitHub 上打开您的 fork 仓库
2. 点击 "New Pull Request"
3. 选择目标分支为 `alpha`
4. 填写 PR 标题和描述：
   - 标题：简明扼要地描述变更
   - 描述：详细说明变更内容、原因和测试情况
5. 关联相关的 Issue（如果有）
6. 等待代码审查

### 9. 代码审查

- 维护者会审查您的代码
- 根据反馈进行必要的修改
- 持续更新您的分支：
  ```bash
  git fetch upstream
  git rebase upstream/alpha
  git push origin feature/your-feature-name --force
  ```

### 10. 合并

代码审查通过后，维护者会将您的 PR 合并到 `alpha` 分支。

## 报告 Bug

如果您发现了 Bug，请通过 GitHub Issues 报告：

1. 使用清晰描述性的标题
2. 详细描述复现步骤
3. 提供预期行为和实际行为
4. 包含相关的日志、截图或错误信息
5. 说明您的环境信息（操作系统、浏览器版本等）

## 提出新功能

如果您有新功能建议：

1. 先检查 Issues 中是否已有类似建议
2. 创建新的 Issue，详细描述您的想法
3. 说明该功能的使用场景和价值
4. 如果可能，提供设计方案或原型

## 环境配置

### 后端环境

```bash
# 安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 构建项目
cargo build

# 运行测试
cargo test

# 运行服务
cargo run
```

### 前端环境

```bash
cd web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建生产版本
pnpm build
```

## 代码审查清单

在提交 PR 之前，请确保：

- [ ] 代码符合项目的编码规范
- [ ] 所有测试通过
- [ ] 新功能有对应的测试
- [ ] 文档已更新（如果需要）
- [ ] 提交信息清晰明确
- [ ] 没有无关的文件变更
- [ ] 代码已经过自我审查
- [ ] 关键逻辑有注释说明

## 许可证

通过贡献代码，您同意您的贡献将在 [Apache License 2.0](LICENSE) 下授权。

## 联系方式

如有任何问题，欢迎：

- 提交 GitHub Issue
- 发起 Discussion
- 联系项目维护者

---

再次感谢您的贡献！🎉
