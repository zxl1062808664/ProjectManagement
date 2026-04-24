const express = require("express");

const appsRouter = require("./apps");
const authRouter = require("./auth");
const workspaceRouter = require("./workspace");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "task-atlas",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRouter);
router.use("/", workspaceRouter);
router.use("/", appsRouter);

module.exports = router;
