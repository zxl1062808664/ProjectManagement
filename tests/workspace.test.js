const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

process.env.TASK_ATLAS_DB_PATH = path.join(
  os.tmpdir(),
  `task-atlas-workspace-${process.pid}.sqlite`
);
fs.rmSync(process.env.TASK_ATLAS_DB_PATH, { force: true });

const app = require("../server/app");

test("workspace APIs cover project, tag, task, import/export, and cleanup flows", async () => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    const registerResponse = await request(baseUrl, "/api/auth/register", {
      method: "POST",
      body: {
        username: "workspace_user",
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
    assert.equal(initialProjectsResponse.body.projects[0].name, "默认项目");

    const createdProjectResponse = await request(baseUrl, "/api/projects", {
      method: "POST",
      cookie: sessionCookie,
      body: {
        name: "官网改版",
        description: "冲刺阶段项目",
        color: "#245a73",
      },
    });
    const createdProject = createdProjectResponse.body.project;

    assert.equal(createdProjectResponse.status, 201);
    assert.equal(createdProject.name, "官网改版");

    const updatedProjectResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}`,
      {
        method: "PATCH",
        cookie: sessionCookie,
        body: {
          description: "冲刺阶段项目-v2",
          archived: true,
        },
      }
    );
    assert.equal(updatedProjectResponse.status, 200);
    assert.equal(updatedProjectResponse.body.project.archived, true);
    assert.equal(updatedProjectResponse.body.project.description, "冲刺阶段项目-v2");

    const restoredProjectResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}`,
      {
        method: "PATCH",
        cookie: sessionCookie,
        body: {
          archived: false,
        },
      }
    );
    assert.equal(restoredProjectResponse.status, 200);
    assert.equal(restoredProjectResponse.body.project.archived, false);

    const createdKioskResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/kiosks`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          region: "华东 / 上海",
          location: "虹桥门店一层入口",
          printerConnection: "usb",
          printerModel: "EPSON TM-m30III",
          printerNotes: "驱动已预装，默认直连。",
          kioskPlatform: "Windows 11",
          remotePlatform: "向日葵",
          remoteCode: "SH-HQ-01",
          notes: "现场网络走商场专线。",
        },
      }
    );
    const createdKiosk = createdKioskResponse.body.kiosk;

    assert.equal(createdKioskResponse.status, 201);
    assert.equal(createdKiosk.projectId, createdProject.id);
    assert.equal(createdKiosk.location, "虹桥门店一层入口");
    assert.equal(createdKiosk.printerConnection, "usb");

    const updatedKioskResponse = await request(baseUrl, `/api/kiosks/${createdKiosk.id}`, {
      method: "PATCH",
      cookie: sessionCookie,
      body: {
        printerConnection: "wifi",
        remoteCode: "SH-HQ-01-WIFI",
        notes: "现场网络已切到门店 WiFi。",
      },
    });

    assert.equal(updatedKioskResponse.status, 200);
    assert.equal(updatedKioskResponse.body.kiosk.printerConnection, "wifi");
    assert.equal(updatedKioskResponse.body.kiosk.remoteCode, "SH-HQ-01-WIFI");
    assert.equal(updatedKioskResponse.body.kiosk.notes, "现场网络已切到门店 WiFi。");

    const createdTagResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/tags`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          name: "前端",
          color: "#4f7a56",
        },
      }
    );
    const createdTag = createdTagResponse.body.tag;

    assert.equal(createdTagResponse.status, 201);
    assert.equal(createdTag.name, "前端");

    const updatedTagResponse = await request(baseUrl, `/api/tags/${createdTag.id}`, {
      method: "PATCH",
      cookie: sessionCookie,
      body: {
        name: "前端联调",
        color: "#8c651a",
      },
    });
    const updatedTag = updatedTagResponse.body.tag;

    assert.equal(updatedTagResponse.status, 200);
    assert.equal(updatedTag.name, "前端联调");
    assert.equal(updatedTag.color, "#8c651a");

    const createdTaskResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/tasks`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          title: "补齐埋点校验",
          description: "确认首页埋点字段和触发时机。",
          notes: "优先和数据同学确认字段命名，再补充验收截图。",
          assignee: "Zenith",
          status: "doing",
          priority: "high",
          startDate: "2026-04-20",
          dueDate: "2026-05-01",
          tagIds: [updatedTag.id],
          subtasks: [
            { title: "确认字段命名", completed: false },
            { title: "验证触发链路", completed: false },
          ],
        },
      }
    );
    const createdTask = createdTaskResponse.body.task;

    assert.equal(createdTaskResponse.status, 201);
    assert.equal(createdTask.title, "补齐埋点校验");
    assert.equal(createdTask.assignee, "Zenith");
    assert.equal(createdTask.notes, "优先和数据同学确认字段命名，再补充验收截图。");
    assert.equal(createdTask.startDate, "2026-04-20");
    assert.equal(createdTask.completedDate, "");
    assert.deepEqual(createdTask.tagIds, [updatedTag.id]);
    assert.equal(createdTask.subtasks.length, 2);

    const updatedSubtaskResponse = await request(
      baseUrl,
      `/api/subtasks/${createdTask.subtasks[0].id}`,
      {
        method: "PATCH",
        cookie: sessionCookie,
        body: {
          completed: true,
        },
      }
    );

    assert.equal(updatedSubtaskResponse.status, 200);
    assert.equal(updatedSubtaskResponse.body.subtask.completed, true);

    const updatedTaskResponse = await request(baseUrl, `/api/tasks/${createdTask.id}`, {
      method: "PATCH",
      cookie: sessionCookie,
      body: {
        status: "done",
        priority: "urgent",
        notes: "埋点字段已确认，待补回归截图。",
      },
    });

    assert.equal(updatedTaskResponse.status, 200);
    assert.equal(updatedTaskResponse.body.task.status, "done");
    assert.equal(updatedTaskResponse.body.task.priority, "urgent");
    assert.equal(updatedTaskResponse.body.task.notes, "埋点字段已确认，待补回归截图。");
    assert.match(updatedTaskResponse.body.task.completedDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(updatedTaskResponse.body.task.subtasks.length, 2);
    assert.equal(updatedTaskResponse.body.task.subtasks[0].completed, true);

    const secondTaskResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/tasks`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          title: "整理回归清单",
          description: "确认改版后核心路径回归范围。",
          assignee: "Mika",
          status: "todo",
          priority: "medium",
          startDate: "2026-04-22",
        },
      }
    );
    const secondTask = secondTaskResponse.body.task;

    assert.equal(secondTaskResponse.status, 201);
    assert.equal(secondTask.assignee, "Mika");
    assert.equal(secondTask.startDate, "2026-04-22");

    const bulkUpdateResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/tasks`,
      {
        method: "PATCH",
        cookie: sessionCookie,
        body: {
          taskIds: [createdTask.id, secondTask.id],
          status: "done",
        },
      }
    );

    assert.equal(bulkUpdateResponse.status, 200);
    assert.equal(bulkUpdateResponse.body.updatedCount, 2);
    assert.equal(bulkUpdateResponse.body.tasks.length, 2);
    assert.equal(bulkUpdateResponse.body.tasks[1].status, "done");
    assert.match(bulkUpdateResponse.body.tasks[1].completedDate, /^\d{4}-\d{2}-\d{2}$/);

    const createdAppResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          name: "官网运营台",
          description: "项目配套运营后台",
          color: "#245a73",
          platform: "web",
          bundleId: "com.taskatlas.ops",
        },
      }
    );
    const createdApp = createdAppResponse.body.app;

    assert.equal(createdAppResponse.status, 201);
    assert.equal(createdApp.projectId, createdProject.id);
    assert.equal(createdApp.platform, "web");

    const createdVersionResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/${createdApp.id}/versions`,
      {
        method: "POST",
        cookie: sessionCookie,
        body: {
          versionName: "1.2.0",
          buildNumber: "12005",
          description: "同步项目导出里的版本信息",
          owner: "Ava",
          channel: "beta",
          status: "review",
          priority: "medium",
          plannedDate: "2026-04-30",
          taskIds: [createdTask.id, secondTask.id],
        },
      }
    );

    assert.equal(createdVersionResponse.status, 201);
    assert.equal(createdVersionResponse.body.version.projectId, createdProject.id);
    assert.equal(createdVersionResponse.body.version.versionName, "1.2.0");
    assert.deepEqual(createdVersionResponse.body.version.taskIds, [
      createdTask.id,
      secondTask.id,
    ]);
    const createdVersion = createdVersionResponse.body.version;

    const usageKioskResponse = await request(baseUrl, `/api/kiosks/${createdKiosk.id}`, {
      method: "PATCH",
      cookie: sessionCookie,
      body: {
        activeAppId: createdApp.id,
        activeVersionId: createdVersion.id,
      },
    });

    assert.equal(usageKioskResponse.status, 200);
    assert.equal(usageKioskResponse.body.kiosk.activeAppId, createdApp.id);
    assert.equal(usageKioskResponse.body.kiosk.activeVersionId, createdVersion.id);
    assert.equal(usageKioskResponse.body.kiosk.activeAppName, createdApp.name);
    assert.equal(usageKioskResponse.body.kiosk.activeVersionName, "1.2.0");

    const projectVersionsResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/apps/versions`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(projectVersionsResponse.status, 200);
    assert.equal(projectVersionsResponse.body.versions.length, 1);
    assert.equal(projectVersionsResponse.body.versions[0].id, createdVersion.id);
    assert.deepEqual(projectVersionsResponse.body.versions[0].taskIds, [
      createdTask.id,
      secondTask.id,
    ]);

    const overviewResponse = await request(baseUrl, "/api/projects/overview", {
      cookie: sessionCookie,
    });

    assert.equal(overviewResponse.status, 200);
    assert.equal(overviewResponse.body.totals.projectCount, 2);
    assert.equal(overviewResponse.body.totals.taskCount, 2);
    assert.equal(overviewResponse.body.totals.appCount, 1);
    assert.equal(overviewResponse.body.totals.versionCount, 1);
    assert.equal(overviewResponse.body.totals.kioskCount, 1);
    assert.equal(overviewResponse.body.totals.doneCount, 2);
    const createdProjectSummary = overviewResponse.body.projects.find(
      (project) => project.id === createdProject.id
    );
    assert.equal(createdProjectSummary.recentTasks.length, 2);
    assert.equal(createdProjectSummary.appCount, 1);
    assert.equal(createdProjectSummary.versionCount, 1);
    assert.equal(createdProjectSummary.kioskCount, 1);

    const boardResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/board`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(boardResponse.status, 200);
    assert.equal(boardResponse.body.project.id, createdProject.id);
    assert.equal(boardResponse.body.tags.length, 1);
    assert.equal(boardResponse.body.kiosks.length, 1);
    assert.equal(boardResponse.body.kiosks[0].printerConnection, "wifi");
    assert.equal(boardResponse.body.kiosks[0].remoteCode, "SH-HQ-01-WIFI");
    assert.equal(boardResponse.body.kiosks[0].activeAppName, createdApp.name);
    assert.equal(boardResponse.body.kiosks[0].activeVersionName, "1.2.0");
    assert.equal(boardResponse.body.tasks.length, 2);
    assert.equal(boardResponse.body.tasks[0].status, "done");
    assert.equal(boardResponse.body.tasks[0].assignee, "Zenith");
    assert.equal(boardResponse.body.tasks[0].notes, "埋点字段已确认，待补回归截图。");

    const exportResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/export`,
      {
        cookie: sessionCookie,
      }
    );
    const exportPayload = exportResponse.body;

    assert.equal(exportResponse.status, 200);
    assert.equal(exportPayload.version, 4);
    assert.equal(exportPayload.scope, "project");
    assert.equal(exportPayload.project.name, "官网改版");
    assert.equal(exportPayload.tags[0].name, "前端联调");
    assert.equal(exportPayload.kiosks.length, 1);
    assert.equal(exportPayload.kiosks[0].location, "虹桥门店一层入口");
    assert.equal(exportPayload.kiosks[0].printerConnection, "wifi");
    const exportedTask = exportPayload.tasks.find((task) => task.title === "补齐埋点校验");
    assert.equal(exportedTask.assignee, "Zenith");
    assert.equal(exportedTask.notes, "埋点字段已确认，待补回归截图。");
    assert.equal(exportedTask.id, createdTask.id);
    assert.equal(exportedTask.startDate, "2026-04-20");
    assert.match(exportedTask.completedDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(exportedTask.tagNames[0], "前端联调");
    assert.equal(exportedTask.subtasks.length, 2);
    assert.equal(exportPayload.apps.length, 1);
    assert.equal(exportPayload.apps[0].app.name, "官网运营台");
    assert.equal(exportPayload.apps[0].versions.length, 1);
    assert.equal(exportPayload.apps[0].versions[0].versionName, "1.2.0");
    assert.deepEqual(exportPayload.apps[0].versions[0].taskIds, [
      createdTask.id,
      secondTask.id,
    ]);

    const clearCompletedResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}/tasks/completed`,
      {
        method: "DELETE",
        cookie: sessionCookie,
      }
    );

    assert.equal(clearCompletedResponse.status, 200);
    assert.equal(clearCompletedResponse.body.deletedCount, 2);

    const deleteTagResponse = await request(baseUrl, `/api/tags/${updatedTag.id}`, {
      method: "DELETE",
      cookie: sessionCookie,
    });
    assert.equal(deleteTagResponse.status, 204);

    const importedProjectResponse = await request(baseUrl, "/api/import/json", {
      method: "POST",
      cookie: sessionCookie,
      body: exportPayload,
    });

    assert.equal(importedProjectResponse.status, 201);
    assert.equal(importedProjectResponse.body.importedCount, 1);
    assert.equal(importedProjectResponse.body.importedAppCount, 1);
    assert.equal(importedProjectResponse.body.importedKioskCount, 1);

    const importedProjectId = importedProjectResponse.body.importedProjects[0].id;
    const importedProjectBoardResponse = await request(
      baseUrl,
      `/api/projects/${importedProjectId}/board`,
      {
        cookie: sessionCookie,
      }
    );
    assert.equal(importedProjectBoardResponse.status, 200);
    assert.equal(importedProjectBoardResponse.body.tasks.length, 2);

    const importedProjectAppsResponse = await request(
      baseUrl,
      `/api/projects/${importedProjectId}/apps`,
      {
        cookie: sessionCookie,
      }
    );
    assert.equal(importedProjectAppsResponse.status, 200);
    assert.equal(importedProjectAppsResponse.body.apps.length, 1);

    const importedProjectAppBoardResponse = await request(
      baseUrl,
      `/api/projects/${importedProjectId}/apps/${importedProjectAppsResponse.body.apps[0].id}/board`,
      {
        cookie: sessionCookie,
      }
    );
    assert.equal(importedProjectAppBoardResponse.status, 200);
    assert.equal(importedProjectAppBoardResponse.body.versions.length, 1);
    assert.deepEqual(
      importedProjectAppBoardResponse.body.versions[0].taskIds.slice().sort(),
      importedProjectBoardResponse.body.tasks.map((task) => task.id).sort()
    );

    const workspaceImportResponse = await request(baseUrl, "/api/import/json", {
      method: "POST",
      cookie: sessionCookie,
      body: {
        source: "task-atlas",
        version: 4,
        scope: "workspace",
        projects: [
          {
            project: {
              name: "导入项目",
              description: "来自工作区 JSON 的项目",
              color: "#a84738",
              archived: false,
            },
            tags: [{ name: "文档", color: "#245a73" }],
            kiosks: [
              {
                region: "华南 / 深圳",
                location: "福田门店二层",
                printerConnection: "bluetooth",
                printerModel: "SUNMI V2",
                printerNotes: "蓝牙配对后需要手动切回默认打印机。",
                kioskPlatform: "Android",
                remotePlatform: "TeamViewer",
                remoteCode: "SZ-FT-02",
                notes: "导入时同时补齐 Kiosk 数据。",
              },
            ],
            tasks: [
              {
                id: "delivery-doc-task",
                title: "编写交付说明",
                description: "补齐环境变量和部署步骤。",
                notes: "上线前和运维确认变量命名。",
                status: "review",
                priority: "medium",
                dueDate: "2026-05-03",
                tagNames: ["文档"],
                subtasks: [{ title: "列出环境变量", completed: false }],
              },
            ],
            apps: [
              {
                app: {
                  name: "交付工作台",
                  description: "来自工作区 JSON 的配套应用",
                  color: "#245a73",
                  platform: "web",
                  bundleId: "taskatlas.delivery.web",
                  archived: false,
                },
                versions: [
                  {
                    versionName: "0.9.0",
                    buildNumber: "09002",
                    description: "导入时同时补齐版本数据",
                    owner: "Mika",
                    channel: "internal",
                    status: "doing",
                    priority: "medium",
                    taskIds: ["delivery-doc-task"],
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
    assert.equal(workspaceImportResponse.body.importedAppCount, 1);
    assert.equal(workspaceImportResponse.body.importedKioskCount, 1);

    const importedWorkspaceProjectId =
      workspaceImportResponse.body.importedProjects[0].id;

    const importedBoardResponse = await request(
      baseUrl,
      `/api/projects/${importedWorkspaceProjectId}/board`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(importedBoardResponse.status, 200);
    assert.equal(importedBoardResponse.body.tags.length, 1);
    assert.equal(importedBoardResponse.body.kiosks.length, 1);
    assert.equal(importedBoardResponse.body.kiosks[0].printerConnection, "bluetooth");
    assert.equal(importedBoardResponse.body.kiosks[0].remotePlatform, "TeamViewer");
    assert.equal(importedBoardResponse.body.tags[0].name, "文档");
    assert.equal(importedBoardResponse.body.tasks.length, 1);
    assert.equal(importedBoardResponse.body.tasks[0].subtasks.length, 1);
    assert.equal(importedBoardResponse.body.tasks[0].notes, "上线前和运维确认变量命名。");

    const importedAppsResponse = await request(
      baseUrl,
      `/api/projects/${importedWorkspaceProjectId}/apps`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(importedAppsResponse.status, 200);
    assert.equal(importedAppsResponse.body.apps.length, 1);
    assert.equal(importedAppsResponse.body.apps[0].name, "交付工作台");

    const importedAppBoardResponse = await request(
      baseUrl,
      `/api/projects/${importedWorkspaceProjectId}/apps/${importedAppsResponse.body.apps[0].id}/board`,
      {
        cookie: sessionCookie,
      }
    );

    assert.equal(importedAppBoardResponse.status, 200);
    assert.equal(importedAppBoardResponse.body.versions.length, 1);
    assert.equal(importedAppBoardResponse.body.versions[0].versionName, "0.9.0");
    assert.deepEqual(importedAppBoardResponse.body.versions[0].taskIds, [
      importedBoardResponse.body.tasks[0].id,
    ]);

    const deleteImportedKioskResponse = await request(
      baseUrl,
      `/api/kiosks/${importedBoardResponse.body.kiosks[0].id}`,
      {
        method: "DELETE",
        cookie: sessionCookie,
      }
    );
    assert.equal(deleteImportedKioskResponse.status, 204);

    const deleteTaskResponse = await request(
      baseUrl,
      `/api/tasks/${importedBoardResponse.body.tasks[0].id}`,
      {
        method: "DELETE",
        cookie: sessionCookie,
      }
    );
    assert.equal(deleteTaskResponse.status, 204);

    const deleteProjectResponse = await request(
      baseUrl,
      `/api/projects/${createdProject.id}`,
      {
        method: "DELETE",
        cookie: sessionCookie,
      }
    );
    assert.equal(deleteProjectResponse.status, 204);

    const finalProjectsResponse = await request(baseUrl, "/api/projects", {
      cookie: sessionCookie,
    });

    assert.equal(finalProjectsResponse.status, 200);
    assert.ok(
      finalProjectsResponse.body.projects.some(
        (project) => project.id === importedWorkspaceProjectId
      )
    );
    assert.ok(
      !finalProjectsResponse.body.projects.some(
        (project) => project.id === createdProject.id
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
