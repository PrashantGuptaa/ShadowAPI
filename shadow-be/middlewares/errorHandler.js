const { sendError } = require("../utils/response");
const logger = require("../utils/logger");

const globalErrorHandler = (err, req, res, next) => {
  // Use the new logger for comprehensive error logging
  logger.logError(err, req, {
    handler: "GlobalErrorHandler",
    timestamp: new Date().toISOString(),
  });

  // Send appropriate error response
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Internal Server Error";

  sendError(res, {
    message,
    statusCode,
    err,
  });
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception - Continuing server operation", {
    error: err,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    processId: process.pid,
  });
  // Don't exit - let server continue running
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Promise Rejection - Continuing server operation", {
    reason: reason,
    promise: promise,
    stack: reason?.stack,
    timestamp: new Date().toISOString(),
    processId: process.pid,
  });
  // Don't exit - let server continue running
});

module.exports = globalErrorHandler;
