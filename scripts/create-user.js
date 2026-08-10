const { databasePath } = require("../server/db");
const { createUser } = require("../server/services/auth-service");

const username = process.argv[2];
const password = process.env.TASK_ATLAS_ADMIN_PASSWORD;

if (!username || !password) {
  console.error(
    "Usage: TASK_ATLAS_ADMIN_PASSWORD=<password> npm run user:create -- <username>"
  );
  process.exitCode = 1;
} else {
  try {
    const user = createUser({ username, password });
    console.log(`Created user: ${user.username}`);
    console.log(`Database: ${databasePath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
