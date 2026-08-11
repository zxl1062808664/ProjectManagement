# MASTER

## 任务名称

将本地单页任务管理工具升级为支持登录、SQLite 持久化、多项目、标签、子任务、JSON 导入导出和云端同步的完整网页版系统。

## 任务描述

已确认的默认方案：

- 前端：原生 `HTML / CSS / JavaScript`
- 后端：`Node.js + Express + SQLite`
- 登录方式：账号密码注册/登录
- 数据策略：未登录本地使用，登录后云端持久化，并提供本地数据导入/合并

## 分析文档

- [项目概览](../analysis/project-overview.md)
- [模块清单](../analysis/module-inventory.md)
- [风险评估](../analysis/risk-assessment.md)

## 计划文档

- [任务拆解](../plan/task-breakdown.md)
- [依赖关系图](../plan/dependency-graph.md)
- [里程碑](../plan/milestones.md)

## 阶段汇总

| 阶段 | 任务数 | 完成度 |
| --- | --- | --- |
| Phase 1: 基础设施与全栈骨架 | 4 | 100% |
| Phase 2: 认证与持久化核心 | 4 | 100% |
| Phase 3: 项目/任务领域扩展 | 5 | 100% |
| Phase 4: 同步与完整体验打磨 | 4 | 100% |
| Phase 5: 验证、文档与交付 | 4 | 100% |

## 阶段进度

- [x] Phase 1: foundation (4/4 tasks) [details](./phase-1-foundation.md)
- [x] Phase 2: auth-persistence (4/4 tasks) [details](./phase-2-auth-persistence.md)
- [x] Phase 3: domain-expansion (5/5 tasks) [details](./phase-3-domain-expansion.md)
- [x] Phase 4: sync-ux (4/4 tasks) [details](./phase-4-sync-ux.md)
- [x] Phase 5: verification-release (4/4 tasks) [details](./phase-5-verification-release.md)

## Current Status

- Project manager layout update: the project list now renders as a normal full-width workspace panel instead of using the fixed-width editor-panel layout.
- Local account launcher update: when the requested username already exists, `scripts/create-user.bat` asks whether to replace that account's password. A confirmed replacement invalidates active sessions for that account.
- Authentication update: public registration is disabled; administrators create accounts locally with the server-side command, and unauthenticated visitors see only login.
- Administrator account creation is also available through the interactive `scripts/create-user.bat` launcher.
- Interface update: navigation and tab-header help copy is hidden so the workspace emphasizes names, data, and actions.

- App 版本管理现在支持在发布版本时通过可搜索下拉多选绑定当前项目中的任务，游客模式与账号云端模式都会保留 `taskIds` 关联，项目级 JSON 导入导出也会随任务映射一起恢复版本-任务绑定。
- 所有开发阶段已完成，前后端仍保持游客本地模式与账号云端模式的数据通路。
- 左侧主导航现已统一收拢到“项目管理”分类，包含“项目管理”“任务总览”“任务管理”“Kiosk 统计”“版本总览”和“App 版本管理”六个入口。
- 项目现已成为任务、Kiosk 与 App 版本数据的唯一上级实体，任务管理、Kiosk 统计和 App 版本管理都只使用项目管理模块中已有的项目。
- 任务总览页已压缩右侧主内容，移除“使用方式”，将全局任务统计与任务状态分布并排显示，并把项目任务摘要改为默认折叠的项目卡片。
- 项目管理页现已独立负责项目创建、修改、归档以及当前项目标签维护，任务管理页不再承载项目编辑入口。
- 左侧现已新增独立 `Kiosk 统计` 模块，可按当前项目维护 Kiosk 列表，并记录地区、位置、小票机连接方式与远控信息；新建面板仅在点击“新建 Kiosk”后打开，`Kiosk 平台` 与 `远控平台` 也支持预设下拉和“其他”自定义输入，列表新增地区分类下拉筛选，整体布局也进一步压缩到更紧凑的密度。
- 任务管理页现已恢复为当前项目下的任务列表主体，继续支持项目标签关联、子任务录入与内联勾选，以及按关键词/状态/标签搜索筛选；列表中的每项任务默认折叠展示。
- 任务现已支持负责人、开始时间、实际完成时间字段，并提供按当前项目批量更新任务状态的能力。
- 任务编辑面板现已新增独立“备注”字段，并支持游客本地、账号云端和 JSON 导入导出链路完整保留该内容。
- 账号与同步页现已补充白天/晚上界面模式切换，主题选择会保存在当前浏览器并作用于全局界面。
- 左侧功能导航栏已进一步压缩纵向间距，品牌区、当前状态卡和各分类入口的高度更紧凑。
- 左侧现已新增独立“常用工具”分类，除工具台页外，还直接提供工作区刷新、当前项目详情跳转、工作区摘要复制、项目摘要复制、待办清单复制、项目 JSON 复制和整个工作区导出等高频快捷入口。
- App 版本管理现已支持游客本地与账号云端双通道、按项目查看 App 与版本记录、资源版本字段维护、版本状态筛选、批量状态更新，以及项目级 App / 版本 JSON 导入导出并纳入完整工作区导出；版本记录现已支持“版本号 / 构建号 / 资源版本至少填一项”，可单独追踪资源版本更新，版本列表也会同步显示当前所选 App 的包名 / 标识输入框，便于核对与复制。
- 工作区与项目导入导出现已升级为版本 `4` 结构，项目数据中可直接嵌套 Kiosk、App 与版本；旧版独立 App 数据会自动迁移到导入项目或“版本迁移项目”。
- 数据工具、JSON 导入导出、游客导入云端和演示数据流程仍保持可用，并会同时覆盖任务数据、Kiosk 数据与 App 版本数据。

## Next Steps

- Keep primary workspace views separate from fixed-position editor panels as views are added.
- Maintain the local overwrite-password prompt as part of the administrator account creation workflow.
- Access control update: maintain the local administrator account-creation command and keep the public registration route disabled.
- Maintain the interactive administrator account-creation launcher alongside the command-line workflow.
- Keep navigation and right-side tab headers free of explanatory copy as new views are added.

1. 如需继续扩展任务管理，可增加项目统计图表、任务搜索高亮和更多批量操作。
2. 也可以继续扩展项目维度的设备与发布管理，例如 Kiosk 在线状态、打印机巡检记录、版本变更日志、渠道发布记录和审核节点时间线。
