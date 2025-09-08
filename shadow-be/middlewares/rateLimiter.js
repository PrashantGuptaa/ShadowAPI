const AppError = require("../utils/appError");
const logger = require("../utils/logger");

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map();
const blockedIPs = new Map();

// Clean up old entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;

  for (const [key, data] of requestCounts.entries()) {
    if (now - data.firstRequest > fifteenMinutes) {
      requestCounts.delete(key);
    }
  }

  for (const [ip, blockTime] of blockedIPs.entries()) {
    if (now - blockTime > fifteenMinutes) {
      blockedIPs.delete(ip);
    }
  }
}, 15 * 60 * 1000);

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 5, // Maximum requests per window
    blockDuration = 15 * 60 * 1000, // Block duration after limit exceeded
    message = "Too many requests. Please try again later.",
    skipSuccessfulRequests = false,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress,
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Check if IP is currently blocked
    if (blockedIPs.has(key)) {
      const blockTime = blockedIPs.get(key);
      const timeRemaining = Math.ceil((blockTime + blockDuration - now) / 1000);

      logger.warn("Blocked IP attempted request", {
        ip: key,
        endpoint: req.originalUrl,
        method: req.method,
        timeRemaining: timeRemaining + "s",
      });

      throw new AppError(
        `Access temporarily blocked. Try again in ${timeRemaining} seconds.`,
        429
      );
    }

    // Get or create request count data
    if (!requestCounts.has(key)) {
      requestCounts.set(key, {
        count: 0,
        firstRequest: now,
      });
    }

    const requestData = requestCounts.get(key);

    // Reset window if enough time has passed
    if (now - requestData.firstRequest > windowMs) {
      requestData.count = 0;
      requestData.firstRequest = now;
    }

    // Increment request count
    requestData.count++;

    // Check if limit exceeded
    if (requestData.count > maxRequests) {
      // Block the IP
      blockedIPs.set(key, now);

      logger.error("Rate limit exceeded - IP blocked", {
        ip: key,
        endpoint: req.originalUrl,
        method: req.method,
        requestCount: requestData.count,
        windowMs,
        maxRequests,
      });

      throw new AppError(
        `Rate limit exceeded. Access blocked for ${Math.ceil(
          blockDuration / 60000
        )} minutes.`,
        429
      );
    }

    // Log warning when approaching limit
    if (requestData.count > maxRequests * 0.8) {
      logger.warn("Approaching rate limit", {
        ip: key,
        endpoint: req.originalUrl,
        method: req.method,
        requestCount: requestData.count,
        maxRequests,
        remaining: maxRequests - requestData.count,
      });
    }

    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": maxRequests,
      "X-RateLimit-Remaining": Math.max(0, maxRequests - requestData.count),
      "X-RateLimit-Reset": new Date(
        requestData.firstRequest + windowMs
      ).toISOString(),
    });

    next();
  };
};

// Predefined rate limiters for different endpoints
const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 5 attempts per 15 minutes
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 3 password reset requests per hour
  message: "Too many password reset requests. Please try again in 1 hour.",
});

const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200, // 100 requests per 15 minutes
  message: "Too many requests. Please slow down.",
});

const strictRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 attempts per 5 minutes
  blockDuration: 30 * 60 * 1000, // Block for 30 minutes
  message: "Too many failed attempts. Access temporarily restricted.",
});

module.exports = {
  createRateLimiter,
  authRateLimiter,
  forgotPasswordRateLimiter,
  generalRateLimiter,
  strictRateLimiter,
};
