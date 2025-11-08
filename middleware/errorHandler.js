const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error("Error in %s %s: %o", req.method, req.originalUrl, err);
  res.status(500).json({ message: "Internal Server Error" });
}

module.exports = errorHandler;
