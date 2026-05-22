# Task Atlas

Task Atlas 采用原生前端加 `Node.js + Express + SQLite`。当前界面以“项目管理”为中心组织任务、Kiosk 和 App 版本数据：项目统一在项目管理模块里创建和维护，任务管理、Kiosk 统计与 App 版本管理都只使用已有项目。

## 技术栈

- 前端：原生 `HTML / CSS / JavaScript`
- 后端：`Node.js + Express + SQLite`
- 运行环境：`Node.js 24+`

## 本地启动

1. 安装依赖：

   ```bash
   npm install
   ```

2. 启动开发模式：

   ```bash
   npm run dev
   ```

3. 打开浏览器访问：

   ```text
   http://localhost:3000
   ```

默认数据库文件位于 `data/task-atlas.sqlite`，也可以通过环境变量 `TASK_ATLAS_DB_PATH` 指定其他路径。

## 可用脚本

- `npm run check`：执行前后端关键脚本语法检查
- `npm run dev`：以 watch 模式启动服务
- `npm run seed:demo`：创建本地演示账号和演示项目数据
- `npm start`：启动服务
- `npm test`：运行认证、工作区 API 和静态页面测试

## 当前能力

- 游客模式：未登录时将项目、标签、任务、Kiosk、App 和版本数据保存在浏览器本地
- 云端模式：注册/登录后使用 SQLite 持久化数据
- 项目管理：创建、修改、归档项目，并维护当前项目的标签
- Kiosk 统计：只在当前项目下创建、编辑和查看 Kiosk、打印机与远控信息；平台和远控平台支持预设下拉与“其他”自定义输入
- 任务管理：只在当前项目下创建、编辑、筛选和批量更新任务
- App 版本管理：只在当前项目下创建 App、维护版本记录、筛选状态和批量更新版本状态，并支持仅记录资源版本或构建号的发布条目
- 数据工具：载入示例数据、导入 JSON、导出当前项目、导出完整工作区、清空当前项目已完成任务、清空游客本地数据
- 账号与同步：注册、登录、刷新会话、将游客数据显式导入当前账号
- 数据结构兼容：当前导入导出使用 `project -> kiosks` 与 `project -> apps -> versions` 的版本 `4` 结构，同时兼容旧版独立 App 数据并自动归入导入项目或“版本迁移项目”

## 账号与同步说明

- 未登录时默认进入游客模式，数据存在当前浏览器的 `localStorage`
- 注册新账号后，后端会自动创建一个 `默认项目`
- 老数据中的独立 App 记录会在迁移后自动归入对应账号下的 `版本迁移项目`
- 登录后界面会切到当前账号的云端工作区，不会自动覆盖游客数据
- 如果浏览器里已有游客数据，登录后可以点击“导入本地数据到云端”进行显式导入

## 演示数据

执行：

```bash
npm run seed:demo
```

默认会生成以下演示账号：

- 用户名：`taskatlas_demo`
- 密码：`demo_pass_123`

如果数据库里已经存在同名演示账号，脚本会复用该账号；若密码不是默认值，脚本会直接报错，避免静默覆盖现有数据。

## 测试与验证

- `tests/health.test.js`：健康检查和前端页面托管
- `tests/auth.test.js`：注册、登录、会话恢复、退出
- `tests/workspace.test.js`：项目、标签、Kiosk、任务、项目级 App/版本、导入导出与清理流程
- `tests/app-versions.test.js`：项目作用域下的 App、版本、批量状态更新与 JSON 导入导出

运行测试时，SQLite 会使用系统临时目录下的独立测试数据库。Node 24 的 `node:sqlite` 目前仍会输出 experimental warning，这是运行时提示，不影响功能。

## 备份与运维

- 备份数据库：复制 `data/task-atlas.sqlite`
- 备份单项目：在界面中使用“导出 JSON”，会同时导出项目下的任务、标签、Kiosk、App 和版本
- 恢复数据：在界面中使用“导入 JSON”，或将游客数据显式导入云端账号；旧版独立 App 导入会自动创建承接项目
- 部署时只需保证 Node 24+ 环境和数据库目录具备写权限
