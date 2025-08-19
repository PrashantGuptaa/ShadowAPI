const { verifyUserJwtToken } = require("../utils/jwtUtils");
const logger = require("../utils/logger");

const validateUser = (req, res, next) => {
  // Middleware to validate user data
  const token = req.headers["auth-token"];
  if (!token) {
    logger.warn("Unauthorized access attempt", {
      reason: "No token provided",
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl,
      userAgent: req.get("User-Agent")
    });
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = verifyUserJwtToken(token);
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    logger.error("Token verification failed", {
      error,
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl,
      userAgent: req.get("User-Agent")
    });
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = {
  validateUser,
};
