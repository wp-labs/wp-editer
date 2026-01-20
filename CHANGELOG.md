# Changelog

本文件记录所有重要变更，格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.6.1-alpha] - 2026-01-20

### Changed

- 前端性能优化：移除 6 个未使用的依赖（echarts、prismjs、refractor、react-diff-view、@ant-design/pro-components、@seed-fe/logger）
- 优化构建配置：使用 esbuild 替代 terser，构建速度提升 30-50%
- 优化代码分割策略：实现细粒度的按需加载，减少首屏加载体积
- 优化 HTML 配置：添加 DNS 预连接，禁用不必要的格式检测

### Performance

- 依赖体积减少约 10MB
- 构建时间缩短至 ~3.2 秒
- 首屏加载体积优化（gzip 后约 320KB）
- 解决循环依赖问题

## [1.6.0-alpha] - 2026-01-20

### Added

- 添加代码编辑器智能语法补全功能
- 添加 OML 语法补全支持和示例表格
- 添加中英文双语补全提示表格

### Changed

- 优化代码编辑器组件的补全体验
- 改进调试接口和错误处理

### Fixed

- 修复代码编辑器相关问题

## [1.5.0] - 2026-01-17

### Added

- 添加单元测试覆盖率 CI
- 添加智能括号跳过功能并改进示例列表用户体验
- 实现三分支策略的依赖管理和发布流程

### Changed

- 升级依赖版本至 1.10.0-alpha 并更新相关包
- 转换和解析接口以消除重复标题
- 优化调试页面的表格显示和数据处理逻辑
- 更新阅读文档

### Fixed

- 修复表格模式底部行结果显示的遮挡问题
- 优化结果显示表格格式数组展示
- 修复规则示例的灵活自适应设计
- 修复示例库中包含斜杠的解析规则逻辑错误
- 修复发布工作流中的项目名称和链接引用

### Removed

- 移除 Docker 镜像构建和发布流程，简化 CI/CD 配置
- 移除 Cargo 配置
