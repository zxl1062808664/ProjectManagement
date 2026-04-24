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

const selectAppsByUserStatement = db.prepare(`
  SELECT
    id,
    user_id,
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

const selectAppByIdStatement = db.prepare(`
  SELECT
    id,
    user_id,
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

const insertAppStatement = db.prepare(`
  INSERT INTO apps (
    id,
    user_id,
    name,
    description,
    color,
    platform,
    bundle_id,
    archived,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateAppStatement = db.prepare(`
  UPDATE apps
  SET
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

const selectVersionsByAppStatement = db.prepare(`
  SELECT
    id,
    app_id,
    version_name,
    build_number,
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

const selectVersionByIdForUserStatement = db.prepare(`
  SELECT
    app_versions.id,
    app_versions.app_id,
    app_versions.version_name,
    app_versions.build_number,
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
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateVersionStatement = db.prepare(`
  UPDATE app_versions
  SET
    version_name = ?,
    build_number = ?,
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

const selectMaxPositionByAppStatement = db.prepare(`
  SELECT COALESCE(MAX(position), 0) AS max_position
  FROM app_versions
  WHERE app_id = ?
`);

function listAppsForUser(userId) {
  return selectAppsByUserStatement.all(userId).map(mapApp);
}

function getAppOverview(userId) {
  const apps = listAppsForUser(userId);
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
          channel: version.channel,
          status: version.status,
          priority: version.priority,
          createdAt: version.createdAt,
          updatedAt: version.updatedAt,
        })),
    };
  });

  return {
    totals: {
      ...totals,
      appCount: apps.length,
      activeAppCount: apps.filter((app) => !app.archived).length,
      archivedAppCount: apps.filter((app) => app.archived).length,
    },
    apps: appSummaries,
  };
}

function getBoardForApp(userId, appId) {
  const apps = listAppsForUser(userId);
  const selectedApp = resolveSelectedApp(apps, appId);

  if (!selectedApp) {
    return {
      apps,
      app: null,
      versions: [],
    };
  }

  return {
    apps,
    app: selectedApp,
    versions: listVersionsByApp(selectedApp.id),
  };
}

function createApp(userId, payload = {}) {
  const now = new Date().toISOString();
  const app = {
    id: createId(),
    userId,
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
    app.name,
    app.description,
    app.color,
    app.platform,
    app.bundleId,
    app.archived ? 1 : 0,
    app.createdAt,
    app.updatedAt
  );

  return getAppOrThrow(userId, app.id);
}

function updateApp(userId, appId, payload = {}) {
  const currentApp = getAppOrThrow(userId, appId);
  const updatedApp = {
    ...currentApp,
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

  return getAppOrThrow(userId, appId);
}

function deleteApp(userId, appId) {
  getAppOrThrow(userId, appId);
  deleteAppStatement.run(appId, userId);
}

function createVersion(userId, appId, payload = {}) {
  const app = getAppOrThrow(userId, appId);
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

  return getVersionOrThrow(userId, versionId);
}

function bulkUpdateVersions(userId, appId, payload = {}) {
  getAppOrThrow(userId, appId);

  const versionIds = normalizeBulkVersionIds(appId, payload.versionIds);
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

  return {
    updatedCount: versions.length,
    versions,
  };
}

function deleteVersion(userId, versionId) {
  getVersionOrThrow(userId, versionId);
  deleteVersionStatement.run(versionId);
}

function exportApp(userId, appId) {
  const board = getBoardForApp(userId, appId);
  if (!board.app) {
    throw createHttpError(404, "APP_NOT_FOUND", "应用不存在");
  }

  return {
    source: "task-atlas",
    version: 3,
    scope: "app",
    exportedAt: new Date().toISOString(),
    app: {
      name: board.app.name,
      description: board.app.description,
      color: board.app.color,
      platform: board.app.platform,
      bundleId: board.app.bundleId,
      archived: board.app.archived,
    },
    versions: board.versions.map((item) => ({
      versionName: item.versionName,
      buildNumber: item.buildNumber,
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

function importAppData(userId, payload = {}) {
  if (!payload || typeof payload !== "object") {
    throw createHttpError(422, "INVALID_IMPORT", "导入数据格式无效");
  }

  return runTransaction(() => {
    if (payload.scope === "workspace") {
      const appPayloads = Array.isArray(payload.apps) ? payload.apps : [];
      const importedApps = appPayloads.map((appPayload) => importAppPayload(userId, appPayload));

      return {
        importedApps,
        importedCount: importedApps.length,
      };
    }

    if ((payload.scope === "app" || payload.app) && payload.app) {
      const importedApp = importAppPayload(userId, payload);
      return {
        importedApps: [importedApp],
        importedCount: 1,
      };
    }

    return {
      importedApps: [],
      importedCount: 0,
    };
  });
}

function importAppPayload(userId, payload) {
  const appData = payload.app || payload;
  const versions = Array.isArray(payload.versions) ? payload.versions : [];

  const createdApp = createApp(userId, {
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

function persistVersionRecord(userId, appId, normalizedVersion) {
  const now = new Date().toISOString();
  const position =
    Number(selectMaxPositionByAppStatement.get(appId)?.max_position || 0) + 1;
  const versionId = createId();

  insertVersionStatement.run(
    versionId,
    appId,
    normalizedVersion.versionName,
    normalizedVersion.buildNumber,
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

  return getVersionOrThrow(userId, versionId);
}

function normalizeVersionInput(appId, payload = {}, options = {}) {
  const { previousVersion = null } = options;

  getAppOrThrowFromAppId(appId);

  const status = normalizeEnum(payload.status, VALID_STATUSES, "todo", "INVALID_STATUS");

  return {
    versionName: normalizeText(payload.versionName, 60, {
      required: true,
      errorCode: "INVALID_VERSION_NAME",
    }),
    buildNumber: normalizeText(payload.buildNumber, 60),
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

function getAppOrThrowFromAppId(appId) {
  const statement = db.prepare(`
    SELECT id
    FROM apps
    WHERE id = ?
  `);
  const row = statement.get(appId);
  if (!row) {
    throw createHttpError(404, "APP_NOT_FOUND", "应用不存在");
  }
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

function mapApp(row) {
  return {
    id: row.id,
    userId: row.user_id,
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
    versionName: row.version_name,
    buildNumber: row.build_number,
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
  deleteVersion,
  exportApp,
  getAppOverview,
  getBoardForApp,
  importAppData,
  listAppsForUser,
  updateApp,
  updateVersion,
};
