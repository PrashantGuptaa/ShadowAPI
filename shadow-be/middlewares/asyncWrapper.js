const logger = require("../utils/logger");

/**
 * Async wrapper to automatically catch errors in async route handlers
 * This eliminates the need to manually call next(error) in every controller
 *
 * Usage:
 * const asyncWrapper = require('../middlewares/asyncWrapper');
 *
 * router.get('/users', asyncWrapper(async (req, res) => {
 *   // Your async code here - any thrown error will be automatically caught
 *   const users = await getUserService();
 *   res.json(users);
 * }));
 */
const asyncWrapper = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the error with full context
      logger.logError(error, req, {
        controller: fn.name || "Anonymous Controller",
        timestamp: new Date().toISOString(),
      });

      // Pass the error to the global error handler
      next(error);
    });
  };
};

module.exports = asyncWrapper;
