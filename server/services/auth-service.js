const crypto = require("node:crypto");

const { db } = require("../db");

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

const insertUserStatement = db.prepare(`
  INSERT INTO users (id, username, password_hash, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
`);

const selectUserByUsernameStatement = db.prepare(`
  SELECT id, username, password_hash, created_at, updated_at
  FROM users
  WHERE username = ?
`);

const insertSessionStatement = db.prepare(`
  INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

const insertProjectStatement = db.prepare(`
  INSERT INTO projects (id, user_id, name, description, color, archived, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const deleteSessionByHashStatement = db.prepare(`
  DELETE FROM sessions
  WHERE token_hash = ?
`);

const deleteExpiredSessionsStatement = db.prepare(`
  DELETE FROM sessions
  WHERE expires_at <= ?
`);

const selectSessionUserStatement = db.prepare(`
  SELECT
    sessions.id AS session_id,
    sessions.expires_at,
    users.id AS user_id,
    users.username,
    users.created_at,
    users.updated_at
  FROM sessions
  JOIN users ON users.id = sessions.user_id
  WHERE sessions.token_hash = ?
`);

function createUser({ username, password }) {
  const normalizedUsername = normalizeUsername(username);
  validateCredentials(normalizedUsername, password);

  const existingUser = selectUserByUsernameStatement.get(normalizedUsername);
  if (existingUser) {
    throw createHttpError(409, "USERNAME_TAKEN", "用户名已存在");
  }

  const now = new Date().toISOString();
  const user = {
    id: createId(),
    username: normalizedUsername,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  insertUserStatement.run(
    user.id,
    user.username,
    user.passwordHash,
    user.createdAt,
    user.updatedAt
  );

  insertProjectStatement.run(
    createId(),
    user.id,
    "默认项目",
    "注册后自动创建的初始项目。",
    "#c16b39",
    0,
    now,
    now
  );

  return sanitizeUser(user);
}

function loginUser({ username, password }) {
  const normalizedUsername = normalizeUsername(username);
  validateCredentials(normalizedUsername, password, { validatePasswordLength: false });

  const user = selectUserByUsernameStatement.get(normalizedUsername);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw createHttpError(401, "INVALID_CREDENTIALS", "用户名或密码错误");
  }

  return createSessionForUser({
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  });
}

function createSessionForUser(user) {
  pruneExpiredSessions();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const session = {
    id: createId(),
    userId: user.id,
    token,
    tokenHash,
    createdAt: now.toISOString(),
    expiresAt,
  };

  insertSessionStatement.run(
    session.id,
    session.userId,
    session.tokenHash,
    session.expiresAt,
    session.createdAt
  );

  return {
    user: sanitizeUser(user),
    session,
  };
}

function getSessionUser(token) {
  if (!token) {
    return null;
  }

  pruneExpiredSessions();

  const tokenHash = sha256(token);
  const row = selectSessionUserStatement.get(tokenHash);
  if (!row) {
    return null;
  }

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    deleteSessionByHashStatement.run(tokenHash);
    return null;
  }

  return {
    session: {
      id: row.session_id,
      expiresAt: row.expires_at,
    },
    user: {
      id: row.user_id,
      username: row.username,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  };
}

function logoutSession(token) {
  if (!token) {
    return;
  }

  deleteSessionByHashStatement.run(sha256(token));
}

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function validateCredentials(username, password, options = {}) {
  const { validatePasswordLength = true } = options;

  if (!/^[a-z0-9_-]{3,24}$/.test(username)) {
    throw createHttpError(
      422,
      "INVALID_USERNAME",
      "用户名需为 3-24 位，只能包含小写字母、数字、下划线和连字符"
    );
  }

  if (validatePasswordLength && String(password || "").length < 8) {
    throw createHttpError(422, "WEAK_PASSWORD", "密码长度至少 8 位");
  }

  if (!String(password || "").trim()) {
    throw createHttpError(422, "INVALID_PASSWORD", "密码不能为空");
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password, storedHash) {
  const [salt, digest] = String(storedHash || "").split(":");
  if (!salt || !digest) {
    return false;
  }

  const attempt = crypto.scryptSync(password, salt, 64);
  const target = Buffer.from(digest, "hex");

  if (attempt.length !== target.length) {
    return false;
  }

  return crypto.timingSafeEqual(attempt, target);
}

function pruneExpiredSessions() {
  deleteExpiredSessionsStatement.run(new Date().toISOString());
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function createId() {
  return crypto.randomUUID();
}

function createHttpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

module.exports = {
  createUser,
  loginUser,
  logoutSession,
  getSessionUser,
  SESSION_DURATION_MS,
};
