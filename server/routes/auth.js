const express = require("express");

const {
  loginUser,
  logoutSession,
  registerUser,
} = require("../services/auth-service");
const {
  clearSessionCookie,
  requireAuth,
  setSessionCookie,
} = require("../middleware/auth");

const router = express.Router();

router.post("/register", (req, res) => {
  const { user, session } = registerUser(req.body || {});
  setSessionCookie(res, session.token, session.expiresAt);

  res.status(201).json({
    authenticated: true,
    user,
    session: {
      expiresAt: session.expiresAt,
    },
  });
});

router.post("/login", (req, res) => {
  const { user, session } = loginUser(req.body || {});
  setSessionCookie(res, session.token, session.expiresAt);

  res.json({
    authenticated: true,
    user,
    session: {
      expiresAt: session.expiresAt,
    },
  });
});

router.post("/logout", (req, res) => {
  if (req.auth && req.auth.token) {
    logoutSession(req.auth.token);
  }

  clearSessionCookie(res);
  res.json({
    authenticated: false,
  });
});

router.get("/session", (req, res) => {
  if (!req.auth || !req.auth.user) {
    clearSessionCookie(res);
    res.json({
      authenticated: false,
      user: null,
    });
    return;
  }

  res.json({
    authenticated: true,
    user: req.auth.user,
    session: req.auth.session,
  });
});

router.get("/workspace", requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    message: "云端工作区认证已完成，可直接使用项目、任务、标签与导入导出 API。",
    user: req.auth.user,
    session: req.auth.session,
  });
});

module.exports = router;
