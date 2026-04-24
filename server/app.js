const express = require("express");
const path = require("node:path");

const { databasePath } = require("./db");
const { attachSession } = require("./middleware/auth");
const apiRouter = require("./routes/api");
const { errorHandler, notFoundHandler } = require("./middleware/error-handler");

const app = express();
const port = Number(process.env.PORT || 3000);
const publicDir = path.resolve(__dirname, "..", "public");

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(attachSession);

app.use("/api", apiRouter);
app.use(express.static(publicDir));

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    next();
    return;
  }

  res.sendFile(path.join(publicDir, "index.html"));
});

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(
      `Task Atlas server listening on http://localhost:${port} (db: ${databasePath})`
    );
  });
}

module.exports = app;
