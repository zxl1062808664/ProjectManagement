# Phase 1: Foundation

- [x] T1.1 初始化 Node.js 项目和目录结构
  验收标准：`package.json`、基础目录和依赖安装流程就位。

- [x] T1.2 搭建 Express 服务骨架
  验收标准：静态资源可通过服务端访问，`/api/health` 可返回成功。

- [x] T1.3 重组前端静态资源并保持现有看板可用
  验收标准：现有 UI 和本地任务管理能力迁移后仍正常。

- [x] T1.4 增加开发脚本和运行说明
  验收标准：README 和脚本足以支持独立启动。

## Notes

- 当前前端已有可用视觉基础，Phase 1 重点不是重写 UI，而是建立全栈承载结构。
- 已完成 `public/`、`server/`、`tests/` 和 `data/` 结构初始化。
- 已通过 `npm test` 和 `timeout 3 npm start` 验证 Express 静态托管与健康检查。
