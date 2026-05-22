const crypto = require("node:crypto");

const { db } = require("../db");

const VALID_STATUSES = new Set(["todo", "doing", "review", "done"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const VALID_APP_PLATFORMS = new Set([
  "ios",
  "android",
  "web",
  "miniapp",
  "desktop",
  "service",
]);
const VALID_CHANNELS = new Set(["stable", "gray", "beta", "internal", "hotfix"]);

const selectProjectByIdForUserStatement = db.prepare(`
  SELECT id, user_id, name, description, color, archived, created_at, updated_at
  FROM projects
  WHERE id = ? AND user_id = ?
`);

const insertProjectStatement = db.prepare(`
  INSERT INTO projects (id, user_id, name, description, color, archived, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateProjectTimestampStatement = db.prepare(`
  UPDATE projects
  SET updated_at = ?
  WHERE id = ?
`);

const selectAppsByUserStatement = db.prepare(`
  SELECT
    id,
    user_id,
    project_id,
    name,
    description,
    color,
    platform,
    bundle_id,
    archived,
    created_at,
    updated_at
  FROM apps
  WHERE user_id = ?
  ORDER BY archived ASC, updated_at DESC, created_at DESC
`);

const selectAppsByProjectStatement = db.prepare(`
  SELECT
    id,
    user_id,
    project_id,
    name,
    description,
    color,
    platform,
    bundle_id,
    archived,
    created_at,
    updated_at
  FROM apps
  WHERE user_id = ? AND project_id = ?
  ORDER BY archived ASC, updated_at DESC, created_at DESC
`);

const selectAppByIdStatement = db.prepare(`
  SELECT
    id,
    user_id,
    project_id,
    name,
    description,
    color,
    platform,
    bundle_id,
    archived,
    created_at,
    updated_at
  FROM apps
  WHERE id = ? AND user_id = ?
`);

const selectAppByIdAnyUserStatement = db.prepare(`
  SELECT
    id,
    user_id,
    project_id,
    name,
    description,
    color,
    platform,
    bundle_id,
    archived,
    created_at,
    updated_at
  FROM apps
  WHERE id = ?
`);

const insertAppStatement = db.prepare(`
  INSERT INTO apps (
    id,
    user_id,
    project_id,
    name,
    description,
    color,
    platform,
    bundle_id,
    archived,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateAppStatement = db.prepare(`
  UPDATE apps
  SET
    project_id = ?,
    name = ?,
    description = ?,
    color = ?,
    platform = ?,
    bundle_id = ?,
    archived = ?,
    updated_at = ?
  WHERE id = ? AND user_id = ?
`);

const deleteAppStatement = db.prepare(`
  DELETE FROM apps
  WHERE id = ? AND user_id = ?
`);

const deleteAppsByProjectStatement = db.prepare(`
  DELETE FROM apps
  WHERE project_id = ? AND user_id = ?
`);

const selectVersionsByAppStatement = db.prepare(`
  SELECT
    id,
    app_id,
    version_name,
    build_number,
    resource_version,
    description,
    notes,
    owner,
    channel,
    status,
    priority,
    planned_date,
    release_date,
    published_date,
    position,
    created_at,
    updated_at
  FROM app_versions
  WHERE app_id = ?
  ORDER BY position ASC, created_at DESC
`);

const selectVersionsByProjectStatement = db.prepare(`
  SELECT
    app_versions.id,
    app_versions.app_id,
    apps.project_id,
    app_versions.version_name,
    app_versions.build_number,
    app_versions.resource_version,
    app_versions.description,
    app_versions.notes,
    app_versions.owner,
    app_versions.channel,
    app_versions.status,
    app_versions.priority,
    app_versions.planned_date,
    app_versions.release_date,
    app_versions.published_date,
    app_versions.position,
    app_versions.created_at,
    app_versions.updated_at
  FROM app_versions
  JOIN apps ON apps.id = app_versions.app_id
  WHERE apps.user_id = ? AND apps.project_id = ?
  ORDER BY apps.archived ASC, apps.updated_at DESC, app_versions.position ASC, app_versions.created_at DESC
`);

const selectVersionByIdForUserStatement = db.prepare(`
  SELECT
    app_versions.id,
    app_versions.app_id,
    apps.project_id,
    app_versions.version_name,
    app_versions.build_number,
    app_versions.resource_version,
    app_versions.description,
    app_versions.notes,
    app_versions.owner,
    app_versions.channel,
    app_versions.status,
    app_versions.priority,
    app_versions.planned_date,
    app_versions.release_date,
    app_versions.published_date,
    app_versions.position,
    app_versions.created_at,
    app_versions.updated_at
  FROM app_versions
  JOIN apps ON apps.id = app_versions.app_id
  WHERE app_versions.id = ? AND apps.user_id = ?
`);

const insertVersionStatement = db.prepare(`
  INSERT INTO app_versions (
    id,
    app_id,
    version_name,
    build_number,
    resource_version,
    description,
    notes,
    owner,
    channel,
    status,
    priority,
    planned_date,
    release_date,
    published_date,
    position,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateVersionStatement = db.prepare(`
  UPDATE app_versions
  SET
    version_name = ?,
    build_number = ?,
    resource_version = ?,
    description = ?,
    notes = ?,
    owner = ?,
    channel = ?,
    status = ?,
    priority = ?,
    planned_date = ?,
    release_date = ?,
    published_date = ?,
    updated_at = ?
  WHERE id = ?
`);

const updateVersionStatusStatement = db.prepare(`
  UPDATE app_versions
  SET status = ?, published_date = ?, updated_at = ?
  WHERE id = ?
`);

const deleteVersionStatement = db.prepare(`
  DELETE FROM app_versions
  WHERE id = ?
`);

const clearKioskActiveAppStatement = db.prepare(`
  UPDATE kiosks
  SET active_app_id = '', active_version_id = '', updated_at = ?
  WHERE active_app_id = ?
`);

const clearKioskActiveVersionStatement = db.prepare(`
  UPDATE kiosks
  SET active_version_id = '', updated_at = ?
  WHERE active_version_id = ?
`);

const selectMaxPositionByAppStatement = db.prepare(`
  SELECT COALESCE(MAX(position), 0) AS max_position
  FROM app_versions
  WHERE app_id = ?
`);

function listAppsForUser(userId, options = {}) {
  const { projectId = null } = options;

  if (projectId) {
    getProjectOrThrow(userId, projectId);
    return selectAppsByProjectStatement.all(userId, projectId).map(mapApp);
  }

  return selectAppsByUserStatement.all(userId).map(mapApp);
}

function listAppsByProject(userId, projectId) {
  return listAppsForUser(userId, { projectId });
}

function listVersionsByProject(userId, projectId) {
  const project = getProjectOrThrow(userId, projectId);
  return selectVersionsByProjectStatement.all(userId, project.id).map(mapVersionRow);
}

function getAppOverview(userId, projectId) {
  const project = getProjectOrThrow(userId, projectId);
  const apps = listAppsByProject(userId, project.id);
  const totals = createEmptyVersionStatusSummary();

  const appSummaries = apps.map((app) => {
    const versions = listVersionsByApp(app.id);
    const summary = summarizeVersions(versions);

    totals.versionCount += summary.versionCount;
    totals.todoCount += summary.todoCount;
    totals.doingCount += summary.doingCount;
    totals.reviewCount += summary.reviewCount;
    totals.doneCount += summary.doneCount;

    return {
      ...app,
      ...summary,
      recentVersions: [...versions]
        .sort((left, right) => toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt))
        .slice(0, 3)
        .map((version) => ({
          id: version.id,
          versionName: version.versionName,
          buildNumber: version.buildNumber,
          resourceVersion: version.resourceVersion,
          channel: version.channel,
          status: version.status,
          priority: version.priority,
          createdAt: version.createdAt,
          updatedAt: version.updatedAt,
        })),
    };
  });

  return {
    project,
    totals: {
      ...totals,
      appCount: apps.length,
      activeAppCount: apps.filter((app) => !app.archived).length,
      archivedAppCount: apps.filter((app) => app.archived).length,
    },
    apps: appSummaries,
  };
}

function getBoardForApp(userId, projectId, appId) {
  const project = getProjectOrThrow(userId, projectId);
  const apps = listAppsByProject(userId, project.id);
  const selectedApp = resolveSelectedApp(apps, appId);

  if (!selectedApp) {
    return {
      project,
      apps,
      app: null,
      versions: [],
    };
  }

  return {
    project,
    apps,
    app: selectedApp,
    versions: listVersionsByApp(selectedApp.id),
  };
}

function createApp(userId, projectId, payload = {}) {
  const project = getProjectOrThrow(userId, projectId);
  const now = new Date().toISOString();
  const app = {
    id: createId(),
    userId,
    projectId: project.id,
    name: validateAppName(payload.name),
    description: normalizeText(payload.description, 600),
    color: normalizeColor(payload.color, "#245a73"),
    platform: normalizeEnum(
      payload.platform,
      VALID_APP_PLATFORMS,
      "ios",
      "INVALID_APP_PLATFORM"
    ),
    bundleId: normalizeText(payload.bundleId, 120),
    archived: normalizeBoolean(payload.archived),
    createdAt: now,
    updatedAt: now,
  };

  insertAppStatement.run(
    app.id,
    app.userId,
    app.projectId,
    app.name,
    app.description,
    app.color,
    app.platform,
    app.bundleId,
    app.archived ? 1 : 0,
    app.createdAt,
    app.updatedAt
  );

  touchProject(app.projectId, app.updatedAt);

  return getAppOrThrow(userId, app.id);
}

function updateApp(userId, appId, payload = {}) {
  const currentApp = getAppOrThrow(userId, appId);
  const nextProjectId =
    payload.projectId === undefined
      ? currentApp.projectId
      : getProjectOrThrow(userId, payload.projectId).id;

  const updatedApp = {
    ...currentApp,
    projectId: nextProjectId,
    name: payload.name === undefined ? currentApp.name : validateAppName(payload.name),
    description:
      payload.description === undefined
        ? currentApp.description
        : normalizeText(payload.description, 600),
    color:
      payload.color === undefined
        ? currentApp.color
        : normalizeColor(payload.color, currentApp.color),
    platform:
      payload.platform === undefined
        ? currentApp.platform
        : normalizeEnum(
            payload.platform,
            VALID_APP_PLATFORMS,
            currentApp.platform,
            "INVALID_APP_PLATFORM"
          ),
    bundleId:
      payload.bundleId === undefined
        ? currentApp.bundleId
        : normalizeText(payload.bundleId, 120),
    archived:
      payload.archived === undefined ? currentApp.archived : normalizeBoolean(payload.archived),
    updatedAt: new Date().toISOString(),
  };

  updateAppStatement.run(
    updatedApp.projectId,
    updatedApp.name,
    updatedApp.description,
    updatedApp.color,
    updatedApp.platform,
    updatedApp.bundleId,
    updatedApp.archived ? 1 : 0,
    updatedApp.updatedAt,
    appId,
    userId
  );

  if (currentApp.projectId !== updatedApp.projectId) {
    clearKioskActiveAppStatement.run(updatedApp.updatedAt, appId);
    touchProject(currentApp.projectId, updatedApp.updatedAt);
  }
  touchProject(updatedApp.projectId, updatedApp.updatedAt);

  return getAppOrThrow(userId, appId);
}

function deleteApp(userId, appId) {
  const currentApp = getAppOrThrow(userId, appId);
  const updatedAt = new Date().toISOString();
  clearKioskActiveAppStatement.run(updatedAt, appId);
  deleteAppStatement.run(appId, userId);
  touchProject(currentApp.projectId, updatedAt);
}

function deleteAppsByProject(userId, projectId) {
  getProjectOrThrow(userId, projectId);
  deleteAppsByProjectStatement.run(projectId, userId);
  touchProject(projectId);
}

function createVersion(userId, projectId, appId, payload = {}) {
  const app = getAppOrThrow(userId, appId);
  assertAppBelongsToProject(app, projectId);
  const normalizedVersion = normalizeVersionInput(app.id, payload);
  return persistVersionRecord(userId, app.id, normalizedVersion);
}

function updateVersion(userId, versionId, payload = {}) {
  const currentVersion = getVersionOrThrow(userId, versionId);
  const normalizedVersion = normalizeVersionInput(
    currentVersion.appId,
    {
      versionName:
        payload.versionName === undefined ? currentVersion.versionName : payload.versionName,
      buildNumber:
        payload.buildNumber === undefined ? currentVersion.buildNumber : payload.buildNumber,
      resourceVersion:
        payload.resourceVersion === undefined
          ? currentVersion.resourceVersion
          : payload.resourceVersion,
      description:
        payload.description === undefined ? currentVersion.description : payload.description,
      notes: payload.notes === undefined ? currentVersion.notes : payload.notes,
      owner: payload.owner === undefined ? currentVersion.owner : payload.owner,
      channel: payload.channel === undefined ? currentVersion.channel : payload.channel,
      status: payload.status === undefined ? currentVersion.status : payload.status,
      priority: payload.priority === undefined ? currentVersion.priority : payload.priority,
      plannedDate:
        payload.plannedDate === undefined ? currentVersion.plannedDate : payload.plannedDate,
      releaseDate:
        payload.releaseDate === undefined ? currentVersion.releaseDate : payload.releaseDate,
      publishedDate:
        payload.publishedDate === undefined
          ? currentVersion.publishedDate
          : payload.publishedDate,
    },
    {
      previousVersion: currentVersion,
    }
  );

  const updatedAt = new Date().toISOString();
  updateVersionStatement.run(
    normalizedVersion.versionName,
    normalizedVersion.buildNumber,
    normalizedVersion.resourceVersion,
    normalizedVersion.description,
    normalizedVersion.notes,
    normalizedVersion.owner,
    normalizedVersion.channel,
    normalizedVersion.status,
    normalizedVersion.priority,
    normalizedVersion.plannedDate,
    normalizedVersion.releaseDate,
    normalizedVersion.publishedDate,
    updatedAt,
    versionId
  );

  touchProject(currentVersion.projectId, updatedAt);

  return getVersionOrThrow(userId, versionId);
}

function bulkUpdateVersions(userId, projectId, appId, payload = {}) {
  const app = getAppOrThrow(userId, appId);
  assertAppBelongsToProject(app, projectId);

  const versionIds = normalizeBulkVersionIds(app.id, payload.versionIds);
  const nextStatus = normalizeEnum(
    payload.status,
    VALID_STATUSES,
    "todo",
    "INVALID_STATUS"
  );

  const updatedAt = new Date().toISOString();
  const versions = versionIds.map((versionId) => {
    const currentVersion = getVersionOrThrow(userId, versionId);
    const publishedDate = resolvePublishedDate({
      status: nextStatus,
      publishedDate: currentVersion.publishedDate,
      previousVersion: currentVersion,
    });

    updateVersionStatusStatement.run(nextStatus, publishedDate, updatedAt, versionId);
    return getVersionOrThrow(userId, versionId);
  });

  touchProject(app.projectId, updatedAt);

  return {
    updatedCount: versions.length,
    versions,
  };
}

function deleteVersion(userId, versionId) {
  const currentVersion = getVersionOrThrow(userId, versionId);
  const updatedAt = new Date().toISOString();
  clearKioskActiveVersionStatement.run(updatedAt, versionId);
  deleteVersionStatement.run(versionId);
  touchProject(currentVersion.projectId, updatedAt);
}

function exportApp(userId, projectId, appId) {
  const board = getBoardForApp(userId, projectId, appId);
  if (!board.app) {
    throw createHttpError(404, "APP_NOT_FOUND", "应用不存在");
  }

  return {
    source: "task-atlas",
    version: 4,
    scope: "app",
    exportedAt: new Date().toISOString(),
    project: {
      name: board.project.name,
      description: board.project.description,
      color: board.project.color,
      archived: board.project.archived,
    },
    ...buildAppExportEntry(board.app),
  };
}

function exportAppsByProject(userId, projectId) {
  const apps = listAppsByProject(userId, projectId);
  return apps.map((app) => buildAppExportEntry(app));
}

function importAppsIntoProject(userId, projectId, appPayloads = []) {
  getProjectOrThrow(userId, projectId);

  if (!Array.isArray(appPayloads)) {
    return [];
  }

  return appPayloads.map((appPayload) => importAppPayload(userId, projectId, appPayload));
}

function importAppData(userId, payload = {}) {
  if (!payload || typeof payload !== "object") {
    throw createHttpError(422, "INVALID_IMPORT", "导入数据格式无效");
  }

  return runTransaction(() => {
    if (payload.scope === "workspace" && Array.isArray(payload.projects)) {
      const importedApps = [];
      const importedProjects = [];

      payload.projects.forEach((projectPayload) => {
        const result = importProjectScopedApps(userId, projectPayload);
        if (result.project) {
          importedProjects.push(result.project);
        }
        importedApps.push(...result.importedApps);
      });

      return {
        importedProjects,
        importedApps,
        importedCount: importedApps.length,
      };
    }

    if ((payload.scope === "app" || (!payload.scope && payload.app)) && payload.app) {
      const standaloneProject = createStandaloneImportProject(userId, payload.project, payload);
      const importedApp = importAppPayload(userId, standaloneProject.id, payload);
      return {
        importedProjects: [standaloneProject],
        importedApps: [importedApp],
        importedCount: 1,
      };
    }

    if (
      (payload.scope === "project" ||
        (!payload.scope && payload.project && Array.isArray(payload.apps))) &&
      payload.project
    ) {
      const result = importProjectScopedApps(userId, payload);
      return {
        importedProjects: result.project ? [result.project] : [],
        importedApps: result.importedApps,
        importedCount: result.importedApps.length,
      };
    }

    if (payload.scope === "workspace" && Array.isArray(payload.apps)) {
      const standaloneProject = createStandaloneImportProject(userId, payload.project);
      const importedApps = importAppsIntoProject(userId, standaloneProject.id, payload.apps);
      return {
        importedProjects: [standaloneProject],
        importedApps,
        importedCount: importedApps.length,
      };
    }

    return {
      importedProjects: [],
      importedApps: [],
      importedCount: 0,
    };
  });
}

function importProjectScopedApps(userId, payload) {
  const apps = Array.isArray(payload.apps) ? payload.apps : [];
  const projectData = payload.project || payload;
  const project = createProjectRecord(userId, {
    name: projectData.name || inferProjectNameFromApps(apps),
    description: projectData.description || "",
    color: projectData.color || "#c16b39",
    archived: normalizeBoolean(projectData.archived),
  });

  return {
    project,
    importedApps: importAppsIntoProject(userId, project.id, apps),
  };
}

function importAppPayload(userId, projectId, payload) {
  const appData = payload.app || payload;
  const versions = Array.isArray(payload.versions) ? payload.versions : [];

  const createdApp = createApp(userId, projectId, {
    name: appData.name || "导入应用",
    description: appData.description || "",
    color: appData.color || "#245a73",
    platform: appData.platform || "ios",
    bundleId: appData.bundleId || "",
    archived: normalizeBoolean(appData.archived),
  });

  versions.forEach((item) => {
    persistVersionRecord(
      userId,
      createdApp.id,
      normalizeVersionInput(createdApp.id, {
        versionName: item.versionName,
        buildNumber: item.buildNumber,
        resourceVersion: item.resourceVersion,
        description: item.description,
        notes: item.notes,
        owner: item.owner,
        channel: item.channel,
        status: item.status,
        priority: item.priority,
        plannedDate: item.plannedDate,
        releaseDate: item.releaseDate,
        publishedDate: item.publishedDate,
      })
    );
  });

  return createdApp;
}

function listVersionsByApp(appId) {
  return selectVersionsByAppStatement.all(appId).map(mapVersionRow);
}

function buildAppExportEntry(app) {
  return {
    app: {
      name: app.name,
      description: app.description,
      color: app.color,
      platform: app.platform,
      bundleId: app.bundleId,
      archived: app.archived,
    },
    versions: listVersionsByApp(app.id).map((item) => ({
      versionName: item.versionName,
      buildNumber: item.buildNumber,
      resourceVersion: item.resourceVersion,
      description: item.description,
      notes: item.notes,
      owner: item.owner,
      channel: item.channel,
      status: item.status,
      priority: item.priority,
      plannedDate: item.plannedDate,
      releaseDate: item.releaseDate,
      publishedDate: item.publishedDate,
      position: item.position,
    })),
  };
}

function createProjectRecord(userId, payload = {}) {
  const now = new Date().toISOString();
  const project = {
    id: createId(),
    userId,
    name: validateProjectName(payload.name || "导入项目"),
    description: normalizeText(payload.description, 600),
    color: normalizeColor(payload.color, "#c16b39"),
    archived: normalizeBoolean(payload.archived),
    createdAt: now,
    updatedAt: now,
  };

  insertProjectStatement.run(
    project.id,
    project.userId,
    project.name,
    project.description,
    project.color,
    project.archived ? 1 : 0,
    project.createdAt,
    project.updatedAt
  );

  return getProjectOrThrow(userId, project.id);
}

function createStandaloneImportProject(userId, projectPayload = {}, appPayload = null) {
  const inferredAppName = appPayload?.app?.name || appPayload?.name || "";

  return createProjectRecord(userId, {
    name:
      projectPayload?.name ||
      (inferredAppName ? `${inferredAppName} 项目` : "导入应用项目"),
    description:
      projectPayload?.description || "自动承接独立 App 版本导入数据的项目。",
    color: projectPayload?.color || "#245a73",
    archived: normalizeBoolean(projectPayload?.archived),
  });
}

function inferProjectNameFromApps(apps) {
  const firstAppName = apps[0]?.app?.name || apps[0]?.name || "";
  return firstAppName ? `${String(firstAppName).trim()} 项目` : "导入应用项目";
}

function createEmptyVersionStatusSummary() {
  return {
    versionCount: 0,
    todoCount: 0,
    doingCount: 0,
    reviewCount: 0,
    doneCount: 0,
  };
}

function summarizeVersions(versions) {
  return versions.reduce((summary, version) => {
    summary.versionCount += 1;

    if (version.status === "todo") {
      summary.todoCount += 1;
    } else if (version.status === "doing") {
      summary.doingCount += 1;
    } else if (version.status === "review") {
      summary.reviewCount += 1;
    } else if (version.status === "done") {
      summary.doneCount += 1;
    }

    return summary;
  }, createEmptyVersionStatusSummary());
}

function getProjectOrThrow(userId, projectId) {
  const row = selectProjectByIdForUserStatement.get(projectId, userId);
  if (!row) {
    throw createHttpError(404, "PROJECT_NOT_FOUND", "项目不存在");
  }

  return mapProject(row);
}

function getAppOrThrow(userId, appId) {
  const row = selectAppByIdStatement.get(appId, userId);
  if (!row) {
    throw createHttpError(404, "APP_NOT_FOUND", "应用不存在");
  }

  return mapApp(row);
}

function getVersionOrThrow(userId, versionId) {
  const row = selectVersionByIdForUserStatement.get(versionId, userId);
  if (!row) {
    throw createHttpError(404, "APP_VERSION_NOT_FOUND", "版本记录不存在");
  }

  return mapVersionRow(row);
}

function assertAppBelongsToProject(app, projectId) {
  const normalizedProjectId = String(projectId || "");
  if (!normalizedProjectId || app.projectId !== normalizedProjectId) {
    throw createHttpError(404, "APP_NOT_FOUND", "应用不存在");
  }
}

function persistVersionRecord(userId, appId, normalizedVersion) {
  const now = new Date().toISOString();
  const app = getAppOrThrowFromAppId(appId);
  const position =
    Number(selectMaxPositionByAppStatement.get(appId)?.max_position || 0) + 1;
  const versionId = createId();

  insertVersionStatement.run(
    versionId,
    appId,
    normalizedVersion.versionName,
    normalizedVersion.buildNumber,
    normalizedVersion.resourceVersion,
    normalizedVersion.description,
    normalizedVersion.notes,
    normalizedVersion.owner,
    normalizedVersion.channel,
    normalizedVersion.status,
    normalizedVersion.priority,
    normalizedVersion.plannedDate,
    normalizedVersion.releaseDate,
    normalizedVersion.publishedDate,
    position,
    now,
    now
  );

  touchProject(app.projectId, now);

  return getVersionOrThrow(userId, versionId);
}

function normalizeVersionInput(appId, payload = {}, options = {}) {
  const { previousVersion = null } = options;

  getAppOrThrowFromAppId(appId);

  const status = normalizeEnum(payload.status, VALID_STATUSES, "todo", "INVALID_STATUS");
  const identity = normalizeVersionIdentity(payload);

  return {
    versionName: identity.versionName,
    buildNumber: identity.buildNumber,
    resourceVersion: identity.resourceVersion,
    description: normalizeText(payload.description, 1200),
    notes: normalizeText(payload.notes, 2000),
    owner: normalizeText(payload.owner, 80),
    channel: normalizeEnum(
      payload.channel,
      VALID_CHANNELS,
      "stable",
      "INVALID_RELEASE_CHANNEL"
    ),
    status,
    priority: normalizeEnum(
      payload.priority,
      VALID_PRIORITIES,
      "medium",
      "INVALID_PRIORITY"
    ),
    plannedDate: normalizeDateField(payload.plannedDate, "INVALID_PLANNED_DATE"),
    releaseDate: normalizeDateField(payload.releaseDate, "INVALID_RELEASE_DATE"),
    publishedDate: resolvePublishedDate({
      status,
      publishedDate: payload.publishedDate,
      previousVersion,
    }),
  };
}

function normalizeVersionIdentity(payload = {}) {
  const versionName = normalizeText(payload.versionName, 60);
  const buildNumber = normalizeText(payload.buildNumber, 60);
  const resourceVersion = normalizeText(payload.resourceVersion, 80);

  if (!versionName && !buildNumber && !resourceVersion) {
    throw createHttpError(
      422,
      "INVALID_VERSION_IDENTIFIER",
      "版本号、构建号、资源版本至少填写一项"
    );
  }

  return {
    versionName,
    buildNumber,
    resourceVersion,
  };
}

function getAppOrThrowFromAppId(appId) {
  const row = selectAppByIdAnyUserStatement.get(appId);
  if (!row) {
    throw createHttpError(404, "APP_NOT_FOUND", "应用不存在");
  }

  return mapApp(row);
}

function touchProject(projectId, timestamp = new Date().toISOString()) {
  if (!projectId) {
    return;
  }

  updateProjectTimestampStatement.run(timestamp, projectId);
}

function normalizeBulkVersionIds(appId, versionIds) {
  if (!Array.isArray(versionIds) || versionIds.length === 0) {
    throw createHttpError(422, "INVALID_VERSION_IDS", "至少选择一个版本记录");
  }

  const allowedVersionIds = new Set(listVersionsByApp(appId).map((item) => item.id));
  const uniqueVersionIds = [...new Set(versionIds.map((versionId) => String(versionId)))];

  uniqueVersionIds.forEach((versionId) => {
    if (!allowedVersionIds.has(versionId)) {
      throw createHttpError(422, "INVALID_VERSION_ID", "批量更新包含无效版本");
    }
  });

  return uniqueVersionIds;
}

function validateProjectName(value) {
  return normalizeText(value, 80, { required: true, errorCode: "INVALID_PROJECT_NAME" });
}

function validateAppName(value) {
  return normalizeText(value, 80, { required: true, errorCode: "INVALID_APP_NAME" });
}

function normalizeText(value, maxLength, options = {}) {
  const { required = false, errorCode = "INVALID_TEXT" } = options;
  const text = String(value || "").trim();

  if (required && !text) {
    throw createHttpError(422, errorCode, "必填字段不能为空");
  }

  if (text.length > maxLength) {
    throw createHttpError(422, errorCode, `字段长度不能超过 ${maxLength}`);
  }

  return text;
}

function normalizeColor(value, fallback) {
  const color = String(value || "").trim();
  if (!color) {
    return fallback;
  }

  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    throw createHttpError(422, "INVALID_COLOR", "颜色必须为 6 位十六进制值");
  }

  return color.toLowerCase();
}

function normalizeDateField(value, errorCode) {
  const dateValue = String(value || "").trim();
  if (!dateValue) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    throw createHttpError(422, errorCode, "日期格式错误");
  }

  return dateValue;
}

function resolvePublishedDate(options = {}) {
  const { status, publishedDate, previousVersion = null } = options;
  const normalizedPublishedDate = normalizeDateField(
    publishedDate,
    "INVALID_PUBLISHED_DATE"
  );

  if (status !== "done") {
    return "";
  }

  if (normalizedPublishedDate) {
    return normalizedPublishedDate;
  }

  if (previousVersion?.publishedDate) {
    return previousVersion.publishedDate;
  }

  if (!previousVersion || previousVersion.status !== "done") {
    return todayDateString();
  }

  return "";
}

function normalizeEnum(value, allowedValues, fallback, errorCode) {
  const normalizedValue = String(value || "").trim() || fallback;
  if (!allowedValues.has(normalizedValue)) {
    throw createHttpError(422, errorCode, "字段值无效");
  }

  return normalizedValue;
}

function normalizeBoolean(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function resolveSelectedApp(apps, appId) {
  if (!apps.length) {
    return null;
  }

  if (appId) {
    const matchedApp = apps.find((app) => app.id === appId);
    if (!matchedApp) {
      throw createHttpError(404, "APP_NOT_FOUND", "应用不存在");
    }
    return matchedApp;
  }

  return apps.find((app) => !app.archived) || apps[0];
}

function runTransaction(callback) {
  db.exec("BEGIN");
  try {
    const result = callback();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function mapProject(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    color: row.color,
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapApp(row) {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    color: row.color,
    platform: row.platform,
    bundleId: row.bundle_id,
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapVersionRow(row) {
  return {
    id: row.id,
    appId: row.app_id,
    projectId: row.project_id || "",
    versionName: row.version_name,
    buildNumber: row.build_number,
    resourceVersion: row.resource_version,
    description: row.description,
    notes: row.notes,
    owner: row.owner,
    channel: row.channel,
    status: row.status,
    priority: row.priority,
    plannedDate: row.planned_date,
    releaseDate: row.release_date,
    publishedDate: row.published_date,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createId() {
  return crypto.randomUUID();
}

function toTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function todayDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createHttpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

module.exports = {
  bulkUpdateVersions,
  createApp,
  createVersion,
  deleteApp,
  deleteAppsByProject,
  deleteVersion,
  exportApp,
  exportAppsByProject,
  getAppOverview,
  getBoardForApp,
  importAppData,
  importAppsIntoProject,
  listAppsByProject,
  listAppsForUser,
  listVersionsByProject,
  updateApp,
  updateVersion,
};
