const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.TASK_ATLAS_DB_PATH = path.join(
  os.tmpdir(),
  `task-atlas-auth-${process.pid}.sqlite`
);
fs.rmSync(process.env.TASK_ATLAS_DB_PATH, { force: true });

const app = require("../server/app");

test("auth flow supports register, session restore, protected route, and logout", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "phase2_user",
        password: "securepass123",
      }),
    });

    const registerPayload = await registerResponse.json();
    const sessionCookie = registerResponse.headers.get("set-cookie");

    assert.equal(registerResponse.status, 201);
    assert.equal(registerPayload.authenticated, true);
    assert.equal(registerPayload.user.username, "phase2_user");
    assert.match(sessionCookie, /task_atlas_session=/);

    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      headers: {
        Cookie: sessionCookie,
      },
    });
    const sessionPayload = await sessionResponse.json();

    assert.equal(sessionResponse.status, 200);
    assert.equal(sessionPayload.authenticated, true);
    assert.equal(sessionPayload.user.username, "phase2_user");

    const workspaceResponse = await fetch(`${baseUrl}/api/auth/workspace`, {
      headers: {
        Cookie: sessionCookie,
      },
    });
    const workspacePayload = await workspaceResponse.json();

    assert.equal(workspaceResponse.status, 200);
    assert.equal(workspacePayload.authenticated, true);
    assert.match(workspacePayload.message, /云端工作区认证已完成/);

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
    });
    const logoutPayload = await logoutResponse.json();

    assert.equal(logoutResponse.status, 200);
    assert.equal(logoutPayload.authenticated, false);

    const unauthorizedResponse = await fetch(`${baseUrl}/api/auth/workspace`);
    const unauthorizedPayload = await unauthorizedResponse.json();

    assert.equal(unauthorizedResponse.status, 401);
    assert.equal(unauthorizedPayload.error.code, "UNAUTHORIZED");
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
