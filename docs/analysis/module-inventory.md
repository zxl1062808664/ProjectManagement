# 模块清单

## 当前模块清单

| 模块 | 责任 | 依赖 | 规模 | 复杂度 |
| --- | --- | --- | --- | --- |
| `index.html` | 页面骨架、表单区、统计区、筛选区、看板区、提示区 | `styles.css`、`app.js` | 295 行 | 中 |
| `styles.css` | 设计变量、布局、卡片样式、响应式规则、交互状态样式 | DOM 结构类名 | 682 行 | 中 |
| `app.js` | 初始化、事件绑定、任务 CRUD、筛选排序、拖拽、统计、提醒、本地持久化 | DOM、`localStorage`、浏览器 API | 768 行 | 高 |

## `app.js` 内部职责分布

| 区块 | 代表函数 | 责任 |
| --- | --- | --- |
| 初始化与绑定 | `init`、`bindEvents` | 装载页面、绑定表单、看板和筛选事件 |
| 表单与任务修改 | `handleFormSubmit`、`startEditing`、`deleteTask`、`updateTask` | 创建、编辑、删除和更新任务 |
| 看板交互 | `handleBoardClick`、`handleBoardChange`、`handleDragStart`、`handleLaneDrop` | 状态切换、拖拽移动 |
| 渲染 | `render`、`renderBoard`、`renderTaskCard`、`renderUpcoming` | 统计、看板、提醒区和空状态渲染 |
| 查询与排序 | `getVisibleTasks`、`matchesDeadline`、`sortTasks` | 本地过滤和排序 |
| 工具函数 | `persistTasks`、`todayString`、`escapeHtml` | 存储、日期、转义等基础能力 |

## 当前模块问题

### 1. 前端职责耦合过高

`app.js` 同时承担：

- 状态容器
- 视图渲染
- 事件分发
- 数据层访问
- 领域规则

这在当前本地单页版是可接受的，但一旦增加用户、项目、子任务、标签、同步和鉴权，复杂度会迅速失控。

### 2. 数据模型单一

当前只有“任务”这一类核心对象，没有：

- 用户
- 项目
- 标签
- 子任务
- 会话
- 导入导出格式约束

### 3. 没有服务端边界

后续如果继续把所有逻辑都放在前端，将无法可靠处理：

- 用户身份
- 密码安全
- 云端持久化
- 数据隔离
- 数据导入校验

## 目标模块边界

## 服务端模块

| 目标模块 | 责任 | 复杂度预估 |
| --- | --- | --- |
| `server/app.js` | Express 应用装配、静态资源托管、错误处理中间件 | 中 |
| `server/routes/auth.js` | 注册、登录、登出、会话校验 | 中 |
| `server/routes/projects.js` | 项目 CRUD 和项目切换数据获取 | 中 |
| `server/routes/tasks.js` | 任务、子任务、标签和关联操作 | 高 |
| `server/routes/import-export.js` | JSON 导入导出、格式校验 | 中 |
| `server/services/auth-service.js` | 密码哈希、token 生成、会话生命周期 | 高 |
| `server/services/project-service.js` | 项目数据操作和用户归属验证 | 中 |
| `server/services/task-service.js` | 任务聚合读写、排序、标签与子任务聚合 | 高 |
| `server/db/index.js` | SQLite 连接、初始化、事务包装 | 高 |
| `server/db/schema.js` | schema 初始化和版本升级 | 中 |

## 前端模块

| 目标模块 | 责任 | 复杂度预估 |
| --- | --- | --- |
| `public/index.html` | 应用壳层与主要挂载区域 | 低 |
| `public/styles.css` | 保留并扩展现有视觉系统 | 中 |
| `public/js/state.js` | 全局状态、会话状态、项目状态、同步状态 | 高 |
| `public/js/api.js` | 统一封装 API 请求与错误处理 | 中 |
| `public/js/auth.js` | 注册、登录、登出、会话恢复 | 中 |
| `public/js/projects.js` | 项目切换、多项目列表、项目 CRUD | 中 |
| `public/js/tasks.js` | 任务、子任务、标签的读写与视图绑定 | 高 |
| `public/js/import-export.js` | JSON 导入导出入口 | 中 |
| `public/js/storage.js` | 游客本地缓存与云端导入桥接 | 中 |
| `public/js/app.js` | 应用启动、模块协调 | 中 |

## 结论

当前项目的难点不在 UI，而在模块职责重划分。实现时应优先建立：

- 服务端和数据库边界
- 认证和会话边界
- 前端 API 层与本地缓存层边界

否则任何“继续往 `app.js` 里加逻辑”的方式，都会让维护成本指数上升。
