const express = require("express");

const { requireAuth } = require("../middleware/auth");
const {
  bulkUpdateTasks,
  clearCompletedTasks,
  createKiosk,
  createProject,
  createTag,
  createTask,
  deleteKiosk,
  deleteProject,
  deleteTag,
  deleteTask,
  exportProject,
  getBoardForProject,
  getWorkspaceOverview,
  importData,
  listProjectsForUser,
  updateKiosk,
  updateProject,
  updateSubtask,
  updateTag,
  updateTask,
} = require("../services/workspace-service");

const router = express.Router();

router.use(requireAuth);

router.get("/projects", (req, res) => {
  res.json({
    projects: listProjectsForUser(req.auth.user.id),
  });
});

router.get("/projects/overview", (req, res) => {
  res.json(getWorkspaceOverview(req.auth.user.id));
});

router.post("/projects", (req, res) => {
  const project = createProject(req.auth.user.id, req.body || {});
  res.status(201).json({ project });
});

router.patch("/projects/:projectId", (req, res) => {
  const project = updateProject(req.auth.user.id, req.params.projectId, req.body || {});
  res.json({ project });
});

router.delete("/projects/:projectId", (req, res) => {
  deleteProject(req.auth.user.id, req.params.projectId);
  res.status(204).end();
});

router.get("/projects/:projectId/board", (req, res) => {
  res.json(getBoardForProject(req.auth.user.id, req.params.projectId));
});

router.post("/projects/:projectId/tasks", (req, res) => {
  const task = createTask(req.auth.user.id, req.params.projectId, req.body || {});
  res.status(201).json({ task });
});

router.patch("/projects/:projectId/tasks", (req, res) => {
  const result = bulkUpdateTasks(req.auth.user.id, req.params.projectId, req.body || {});
  res.json(result);
});

router.delete("/projects/:projectId/tasks/completed", (req, res) => {
  const deletedCount = clearCompletedTasks(req.auth.user.id, req.params.projectId);
  res.json({ deletedCount });
});

router.post("/projects/:projectId/tags", (req, res) => {
  const tag = createTag(req.auth.user.id, req.params.projectId, req.body || {});
  res.status(201).json({ tag });
});

router.post("/projects/:projectId/kiosks", (req, res) => {
  const kiosk = createKiosk(req.auth.user.id, req.params.projectId, req.body || {});
  res.status(201).json({ kiosk });
});

router.get("/projects/:projectId/export", (req, res) => {
  res.json(exportProject(req.auth.user.id, req.params.projectId));
});

router.patch("/tasks/:taskId", (req, res) => {
  const task = updateTask(req.auth.user.id, req.params.taskId, req.body || {});
  res.json({ task });
});

router.delete("/tasks/:taskId", (req, res) => {
  deleteTask(req.auth.user.id, req.params.taskId);
  res.status(204).end();
});

router.patch("/subtasks/:subtaskId", (req, res) => {
  const subtask = updateSubtask(req.auth.user.id, req.params.subtaskId, req.body || {});
  res.json({ subtask });
});

router.patch("/tags/:tagId", (req, res) => {
  const tag = updateTag(req.auth.user.id, req.params.tagId, req.body || {});
  res.json({ tag });
});

router.delete("/tags/:tagId", (req, res) => {
  deleteTag(req.auth.user.id, req.params.tagId);
  res.status(204).end();
});

router.patch("/kiosks/:kioskId", (req, res) => {
  const kiosk = updateKiosk(req.auth.user.id, req.params.kioskId, req.body || {});
  res.json({ kiosk });
});

router.delete("/kiosks/:kioskId", (req, res) => {
  deleteKiosk(req.auth.user.id, req.params.kioskId);
  res.status(204).end();
});

router.post("/import/json", (req, res) => {
  const result = importData(req.auth.user.id, req.body || {});
  res.status(201).json(result);
});

module.exports = router;
