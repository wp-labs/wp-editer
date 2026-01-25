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
