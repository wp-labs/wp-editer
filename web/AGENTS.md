# AGENTS.md

所有常规交互响应使用中文，除非用户另有指示。

## 技术与运行

- Node >= 20.19 或 >= 22.12，包管理器使用 pnpm
- 构建/开发：Vite 7 + React 19 + JavaScript
- UI/表单：Ant Design 5、ProComponents（合理使用）、Formily AntD V5
- 路由：`vite-plugin-pages`（约定式）+ `react-router@7`
- 路径别名：`@/* -> src/*`

## 开发脚本

- `pnpm dev` 开发服务
- `pnpm build` 构建（`tsc -b && vite build`）
- `pnpm preview` 本地预览
- `pnpm check` 类型检查 + ESLint + Prettier 检查
- `pnpm lint` / `pnpm format` 规范与格式化

## 代码规范

- 遵循 Airbnb JavaScript Style Guide
- React 19：不要使用已移除的 Legacy API；`ref` 作为标准 prop 传递
- 性能：合理使用 `React.memo`、`useMemo`、`useCallback`；避免闭包陷阱，确保引用最新状态
- 函数组件用 function 声明，箭头函数仅用于回调

## 命名与参数约定（重要）

- 变量/参数命名：禁止魔法变量，如单字母命名、不是众所周知的缩写命名，必须使用能表达语义的简短名称；未使用的参数使用 `_` 占位。
- 循环/回调中的形参同样语义化，如 `index`、`item`、`entry`、`key`、`value`、`cursor` 等，必要时加一行注释说明上下文。
- 函数参数：禁止过长参数列表、基本类型偏执、布尔盲目，超过 2 个时，必须改为对象参数（Options Pattern）：`fn(options)` 或 `fn(input, options)`。
- 例外：React 组件 `props` 天然为对象；第三方库固定回调签名可保持原状；类型参数名（如 `T`/`K`/`V`）不在本条约束范围内。

## 目录要点

- `src/main.jsx`：应用入口，适配微前端（Garfish），根据 `BASE_URL` 计算 `basename` 并挂载 React
- `src/App.jsx`：注入 AntD `ConfigProvider` 与 `RouterProvider`
- `src/routes/index.jsx`：`createBrowserRouter` + `~react-pages` 自动路由
- `src/views/pages/*`：页面（约定式文件路由）
- `src/views/components/common/*`：通用组件（推荐“目录即模块 + barrel 统一出口”，barrel 文件命名 `index.js`）
- `src/views/components/<topic>-portraits/*`：各主题列表（如“岗位画像”）的业务组件（建议结构：`hooks/` + `list/` + `detail/`）
- `src/services/*`：请求实例与领域服务封装（基于 `@seed-fe/request`）
- `src/configs/*`：请求与运行时配置
- `src/locales/*`：i18n 初始化与语言资源
- `src/utils/*`：通用工具函数
- `src/layout/*`：布局组件
- `mock/*`：`vite-plugin-mock-dev-server` Mock 资源

## 微前端与运行时

- 适配 Garfish 微前端生命周期（挂载/卸载/路由同步）
- 样式隔离：CSS Modules + AntD 设计 Token，避免硬编码样式值

## 网络与 Mock

- 开发代理：`proxy.js` 读取 `.env.*`（如 `VITE_API_URL`、`VITE_API_TOKEN`）
- Mock：`vite-plugin-mock-dev-server` 基于文件存在性自动接管，优先本地 Mock，缺失时走代理
- 通过 `@faker-js/faker` 生成 Mock 数据

## 提交与质量

- 代码评审优先发现：功能缺陷、风险与回归、类型/边界问题、测试缺口

## 协作约束（重要）

- 不要回滚他人变更；出现意外改动需先与作者确认
- 需要在关键逻辑处添加中文注释，描述其功能、作用、实现思路
- 若观察到环境/依赖异常或与约定不符，必须先质疑，提出问题与假设，与作者讨论后再改动
- 不要执行 Git Commit 操作
