const { databasePath } = require("../server/db");
const {
  createUser,
  resetUserPassword,
} = require("../server/services/auth-service");

const username = process.argv[2];
const password = process.env.TASK_ATLAS_ADMIN_PASSWORD;
const resetPassword = process.argv.includes("--reset");

if (!username || !password) {
  console.error(
    "Usage: TASK_ATLAS_ADMIN_PASSWORD=<password> npm run user:create -- <username>"
  );
  process.exitCode = 1;
} else {
  try {
    const user = resetPassword
      ? resetUserPassword({ username, password })
      : createUser({ username, password });
    console.log(`${resetPassword ? "Updated password for" : "Created"} user: ${user.username}`);
    console.log(`Database: ${databasePath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = error.code === "USERNAME_TAKEN" ? 2 : 1;
  }
}
