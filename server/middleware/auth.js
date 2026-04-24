const { getSessionUser } = require("../services/auth-service");

const SESSION_COOKIE_NAME = "task_atlas_session";

function attachSession(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE_NAME];
  const sessionData = token ? getSessionUser(token) : null;

  req.auth = {
    token,
    session: sessionData ? sessionData.session : null,
    user: sessionData ? sessionData.user : null,
  };

  next();
}

function requireAuth(req, res, next) {
  if (!req.auth || !req.auth.user) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "请先登录后再访问云端工作区",
      },
    });
    return;
  }

  next();
}

function setSessionCookie(res, token, expiresAt) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: new Date(expiresAt),
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((accumulator, item) => {
      const separatorIndex = item.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

module.exports = {
  attachSession,
  clearSessionCookie,
  requireAuth,
  setSessionCookie,
  SESSION_COOKIE_NAME,
};
