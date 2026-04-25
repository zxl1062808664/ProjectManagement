const express = require("express");

const { requireAuth } = require("../middleware/auth");
const {
  bulkUpdateVersions,
  createApp,
  createVersion,
  deleteApp,
  deleteVersion,
  exportApp,
  getAppOverview,
  getBoardForApp,
  importAppData,
  listAppsByProject,
  updateApp,
  updateVersion,
} = require("../services/app-version-service");

const router = express.Router();

router.use(requireAuth);

router.get("/projects/:projectId/apps", (req, res) => {
  res.json({
    apps: listAppsByProject(req.auth.user.id, req.params.projectId),
  });
});

router.get("/projects/:projectId/apps/overview", (req, res) => {
  res.json(getAppOverview(req.auth.user.id, req.params.projectId));
});

router.post("/apps/import/json", (req, res) => {
  const result = importAppData(req.auth.user.id, req.body || {});
  res.status(201).json(result);
});

router.post("/projects/:projectId/apps", (req, res) => {
  const app = createApp(req.auth.user.id, req.params.projectId, req.body || {});
  res.status(201).json({ app });
});

router.patch("/apps/:appId", (req, res) => {
  const app = updateApp(req.auth.user.id, req.params.appId, req.body || {});
  res.json({ app });
});

router.delete("/apps/:appId", (req, res) => {
  deleteApp(req.auth.user.id, req.params.appId);
  res.status(204).end();
});

router.get("/projects/:projectId/apps/:appId/board", (req, res) => {
  res.json(getBoardForApp(req.auth.user.id, req.params.projectId, req.params.appId));
});

router.post("/projects/:projectId/apps/:appId/versions", (req, res) => {
  const version = createVersion(
    req.auth.user.id,
    req.params.projectId,
    req.params.appId,
    req.body || {}
  );
  res.status(201).json({ version });
});

router.patch("/projects/:projectId/apps/:appId/versions", (req, res) => {
  const result = bulkUpdateVersions(
    req.auth.user.id,
    req.params.projectId,
    req.params.appId,
    req.body || {}
  );
  res.json(result);
});

router.get("/projects/:projectId/apps/:appId/export", (req, res) => {
  res.json(exportApp(req.auth.user.id, req.params.projectId, req.params.appId));
});

router.patch("/app-versions/:versionId", (req, res) => {
  const version = updateVersion(req.auth.user.id, req.params.versionId, req.body || {});
  res.json({ version });
});

router.delete("/app-versions/:versionId", (req, res) => {
  deleteVersion(req.auth.user.id, req.params.versionId);
  res.status(204).end();
});

module.exports = router;
