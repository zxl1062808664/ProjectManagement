const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.TASK_ATLAS_DB_PATH = path.join(
  os.tmpdir(),
  `task-atlas-health-${process.pid}.sqlite`
);
fs.rmSync(process.env.TASK_ATLAS_DB_PATH, { force: true });

const app = require("../server/app");

test("GET /api/health returns service metadata", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    assert.equal(payload.service, "task-atlas");
    assert.match(payload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});

test("GET / serves the frontend shell", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/`);
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /Task Atlas \| 任务与版本管理/);
    assert.match(html, /任务总览/);
    assert.match(html, /任务详情/);
    assert.match(html, /App 版本管理/);
    assert.match(html, /版本总览/);
    assert.match(html, /版本详情/);
    assert.match(html, /数据工具/);
    assert.match(html, /账号与同步/);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
