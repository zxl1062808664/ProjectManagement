const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.TASK_ATLAS_DB_PATH = path.join(
  os.tmpdir(),
  `task-atlas-app-versions-${process.pid}.sqlite`
);
fs.rmSync(process.env.TASK_ATLAS_DB_PATH, { force: true });

const app = require("../server/app");

test("app version APIs cover app, version, import/export, and bulk status flows", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const registerResponse = await request(baseUrl, "/api/auth/register", {
      method: "POST",
      body: {
        username: "release_user",
        password: "securepass123",
      },
    });

    assert.equal(registerResponse.status, 201);
    const sessionCookie = registerResponse.headers.get("set-cookie");
    assert.match(sessionCookie, /task_atlas_session=/);

    const initialProjectsResponse = await request(baseUrl, "/api/projects", {
      cookie: sessionCookie,
    });
    assert.equal(initialProjectsResponse.status, 200);
    assert.equal(initialProjectsResponse.body.projects.length, 1);

    const defaultProject = initialProjectsResponse.body.projects[0];

    const createdProjectResponse = await request(baseUrl, "/api/projects", {
      method: "POST",
      cookie: sessionCookie,
      body: {
        name: "移动发布项目",
        description: "统一承接 iOS 版本发布",
        color: "#245a73",
      },
    });
    const createdProject = createdProjectResponse.body.project;

    assert.equal(createdProjectResponse.status, 201);
    assert.equal(createdProject.name, "移动发布项目");

    const initialAppsResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps`,
      {
        cookie: sessionCookie,
      }
    );
    assert.equal(initialAppsResponse.status, 200);
    assert.equal(initialAppsResponse.body.apps.length, 0);

    const createdAppResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          name: "Task Atlas iOS",
          description: "移动端主应用",
          color: "#245a73",
          platform: "ios",
          bundleId: "com.taskatlas.ios",
        },
      }
    );
    const createdApp = createdAppResponse.body.app;

    assert.equal(createdAppResponse.status, 201);
    assert.equal(createdApp.name, "Task Atlas iOS");
    assert.equal(createdApp.platform, "ios");
    assert.equal(createdApp.bundleId, "com.taskatlas.ios");
    assert.equal(createdApp.projectId, createdProject.id);

    const updatedAppResponse = await request(baseUrl, `/api/apps/${createdApp.id}`, {
      method: "PATCH",
      cookie: sessionCookie,
      body: {
        description: "移动端主应用-v2",
        archived: true,
      },
    });

    assert.equal(updatedAppResponse.status, 200);
    assert.equal(updatedAppResponse.body.app.archived, true);
    assert.equal(updatedAppResponse.body.app.description, "移动端主应用-v2");

    const restoredAppResponse = await request(baseUrl, `/api/apps/${createdApp.id}`, {
      method: "PATCH",
      cookie: sessionCookie,
      body: {
        archived: false,
      },
    });

    assert.equal(restoredAppResponse.status, 200);
    assert.equal(restoredAppResponse.body.app.archived, false);

    const createdVersionResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/${createdApp.id}/versions`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          versionName: "2.4.0",
          buildNumber: "24015",
          description: "接入版本管理入口",
          notes: "需要在正式发布前确认审核素材。",
          owner: "Zenith",
          channel: "gray",
          status: "doing",
          priority: "high",
          plannedDate: "2026-04-20",
          releaseDate: "2026-04-28",
        },
      }
    );
    const createdVersion = createdVersionResponse.body.version;

    assert.equal(createdVersionResponse.status, 201);
    assert.equal(createdVersion.versionName, "2.4.0");
    assert.equal(createdVersion.owner, "Zenith");
    assert.equal(createdVersion.channel, "gray");
    assert.equal(createdVersion.buildNumber, "24015");
    assert.equal(createdVersion.publishedDate, "");

    const updatedVersionResponse = await request(
      baseUrl,
      `/api/app-versions/${createdVersion.id}`,
      {
        method: "PATCH",
        cookie: sessionCookie,
        body: {
          status: "done",
          priority: "urgent",
          notes: "已完成审核并正式发布。",
        },
      }
    );

    assert.equal(updatedVersionResponse.status, 200);
    assert.equal(updatedVersionResponse.body.version.status, "done");
    assert.equal(updatedVersionResponse.body.version.priority, "urgent");
    assert.equal(updatedVersionResponse.body.version.notes, "已完成审核并正式发布。");
    assert.match(updatedVersionResponse.body.version.publishedDate, /^\d{4}-\d{2}-\d{2}$/);

    const secondVersionResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/${createdApp.id}/versions`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          versionName: "2.5.0",
          buildNumber: "25003",
          description: "准备 beta 验证版本",
          owner: "Mika",
          channel: "beta",
          status: "todo",
          priority: "medium",
          plannedDate: "2026-04-25",
        },
      }
    );
    const secondVersion = secondVersionResponse.body.version;

    assert.equal(secondVersionResponse.status, 201);
    assert.equal(secondVersion.versionName, "2.5.0");
    assert.equal(secondVersion.channel, "beta");

    const bulkUpdateResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/${createdApp.id}/versions`,
      {
        method: "PATCH",
        cookie: sessionCookie,
        body: {
          versionIds: [createdVersion.id, secondVersion.id],
          status: "review",
        },
      }
    );

    assert.equal(bulkUpdateResponse.status, 200);
    assert.equal(bulkUpdateResponse.body.updatedCount, 2);
    assert.equal(bulkUpdateResponse.body.versions.length, 2);
    assert.equal(bulkUpdateResponse.body.versions[1].status, "review");
    assert.equal(bulkUpdateResponse.body.versions[1].publishedDate, "");

    const overviewResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/overview`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(overviewResponse.status, 200);
    assert.equal(overviewResponse.body.totals.appCount, 1);
    assert.equal(overviewResponse.body.totals.versionCount, 2);
    assert.equal(overviewResponse.body.totals.reviewCount, 2);
    assert.equal(overviewResponse.body.project.id, createdProject.id);
    assert.equal(overviewResponse.body.apps[0].recentVersions.length, 2);

    const boardResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/${createdApp.id}/board`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(boardResponse.status, 200);
    assert.equal(boardResponse.body.project.id, createdProject.id);
    assert.equal(boardResponse.body.app.id, createdApp.id);
    assert.equal(boardResponse.body.versions.length, 2);
    assert.equal(boardResponse.body.versions[0].channel, "gray");
    assert.equal(boardResponse.body.versions[0].owner, "Zenith");

    const exportResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/${createdApp.id}/export`,
      {
        cookie: sessionCookie,
      }
    );
    const exportPayload = exportResponse.body;

    assert.equal(exportResponse.status, 200);
    assert.equal(exportPayload.scope, "app");
    assert.equal(exportPayload.project.name, "移动发布项目");
    assert.equal(exportPayload.app.name, "Task Atlas iOS");
    assert.equal(exportPayload.versions.length, 2);
    assert.equal(exportPayload.versions[0].buildNumber, "24015");

    const importedAppResponse = await request(baseUrl, "/api/apps/import/json", {
      method: "POST",
      cookie: sessionCookie,
      body: exportPayload,
    });

    assert.equal(importedAppResponse.status, 201);
    assert.equal(importedAppResponse.body.importedCount, 1);
    assert.equal(importedAppResponse.body.importedProjects.length, 1);
    assert.equal(importedAppResponse.body.importedApps.length, 1);
    assert.equal(importedAppResponse.body.importedProjects[0].name, "移动发布项目");

    const importedStandaloneApp = importedAppResponse.body.importedApps[0];
    const importedStandaloneBoardResponse = await request(
      baseUrl,
      `/api/projects/${importedStandaloneApp.projectId}/apps/${importedStandaloneApp.id}/board`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(importedStandaloneBoardResponse.status, 200);
    assert.equal(importedStandaloneBoardResponse.body.versions.length, 2);
    assert.equal(importedStandaloneBoardResponse.body.versions[0].buildNumber, "24015");

    const workspaceImportResponse = await request(baseUrl, "/api/apps/import/json", {
      method: "POST",
      cookie: sessionCookie,
      body: {
        source: "task-atlas",
        version: 4,
        scope: "workspace",
        projects: [
          {
            project: {
              name: "Web 发布项目",
              description: "来自工作区 JSON 的 Web 版本项目",
              color: "#c16b39",
              archived: false,
            },
            apps: [
              {
                app: {
                  name: "Task Atlas Web",
                  description: "来自工作区 JSON 的 Web 端",
                  color: "#c16b39",
                  platform: "web",
                  bundleId: "web.taskatlas.app",
                  archived: false,
                },
                versions: [
                  {
                    versionName: "1.9.0",
                    buildNumber: "19003",
                    description: "导入的版本记录",
                    notes: "补齐发布日志入口。",
                    owner: "Ava",
                    channel: "internal",
                    status: "doing",
                    priority: "medium",
                    releaseDate: "2026-05-03",
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    assert.equal(workspaceImportResponse.status, 201);
    assert.equal(workspaceImportResponse.body.importedCount, 1);
    assert.equal(workspaceImportResponse.body.importedProjects.length, 1);

    const importedWorkspaceApp = workspaceImportResponse.body.importedApps[0];
    const importedWorkspaceAppId = importedWorkspaceApp.id;
    const importedBoardResponse = await request(
      baseUrl,
      `/api/projects/${importedWorkspaceApp.projectId}/apps/${importedWorkspaceAppId}/board`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(importedBoardResponse.status, 200);
    assert.equal(importedBoardResponse.body.project.name, "Web 发布项目");
    assert.equal(importedBoardResponse.body.app.platform, "web");
    assert.equal(importedBoardResponse.body.versions.length, 1);
    assert.equal(importedBoardResponse.body.versions[0].notes, "补齐发布日志入口。");

    const deleteVersionResponse = await request(
      baseUrl,
      `/api/app-versions/${importedBoardResponse.body.versions[0].id}`,
      {
        method: "DELETE",
        cookie: sessionCookie,
      }
    );
    assert.equal(deleteVersionResponse.status, 204);

    const deleteAppResponse = await request(baseUrl, `/api/apps/${createdApp.id}`, {
      method: "DELETE",
      cookie: sessionCookie,
    });
    assert.equal(deleteAppResponse.status, 204);

    const finalAppsResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(finalAppsResponse.status, 200);
    assert.ok(!finalAppsResponse.body.apps.some((item) => item.id === createdApp.id));

    const finalProjectsResponse = await request(baseUrl, "/api/projects", {
      cookie: sessionCookie,
    });

    assert.equal(finalProjectsResponse.status, 200);
    assert.ok(finalProjectsResponse.body.projects.some((item) => item.id === defaultProject.id));
    assert.ok(
      finalProjectsResponse.body.projects.some(
        (item) => item.id === importedWorkspaceApp.projectId
      )
    );
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

async function request(baseUrl, pathname, options = {}) {
  const { method = "GET", body, cookie } = options;
  const headers = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(cookie ? { Cookie: cookie } : {}),
  };

  const response = await fetch(`${baseUrl}${pathname}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  return {
    status: response.status,
    headers: response.headers,
    body: text ? JSON.parse(text) : null,
  };
}
