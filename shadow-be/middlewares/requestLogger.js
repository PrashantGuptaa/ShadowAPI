const logger = require("../utils/logger");

/**
 * Request logging middleware
 * Logs all incoming HTTP requests with timing and response details
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Calculate payload size and log request
  const sizeInBytes = new TextEncoder().encode(
    JSON.stringify(req.body || {})
  ).length;
  const sizeInKB = sizeInBytes / 1024;
  
  // Warn if payload is too large
  if (sizeInKB > 5) {
    logger.warn("Large request payload detected", {
      method: req.method,
      url: req.originalUrl,
      payloadSizeKB: parseFloat(sizeInKB.toFixed(2)),
      threshold: 5
    });
  }
  
  // Log the incoming request with payload size
  logger.http("Incoming Request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get("User-Agent"),
    payloadSizeKB: parseFloat(sizeInKB.toFixed(2)),
    body: req.method === "POST" || req.method === "PUT" ? req.body : undefined,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // Capture the original end function
  const originalEnd = res.end;

  // Override the end function to log response details
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - startTime;

    // Log the response
    logger.logRequest(req, res, responseTime);

    // Call the original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;
