const crypto = require("node:crypto");

const { db } = require("../db");

const VALID_STATUSES = new Set(["todo", "doing", "review", "done"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high", "urgent"]);

const selectProjectsByUserStatement = db.prepare(`
  SELECT id, user_id, name, description, color, archived, created_at, updated_at
  FROM projects
  WHERE user_id = ?
  ORDER BY archived ASC, updated_at DESC, created_at DESC
`);

const selectProjectByIdStatement = db.prepare(`
  SELECT id, user_id, name, description, color, archived, created_at, updated_at
  FROM projects
  WHERE id = ? AND user_id = ?
`);

const insertProjectStatement = db.prepare(`
  INSERT INTO projects (id, user_id, name, description, color, archived, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateProjectStatement = db.prepare(`
  UPDATE projects
  SET name = ?, description = ?, color = ?, archived = ?, updated_at = ?
  WHERE id = ? AND user_id = ?
`);

const deleteProjectStatement = db.prepare(`
  DELETE FROM projects
  WHERE id = ? AND user_id = ?
`);

const selectTagsByProjectStatement = db.prepare(`
  SELECT id, project_id, name, color, created_at
  FROM tags
  WHERE project_id = ?
  ORDER BY created_at ASC
`);

const selectTagByIdForUserStatement = db.prepare(`
  SELECT tags.id, tags.project_id, tags.name, tags.color, tags.created_at
  FROM tags
  JOIN projects ON projects.id = tags.project_id
  WHERE tags.id = ? AND projects.user_id = ?
`);

const insertTagStatement = db.prepare(`
  INSERT INTO tags (id, project_id, name, color, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const updateTagStatement = db.prepare(`
  UPDATE tags
  SET name = ?, color = ?
  WHERE id = ?
`);

const deleteTagStatement = db.prepare(`
  DELETE FROM tags
  WHERE id = ?
`);

const selectTasksByProjectStatement = db.prepare(`
  SELECT
    id,
    project_id,
    title,
    description,
    notes,
    assignee,
    status,
    priority,
    start_date,
    due_date,
    completed_date,
    position,
    created_at,
    updated_at
  FROM tasks
  WHERE project_id = ?
  ORDER BY position ASC, created_at DESC
`);

const selectTaskByIdForUserStatement = db.prepare(`
  SELECT
    tasks.id,
    tasks.project_id,
    tasks.title,
    tasks.description,
    tasks.notes,
    tasks.assignee,
    tasks.status,
    tasks.priority,
    tasks.start_date,
    tasks.due_date,
    tasks.completed_date,
    tasks.position,
    tasks.created_at,
    tasks.updated_at
  FROM tasks
  JOIN projects ON projects.id = tasks.project_id
  WHERE tasks.id = ? AND projects.user_id = ?
`);

const insertTaskStatement = db.prepare(`
  INSERT INTO tasks (
    id,
    project_id,
    title,
    description,
    notes,
    assignee,
    status,
    priority,
    start_date,
    due_date,
    completed_date,
    position,
    created_at,
    updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateTaskStatement = db.prepare(`
  UPDATE tasks
  SET
    title = ?,
    description = ?,
    notes = ?,
    assignee = ?,
    status = ?,
    priority = ?,
    start_date = ?,
    due_date = ?,
    completed_date = ?,
    updated_at = ?
  WHERE id = ?
`);

const updateTaskStatusStatement = db.prepare(`
  UPDATE tasks
  SET status = ?, completed_date = ?, updated_at = ?
  WHERE id = ?
`);

const deleteTaskStatement = db.prepare(`
  DELETE FROM tasks
  WHERE id = ?
`);

const selectMaxPositionByProjectStatement = db.prepare(`
  SELECT COALESCE(MAX(position), 0) AS max_position
  FROM tasks
  WHERE project_id = ?
`);

const selectSubtasksByProjectStatement = db.prepare(`
  SELECT subtasks.id, subtasks.task_id, subtasks.title, subtasks.completed, subtasks.created_at, subtasks.updated_at
  FROM subtasks
  JOIN tasks ON tasks.id = subtasks.task_id
  WHERE tasks.project_id = ?
  ORDER BY subtasks.created_at ASC
`);

const selectSubtaskByIdForUserStatement = db.prepare(`
  SELECT
    subtasks.id,
    subtasks.task_id,
    subtasks.title,
    subtasks.completed,
    subtasks.created_at,
    subtasks.updated_at
  FROM subtasks
  JOIN tasks ON tasks.id = subtasks.task_id
  JOIN projects ON projects.id = tasks.project_id
  WHERE subtasks.id = ? AND projects.user_id = ?
`);

const insertSubtaskStatement = db.prepare(`
  INSERT INTO subtasks (id, task_id, title, completed, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const updateSubtaskStatement = db.prepare(`
  UPDATE subtasks
  SET title = ?, completed = ?, updated_at = ?
  WHERE id = ?
`);

const deleteSubtasksByTaskStatement = db.prepare(`
  DELETE FROM subtasks
  WHERE task_id = ?
`);

const deleteSubtaskStatement = db.prepare(`
  DELETE FROM subtasks
  WHERE id = ?
`);

const selectTaskTagLinksByProjectStatement = db.prepare(`
  SELECT task_tags.task_id, task_tags.tag_id
  FROM task_tags
  JOIN tasks ON tasks.id = task_tags.task_id
  WHERE tasks.project_id = ?
`);

const deleteTaskTagsByTaskStatement = db.prepare(`
  DELETE FROM task_tags
  WHERE task_id = ?
`);

const insertTaskTagStatement = db.prepare(`
  INSERT INTO task_tags (task_id, tag_id)
  VALUES (?, ?)
`);

const clearCompletedTasksByProjectStatement = db.prepare(`
  DELETE FROM tasks
  WHERE project_id = ? AND status = 'done'
`);

function listProjectsForUser(userId) {
  return selectProjectsByUserStatement.all(userId).map(mapProject);
}

function getWorkspaceOverview(userId) {
  const projects = listProjectsForUser(userId);
  const totals = createEmptyStatusSummary();

  const projectSummaries = projects.map((project) => {
    const tasks = listTasksByProject(project.id);
    const statusSummary = summarizeTasks(tasks);

    totals.taskCount += statusSummary.taskCount;
    totals.todoCount += statusSummary.todoCount;
    totals.doingCount += statusSummary.doingCount;
    totals.reviewCount += statusSummary.reviewCount;
    totals.doneCount += statusSummary.doneCount;

    return {
      ...project,
      ...statusSummary,
      recentTasks: [...tasks]
        .sort((left, right) => toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt))
        .slice(0, 3)
        .map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })),
    };
  });

  return {
    totals: {
      ...totals,
      projectCount: projects.length,
      activeProjectCount: projects.filter((project) => !project.archived).length,
      archivedProjectCount: projects.filter((project) => project.archived).length,
    },
    projects: projectSummaries,
  };
}

function getBoardForProject(userId, projectId) {
  const projects = listProjectsForUser(userId);
  const selectedProject = resolveSelectedProject(projects, projectId);

  if (!selectedProject) {
    return {
      projects,
      project: null,
      tags: [],
      tasks: [],
    };
  }

  return {
    projects,
    project: selectedProject,
    tags: listTagsByProject(selectedProject.id),
    tasks: listTasksByProject(selectedProject.id),
  };
}

function createProject(userId, payload = {}) {
  const now = new Date().toISOString();
  const project = {
    id: createId(),
    userId,
    name: validateProjectName(payload.name),
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

function updateProject(userId, projectId, payload = {}) {
  const currentProject = getProjectOrThrow(userId, projectId);
  const updatedProject = {
    ...currentProject,
    name:
      payload.name === undefined
        ? currentProject.name
        : validateProjectName(payload.name),
    description:
      payload.description === undefined
        ? currentProject.description
        : normalizeText(payload.description, 600),
    color:
      payload.color === undefined
        ? currentProject.color
        : normalizeColor(payload.color, currentProject.color),
    archived:
      payload.archived === undefined
        ? currentProject.archived
        : normalizeBoolean(payload.archived),
    updatedAt: new Date().toISOString(),
  };

  updateProjectStatement.run(
    updatedProject.name,
    updatedProject.description,
    updatedProject.color,
    updatedProject.archived ? 1 : 0,
    updatedProject.updatedAt,
    projectId,
    userId
  );

  return getProjectOrThrow(userId, projectId);
}

function deleteProject(userId, projectId) {
  getProjectOrThrow(userId, projectId);
  deleteProjectStatement.run(projectId, userId);
}

function createTag(userId, projectId, payload = {}) {
  getProjectOrThrow(userId, projectId);

  const tag = {
    id: createId(),
    projectId,
    name: validateTagName(payload.name),
    color: normalizeColor(payload.color, "#245a73"),
    createdAt: new Date().toISOString(),
  };

  assertTagNameUnique(projectId, tag.name);
  insertTagStatement.run(tag.id, tag.projectId, tag.name, tag.color, tag.createdAt);

  return getTagOrThrow(userId, tag.id);
}

function updateTag(userId, tagId, payload = {}) {
  const currentTag = getTagOrThrow(userId, tagId);
  const updatedTag = {
    ...currentTag,
    name:
      payload.name === undefined ? currentTag.name : validateTagName(payload.name),
    color:
      payload.color === undefined
        ? currentTag.color
        : normalizeColor(payload.color, currentTag.color),
  };

  if (updatedTag.name.toLowerCase() !== currentTag.name.toLowerCase()) {
    assertTagNameUnique(currentTag.projectId, updatedTag.name);
  }

  updateTagStatement.run(updatedTag.name, updatedTag.color, tagId);
  return getTagOrThrow(userId, tagId);
}

function deleteTag(userId, tagId) {
  getTagOrThrow(userId, tagId);
  deleteTagStatement.run(tagId);
}

function createTask(userId, projectId, payload = {}) {
  const project = getProjectOrThrow(userId, projectId);
  const normalizedTask = normalizeTaskInput(project.id, payload);

  return runTransaction(() => persistTaskRecord(userId, project.id, normalizedTask));
}

function updateTask(userId, taskId, payload = {}) {
  const currentTask = getTaskOrThrow(userId, taskId);

  const mergedInput = {
    title: payload.title === undefined ? currentTask.title : payload.title,
    description:
      payload.description === undefined
        ? currentTask.description
        : payload.description,
    notes: payload.notes === undefined ? currentTask.notes : payload.notes,
    assignee: payload.assignee === undefined ? currentTask.assignee : payload.assignee,
    status: payload.status === undefined ? currentTask.status : payload.status,
    priority:
      payload.priority === undefined ? currentTask.priority : payload.priority,
    startDate:
      payload.startDate === undefined ? currentTask.startDate : payload.startDate,
    dueDate: payload.dueDate === undefined ? currentTask.dueDate : payload.dueDate,
    completedDate:
      payload.completedDate === undefined
        ? currentTask.completedDate
        : payload.completedDate,
    tagIds: payload.tagIds === undefined ? currentTask.tagIds : payload.tagIds,
    subtasks:
      payload.subtasks === undefined
        ? currentTask.subtasks.map((subtask) => ({
            title: subtask.title,
            completed: subtask.completed,
          }))
        : payload.subtasks,
  };

  const normalizedTask = normalizeTaskInput(currentTask.projectId, mergedInput, {
    previousTask: currentTask,
  });

  return runTransaction(() => {
    const updatedAt = new Date().toISOString();

    updateTaskStatement.run(
      normalizedTask.title,
      normalizedTask.description,
      normalizedTask.notes,
      normalizedTask.assignee,
      normalizedTask.status,
      normalizedTask.priority,
      normalizedTask.startDate,
      normalizedTask.dueDate,
      normalizedTask.completedDate,
      updatedAt,
      taskId
    );

    replaceTaskTags(taskId, normalizedTask.tagIds);
    replaceSubtasks(taskId, normalizedTask.subtasks, updatedAt);

    return getTaskOrThrow(userId, taskId);
  });
}

function bulkUpdateTasks(userId, projectId, payload = {}) {
  getProjectOrThrow(userId, projectId);

  const taskIds = normalizeBulkTaskIds(projectId, payload.taskIds);
  const nextStatus = normalizeEnum(
    payload.status,
    VALID_STATUSES,
    "todo",
    "INVALID_STATUS"
  );

  return runTransaction(() => {
    const updatedAt = new Date().toISOString();
    const tasks = taskIds.map((taskId) => {
      const currentTask = getTaskOrThrow(userId, taskId);
      const completedDate = resolveCompletedDate({
        status: nextStatus,
        completedDate: currentTask.completedDate,
        previousTask: currentTask,
      });

      updateTaskStatusStatement.run(nextStatus, completedDate, updatedAt, taskId);
      return getTaskOrThrow(userId, taskId);
    });

    return {
      updatedCount: tasks.length,
      tasks,
    };
  });
}

function deleteTask(userId, taskId) {
  getTaskOrThrow(userId, taskId);
  deleteTaskStatement.run(taskId);
}

function clearCompletedTasks(userId, projectId) {
  getProjectOrThrow(userId, projectId);
  const beforeCount = listTasksByProject(projectId).filter((task) => task.status === "done")
    .length;
  clearCompletedTasksByProjectStatement.run(projectId);
  return beforeCount;
}

function updateSubtask(userId, subtaskId, payload = {}) {
  const currentSubtask = getSubtaskOrThrow(userId, subtaskId);
  const nextTitle =
    payload.title === undefined
      ? currentSubtask.title
      : normalizeText(payload.title, 120, { required: true });
  const nextCompleted =
    payload.completed === undefined
      ? currentSubtask.completed
      : normalizeBoolean(payload.completed);
  const updatedAt = new Date().toISOString();

  updateSubtaskStatement.run(
    nextTitle,
    nextCompleted ? 1 : 0,
    updatedAt,
    subtaskId
  );

  return getSubtaskOrThrow(userId, subtaskId);
}

function exportProject(userId, projectId) {
  const board = getBoardForProject(userId, projectId);
  if (!board.project) {
    throw createHttpError(404, "PROJECT_NOT_FOUND", "项目不存在");
  }

  const tagMap = new Map(board.tags.map((tag) => [tag.id, tag]));

  return {
    source: "task-atlas",
    version: 2,
    scope: "project",
    exportedAt: new Date().toISOString(),
    project: {
      name: board.project.name,
      description: board.project.description,
      color: board.project.color,
      archived: board.project.archived,
    },
    tags: board.tags.map((tag) => ({
      name: tag.name,
      color: tag.color,
    })),
    tasks: board.tasks.map((task) => ({
      title: task.title,
      description: task.description,
      notes: task.notes,
      assignee: task.assignee,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate,
      dueDate: task.dueDate,
      completedDate: task.completedDate,
      position: task.position,
      tagNames: task.tagIds
        .map((tagId) => tagMap.get(tagId))
        .filter(Boolean)
        .map((tag) => tag.name),
      subtasks: task.subtasks.map((subtask) => ({
        title: subtask.title,
        completed: subtask.completed,
      })),
    })),
  };
}

function importData(userId, payload = {}) {
  if (!payload || typeof payload !== "object") {
    throw createHttpError(422, "INVALID_IMPORT", "导入数据格式无效");
  }

  return runTransaction(() => {
    if (payload.scope === "workspace" && Array.isArray(payload.projects)) {
      const importedProjects = payload.projects.map((projectPayload) =>
        importProjectPayload(userId, projectPayload)
      );

      return {
        importedProjects,
        importedCount: importedProjects.length,
      };
    }

    if ((payload.scope === "project" || payload.project) && payload.project) {
      const importedProject = importProjectPayload(userId, payload);
      return {
        importedProjects: [importedProject],
        importedCount: 1,
      };
    }

    throw createHttpError(422, "INVALID_IMPORT", "暂不支持当前 JSON 结构");
  });
}

function importProjectPayload(userId, payload) {
  const projectData = payload.project || payload;
  const tags = Array.isArray(payload.tags) ? payload.tags : [];
  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];

  const createdProject = createProject(userId, {
    name: projectData.name || "导入项目",
    description: projectData.description || "",
    color: projectData.color || "#c16b39",
    archived: normalizeBoolean(projectData.archived),
  });

  const tagIdByName = new Map();
  tags.forEach((tag) => {
    const createdTag = createTag(userId, createdProject.id, tag);
    tagIdByName.set(createdTag.name, createdTag.id);
  });

  tasks.forEach((task) => {
    const mappedTagIds = Array.isArray(task.tagNames)
      ? task.tagNames.map((tagName) => tagIdByName.get(String(tagName))).filter(Boolean)
      : [];

    persistTaskRecord(
      userId,
      createdProject.id,
      normalizeTaskInput(createdProject.id, {
        title: task.title,
        description: task.description,
        notes: task.notes,
        assignee: task.assignee,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        completedDate: task.completedDate,
        tagIds: mappedTagIds,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      })
    );
  });

  return createdProject;
}

function listTagsByProject(projectId) {
  return selectTagsByProjectStatement.all(projectId).map(mapTag);
}

function listTasksByProject(projectId) {
  const tasks = selectTasksByProjectStatement.all(projectId).map(mapTaskRow);
  const tags = selectTaskTagLinksByProjectStatement.all(projectId);
  const subtasks = selectSubtasksByProjectStatement.all(projectId).map(mapSubtask);

  const tagIdsByTaskId = new Map();
  tags.forEach((link) => {
    const collection = tagIdsByTaskId.get(link.task_id) || [];
    collection.push(link.tag_id);
    tagIdsByTaskId.set(link.task_id, collection);
  });

  const subtasksByTaskId = new Map();
  subtasks.forEach((subtask) => {
    const collection = subtasksByTaskId.get(subtask.taskId) || [];
    collection.push(subtask);
    subtasksByTaskId.set(subtask.taskId, collection);
  });

  return tasks.map((task) => ({
    ...task,
    tagIds: tagIdsByTaskId.get(task.id) || [],
    subtasks: subtasksByTaskId.get(task.id) || [],
  }));
}

function createEmptyStatusSummary() {
  return {
    taskCount: 0,
    todoCount: 0,
    doingCount: 0,
    reviewCount: 0,
    doneCount: 0,
  };
}

function summarizeTasks(tasks) {
  return tasks.reduce((summary, task) => {
    summary.taskCount += 1;

    if (task.status === "todo") {
      summary.todoCount += 1;
    } else if (task.status === "doing") {
      summary.doingCount += 1;
    } else if (task.status === "review") {
      summary.reviewCount += 1;
    } else if (task.status === "done") {
      summary.doneCount += 1;
    }

    return summary;
  }, createEmptyStatusSummary());
}

function getProjectOrThrow(userId, projectId) {
  const row = selectProjectByIdStatement.get(projectId, userId);
  if (!row) {
    throw createHttpError(404, "PROJECT_NOT_FOUND", "项目不存在");
  }

  return mapProject(row);
}

function getTaskOrThrow(userId, taskId) {
  const row = selectTaskByIdForUserStatement.get(taskId, userId);
  if (!row) {
    throw createHttpError(404, "TASK_NOT_FOUND", "任务不存在");
  }

  const task = mapTaskRow(row);
  task.tagIds = listTaskTagIds(task.id);
  task.subtasks = listSubtasksByTask(task.id);
  return task;
}

function getTagOrThrow(userId, tagId) {
  const row = selectTagByIdForUserStatement.get(tagId, userId);
  if (!row) {
    throw createHttpError(404, "TAG_NOT_FOUND", "标签不存在");
  }

  return mapTag(row);
}

function getSubtaskOrThrow(userId, subtaskId) {
  const row = selectSubtaskByIdForUserStatement.get(subtaskId, userId);
  if (!row) {
    throw createHttpError(404, "SUBTASK_NOT_FOUND", "子任务不存在");
  }

  return mapSubtask(row);
}

function listTaskTagIds(taskId) {
  const statement = db.prepare(`
    SELECT tag_id
    FROM task_tags
    WHERE task_id = ?
  `);

  return statement.all(taskId).map((row) => row.tag_id);
}

function listSubtasksByTask(taskId) {
  const statement = db.prepare(`
    SELECT id, task_id, title, completed, created_at, updated_at
    FROM subtasks
    WHERE task_id = ?
    ORDER BY created_at ASC
  `);

  return statement.all(taskId).map(mapSubtask);
}

function replaceTaskTags(taskId, tagIds) {
  deleteTaskTagsByTaskStatement.run(taskId);
  tagIds.forEach((tagId) => {
    insertTaskTagStatement.run(taskId, tagId);
  });
}

function replaceSubtasks(taskId, subtasks, timestamp) {
  deleteSubtasksByTaskStatement.run(taskId);
  subtasks.forEach((subtask) => {
    insertSubtaskStatement.run(
      createId(),
      taskId,
      subtask.title,
      subtask.completed ? 1 : 0,
      timestamp,
      timestamp
    );
  });
}

function persistTaskRecord(userId, projectId, normalizedTask) {
  const now = new Date().toISOString();
  const position =
    Number(selectMaxPositionByProjectStatement.get(projectId)?.max_position || 0) + 1;
  const taskId = createId();

  insertTaskStatement.run(
    taskId,
    projectId,
    normalizedTask.title,
    normalizedTask.description,
    normalizedTask.notes,
    normalizedTask.assignee,
    normalizedTask.status,
    normalizedTask.priority,
    normalizedTask.startDate,
    normalizedTask.dueDate,
    normalizedTask.completedDate,
    position,
    now,
    now
  );

  replaceTaskTags(taskId, normalizedTask.tagIds);
  replaceSubtasks(taskId, normalizedTask.subtasks, now);

  return getTaskOrThrow(userId, taskId);
}

function normalizeTaskInput(projectId, payload = {}, options = {}) {
  const { previousTask = null } = options;
  const tagIds = normalizeTagIds(projectId, payload.tagIds);
  const subtasks = normalizeSubtasks(payload.subtasks);
  const status = normalizeEnum(payload.status, VALID_STATUSES, "todo", "INVALID_STATUS");

  return {
    title: normalizeText(payload.title, 120, { required: true }),
    description: normalizeText(payload.description, 1200),
    notes: normalizeText(payload.notes, 2000),
    assignee: normalizeText(payload.assignee, 80),
    status,
    priority: normalizeEnum(
      payload.priority,
      VALID_PRIORITIES,
      "medium",
      "INVALID_PRIORITY"
    ),
    startDate: normalizeDateField(payload.startDate, "INVALID_START_DATE"),
    dueDate: normalizeDueDate(payload.dueDate),
    completedDate: resolveCompletedDate({
      status,
      completedDate: payload.completedDate,
      previousTask,
    }),
    tagIds,
    subtasks,
  };
}

function normalizeTagIds(projectId, tagIds) {
  if (tagIds === undefined) {
    return [];
  }

  if (!Array.isArray(tagIds)) {
    throw createHttpError(422, "INVALID_TAGS", "标签格式错误");
  }

  const allowedIds = new Set(listTagsByProject(projectId).map((tag) => tag.id));
  const uniqueTagIds = [...new Set(tagIds.map((tagId) => String(tagId)))];

  uniqueTagIds.forEach((tagId) => {
    if (!allowedIds.has(tagId)) {
      throw createHttpError(422, "INVALID_TAG", "任务包含无效标签");
    }
  });

  return uniqueTagIds;
}

function normalizeSubtasks(subtasks) {
  if (subtasks === undefined) {
    return [];
  }

  if (!Array.isArray(subtasks)) {
    throw createHttpError(422, "INVALID_SUBTASKS", "子任务格式错误");
  }

  return subtasks
    .map((subtask) => ({
      title: normalizeText(subtask?.title, 120, { required: true }),
      completed: normalizeBoolean(subtask?.completed),
    }))
    .filter((subtask) => subtask.title);
}

function normalizeBulkTaskIds(projectId, taskIds) {
  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw createHttpError(422, "INVALID_TASK_IDS", "至少选择一个任务");
  }

  const allowedTaskIds = new Set(listTasksByProject(projectId).map((task) => task.id));
  const uniqueTaskIds = [...new Set(taskIds.map((taskId) => String(taskId)))];

  uniqueTaskIds.forEach((taskId) => {
    if (!allowedTaskIds.has(taskId)) {
      throw createHttpError(422, "INVALID_TASK_ID", "批量更新包含无效任务");
    }
  });

  return uniqueTaskIds;
}

function validateProjectName(value) {
  return normalizeText(value, 80, { required: true, errorCode: "INVALID_PROJECT_NAME" });
}

function validateTagName(value) {
  return normalizeText(value, 40, { required: true, errorCode: "INVALID_TAG_NAME" });
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

function normalizeDueDate(value) {
  const dueDate = String(value || "").trim();
  if (!dueDate) {
    return "";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw createHttpError(422, "INVALID_DUE_DATE", "截止日期格式错误");
  }

  return dueDate;
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

function resolveCompletedDate(options = {}) {
  const { status, completedDate, previousTask = null } = options;
  const normalizedCompletedDate = normalizeDateField(
    completedDate,
    "INVALID_COMPLETED_DATE"
  );

  if (status !== "done") {
    return "";
  }

  if (normalizedCompletedDate) {
    return normalizedCompletedDate;
  }

  if (previousTask?.completedDate) {
    return previousTask.completedDate;
  }

  if (!previousTask || previousTask.status !== "done") {
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

function assertTagNameUnique(projectId, tagName) {
  const existingTag = listTagsByProject(projectId).find(
    (tag) => tag.name.toLowerCase() === String(tagName).toLowerCase()
  );

  if (existingTag) {
    throw createHttpError(409, "TAG_EXISTS", "同一项目下标签名不能重复");
  }
}

function resolveSelectedProject(projects, projectId) {
  if (!projects.length) {
    return null;
  }

  if (projectId) {
    const matchedProject = projects.find((project) => project.id === projectId);
    if (!matchedProject) {
      throw createHttpError(404, "PROJECT_NOT_FOUND", "项目不存在");
    }
    return matchedProject;
  }

  return projects.find((project) => !project.archived) || projects[0];
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

function mapTag(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  };
}

function mapTaskRow(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    notes: row.notes,
    assignee: row.assignee,
    status: row.status,
    priority: row.priority,
    startDate: row.start_date,
    dueDate: row.due_date,
    completedDate: row.completed_date,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapSubtask(row) {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    completed: Boolean(row.completed),
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
  bulkUpdateTasks,
  clearCompletedTasks,
  createProject,
  createTag,
  createTask,
  deleteProject,
  deleteTag,
  deleteTask,
  exportProject,
  getBoardForProject,
  getWorkspaceOverview,
  importData,
  listProjectsForUser,
  updateProject,
  updateSubtask,
  updateTag,
  updateTask,
};
