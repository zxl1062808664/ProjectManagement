const { db, databasePath } = require("../server/db");
const { createUser, loginUser } = require("../server/services/auth-service");
const {
  createProject,
  createTag,
  createTask,
} = require("../server/services/workspace-service");

const DEMO_USERNAME = process.env.TASK_ATLAS_DEMO_USERNAME || "taskatlas_demo";
const DEMO_PASSWORD = process.env.TASK_ATLAS_DEMO_PASSWORD || "demo_pass_123";
const DEMO_PROJECT_NAME = "演示工作区";

const selectUserByUsernameStatement = db.prepare(`
  SELECT id, username, created_at, updated_at
  FROM users
  WHERE username = ?
`);

const selectProjectByNameStatement = db.prepare(`
  SELECT id
  FROM projects
  WHERE user_id = ? AND name = ?
`);

main();

function main() {
  const user = ensureDemoUser();

  const existingProject = selectProjectByNameStatement.get(user.id, DEMO_PROJECT_NAME);
  if (!existingProject) {
    seedWorkspace(user.id);
    console.log(`Seeded demo workspace for ${DEMO_USERNAME}.`);
  } else {
    console.log(`Demo workspace already exists for ${DEMO_USERNAME}.`);
  }

  console.log(`Database: ${databasePath}`);
  console.log(`Username: ${DEMO_USERNAME}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
}

function ensureDemoUser() {
  const existingUser = selectUserByUsernameStatement.get(DEMO_USERNAME);
  if (!existingUser) {
    return createUser({
      username: DEMO_USERNAME,
      password: DEMO_PASSWORD,
    });
  }

  try {
    return loginUser({
      username: DEMO_USERNAME,
      password: DEMO_PASSWORD,
    }).user;
  } catch (error) {
    console.error(
      `User ${DEMO_USERNAME} already exists, but the default demo password does not match.`
    );
    process.exitCode = 1;
    process.exit();
  }
}

function seedWorkspace(userId) {
  const project = createProject(userId, {
    name: DEMO_PROJECT_NAME,
    description: "用于验收游客/云端双模式、多项目、标签和子任务能力的演示项目。",
    color: "#c16b39",
  });

  const designTag = createTag(userId, project.id, {
    name: "设计",
    color: "#245a73",
  });
  const developTag = createTag(userId, project.id, {
    name: "开发",
    color: "#4f7a56",
  });
  const releaseTag = createTag(userId, project.id, {
    name: "发布",
    color: "#a84738",
  });

  createTask(userId, project.id, {
    title: "梳理新版首页改版范围",
    description: "确认视觉改版、组件替换、埋点调整和上线说明。",
    status: "doing",
    priority: "high",
    dueDate: offsetDate(2),
    tagIds: [designTag.id, developTag.id],
    subtasks: [
      { title: "整理视觉差异截图", completed: true },
      { title: "补齐组件替换清单", completed: false },
      { title: "核对埋点命名", completed: false },
    ],
  });

  createTask(userId, project.id, {
    title: "准备上线检查与回滚预案",
    description: "输出发布时间窗、回滚入口、值班联系人和观察指标。",
    status: "review",
    priority: "urgent",
    dueDate: offsetDate(4),
    tagIds: [releaseTag.id],
    subtasks: [
      { title: "确认值班人安排", completed: false },
      { title: "验证回滚脚本", completed: false },
    ],
  });
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
