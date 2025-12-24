# WpEditer

基于 React 19 + Ant Design v5 实现的 WpEditer前端应用。

## 项目概述

本项目根据 `pages/` 目录下的 HTML 原型和接口设计文档，使用 React 技术栈实现了完整的前端。

## 技术栈

- **React 19** - UI 框架
- **React Router v6** - 路由管理
- **Ant Design v5** - UI 组件库
- **Vite** - 构建工具
- **dayjs** - 日期处理

## 项目结构

```
/Users/wensiwei/Projects/draw/
├── src/                          # 源代码目录
│   ├── main.jsx                  # 应用入口
│   ├── App.jsx                   # 根组件
│   ├── views/                    # 视图组件
│   │   ├── components/           # 通用组件
│   │   └── pages/                # 页面组件
│   ├── services/                 # API 服务层（Mock）
│   ├── utils/                    # 工具函数
│   ├── configs/                  # 配置文件
│   └── styles/                   # 样式文件
├── doc/                          # 项目文档
│   ├── requirements.md           # 需求说明
│   ├── ui-spec.md                # 界面规范
│   ├── api-spec.md               # 接口说明
│   └── implementation-notes.md   # 实现说明
├── pages/                        # HTML 原型（参考）
├── vite.config.js                # Vite 配置
├── AGENTS.md                     # 开发规范
└── api-design.md                 # API 设计文档
```

## 功能模块

- **登录与会话管理** - 基于 sessionStorage 的会话管理
- **连接管理** - 连接列表展示与切换
- **数据采集** - 数据采集能力展示
- **系统发布** - 发布列表与详情查看
- **规则配置** - source/wpl/oml/knowledge/sink 配置管理
- **配置管理** - 解析配置与连接配置
- **模拟调试** - 日志解析、记录转换、知识库、性能测试
- **系统管理** - 用户管理、操作日志、帮助中心

> 当前所有 API 调用使用 Mock 数据，数据结构与 API 设计文档一致。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`（或终端显示的端口）

### 构建生产版本

```bash
npm run build
```

生成的文件在 `dist/` 目录。

## 开发规范

详见 `AGENTS.md` 文件，包含：
- 代码规范（遵循 Airbnb JavaScript Style Guide）
- 命名与参数约定
- 目录结构说明
- React 19 最佳实践

## 文档

- `doc/requirements.md` - 需求说明
- `doc/ui-spec.md` - 界面规范
- `doc/api-spec.md` - 接口说明
- `doc/implementation-notes.md` - 实现说明
## License

MIT

### 配置编辑

1. 进入规则配置或配置管理模块
2. 在侧边栏选择要编辑的配置类型
3. 在文本框中编辑配置内容
4. 点击"校验"按钮验证配置（会显示校验结果）
5. 点击"保存"按钮保存配置（会弹出确认对话框）

### 模拟调试

1. 进入模拟调试模块
2. 选择调试类型（解析/转换/知识库/性能测试）
3. 对于解析调试：
   - 点击"一键示例"加载示例数据
   - 在日志数据区输入原始日志
   - 在解析规则区输入或编辑规则
   - 点击"解析"按钮执行
   - 在解析结果区查看结果（可切换表格/JSON 模式）
4. 对于其他调试类型：
   - 输入测试数据
   - 点击"执行测试"查看结果

## 接入真实后端

### 修改 Mock 服务

在 `services/` 目录下的各个文件中，将 mock 实现替换为真实 API 调用。

**示例：**

```javascript
// 当前 mock 实现
export async function fetchReleases() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ items: [/* mock data */] });
    }, 300);
  });
}

// 改为真实 API 调用
export async function fetchReleases() {
  const response = await fetch('http://localhost:8080/releases');
  if (!response.ok) {
    throw new Error('Failed to fetch releases');
  }
  return response.json();
}
```

### 统一请求封装

建议创建 `utils/request.js` 统一处理请求：

```javascript
export async function request(url, options = {}) {
  const defaultOptions = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  };
  const response = await fetch(url, { ...defaultOptions, ...options });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
}
```

### 环境变量

在 `.env` 文件中配置 API 地址：

```
VITE_API_BASE_URL=http://localhost:8080
```

## 部署

### 静态服务器部署

将 `dist/` 目录部署到 Nginx 或其他静态服务器。

**Nginx 配置示例：**

```nginx
server {
  listen 80;
  server_name wpediter.example.com;
  root /var/www/wpediter/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}```

### CORS 配置

开发环境可在 `vite.config.js` 中配置代理：

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
};
```

## 文档

- `doc/requirements.md` - 详细需求说明
- `doc/ui-spec.md` - 界面与导航规范
- `doc/api-spec.md` - 接口调用说明
- `doc/implementation-notes.md` - 实现细节和待办事项
- `pages/README.md` - HTML 原型说明
- `pages/测试清单.md` - 功能测试清单

## 开发规范

### 代码风格

- 使用 ES6+ 语法
- 组件使用函数式组件 + Hooks
- 使用 async/await 处理异步
- 避免使用 class 组件

### 命名规范

- 组件文件：PascalCase（如 `LoginPage.jsx`）
- 工具函数：camelCase（如 `fetchUsers`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）

### 文件组织

- 一个文件一个组件
- 相关文件放在同一目录
- 公共组件放在 `views/components/`
- 页面组件放在 `views/pages/`

## 常见问题

### 路由刷新 404

确保服务器配置了 SPA 回退：所有路由都返回 `index.html`。

### 会话丢失

使用 `sessionStorage` 会在关闭标签页后丢失，如需持久化可改用 `localStorage`。

### 端口冲突

修改 `vite.config.js` 中的端口配置：

```javascript
export default {
  server: {
    port: 3000,
  },
};
```

## 许可证

根据项目需求确定。

## 联系方式

根据项目需求填写。
