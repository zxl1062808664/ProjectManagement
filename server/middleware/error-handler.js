function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Requested resource was not found.",
    },
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = Number.isInteger(error.status) ? error.status : 500;

  res.status(statusCode).json({
    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",
      message: error.message || "Unexpected server error.",
    },
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
