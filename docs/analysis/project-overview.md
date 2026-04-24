# 项目概览

## 任务定义

将当前仅支持浏览器本地存储的单页任务管理工具，升级为一个完整的网页版任务管理系统，默认采用以下方案：

- 前端：原生 `HTML / CSS / JavaScript`
- 后端：`Node.js + Express + SQLite`
- 登录方式：账号密码注册/登录
- 同步策略：未登录可本地使用，登录后使用云端数据并支持本地数据导入/合并
- 目标能力：标签、子任务、JSON 导入导出、多项目切换、登录、云端同步

## 当前状态

当前项目是一个纯静态前端应用，没有构建系统、没有后端服务、没有数据库，也没有鉴权机制。

### 现有文件

| 文件 | 作用 | 规模 | 备注 |
| --- | --- | --- | --- |
| `index.html` | 页面结构、表单、筛选区、看板区、统计区 | 295 行 | 单页结构清晰 |
| `styles.css` | 视觉系统、布局、看板卡片、响应式适配 | 682 行 | 视觉完整，可复用 |
| `app.js` | 状态管理、事件绑定、任务 CRUD、筛选排序、拖拽、`localStorage` | 768 行 | 单体脚本，后续扩展风险较高 |

### 当前运行方式

- 直接打开 `index.html` 即可运行
- 数据保存在浏览器 `localStorage`
- 无用户隔离、无项目隔离、无云端持久化
- 当前环境可用 `Node v24.14.0` 和 `npm v11.9.0`

## 当前架构

### 前端

- 单页应用
- 通过一个全局 `state` 对象管理任务、筛选器和编辑状态
- 所有渲染逻辑集中在 `app.js`
- 任务列表按状态列分组，支持拖拽变更状态

### 数据层

- 数据模型仅包含任务对象
- 数据持久化依赖浏览器本地 `localStorage`
- 无 schema、无迁移、无并发控制

### 安全与身份

- 当前无登录、无权限控制
- 无密码、会话、CSRF、输入校验等机制

## 目标架构

## 总体结构

计划将项目演进为前后端一体的轻量全栈应用：

- `public/`：静态前端资源
- `server/`：Express 服务端
- `server/routes/`：按领域拆分 API 路由
- `server/services/`：认证、项目、任务、导入导出等业务逻辑
- `server/db/`：SQLite 连接、初始化、schema 和查询封装
- `data/`：SQLite 数据文件

## 目标能力分层

### 展示层

- 登录/注册界面
- 项目切换器
- 标签与子任务管理 UI
- 任务看板与筛选器
- 导入导出入口
- 同步状态与错误提示

### 业务层

- 认证与会话管理
- 多项目数据隔离
- 任务、子任务、标签 CRUD
- JSON 导入导出
- 本地数据到云端账号的数据导入/合并

### 持久化层

- SQLite 数据库存储用户、会话、项目、任务、标签、子任务及关联关系
- 服务端负责数据校验、用户隔离、事务和导入校验

## 预期核心数据模型

### 用户

- `users`
- 字段：`id`、`username`、`password_hash`、`created_at`、`updated_at`

### 会话

- `sessions`
- 字段：`id`、`user_id`、`token_hash`、`expires_at`、`created_at`

### 项目

- `projects`
- 字段：`id`、`user_id`、`name`、`description`、`color`、`archived`、`created_at`、`updated_at`

### 任务

- `tasks`
- 字段：`id`、`project_id`、`title`、`description`、`status`、`priority`、`due_date`、`position`、`created_at`、`updated_at`

### 子任务

- `subtasks`
- 字段：`id`、`task_id`、`title`、`completed`、`created_at`、`updated_at`

### 标签

- `tags`
- 字段：`id`、`project_id`、`name`、`color`、`created_at`

### 关联表

- `task_tags`
- 字段：`task_id`、`tag_id`

## 入口与运行方式

当前项目尚无 `package.json`。目标状态下将具备：

- `npm install`
- `npm run dev`：启动本地开发服务
- `npm start`：启动生产模式服务
- `npm test`：执行基础验证

## 架构判断

保留原生前端是合理的，因为：

- 当前界面基础已经完成
- 功能规模仍可控制在无构建或轻构建方案内
- 可以优先把复杂度预算放在认证、数据模型和同步上

但必须解决两个问题：

- 将 `app.js` 的单体状态逻辑拆分成更清晰的模块边界
- 将 `localStorage` 从唯一数据源降级为“游客模式缓存”而不是系统真相来源
