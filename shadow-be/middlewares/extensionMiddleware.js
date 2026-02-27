const { verifyUserJwtToken } = require("../utils/jwtUtils");
const logger = require("../utils/logger");

const validateExtensionToken = (req, res, next) => {
  const token = req.headers["auth-token"];
  if (!token) {
    logger.warn("Unauthorized extension access attempt", {
      reason: "No token provided",
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl,
      userAgent: req.get("User-Agent")
    });
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  
  try {
    const decoded = verifyUserJwtToken(token);
    
    if (decoded.scope !== "extension") {
      logger.warn("Invalid token scope for extension endpoint", {
        email: decoded.email,
        scope: decoded.scope,
        expectedScope: "extension",
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl
      });
      return res.status(403).json({ 
        message: "Forbidden: This endpoint requires an extension token" 
      });
    }
    
    if (req.method !== "GET") {
      logger.warn("Extension token attempted non-GET operation", {
        email: decoded.email,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress
      });
      return res.status(403).json({ 
        message: "Forbidden: Extension tokens can only perform read operations" 
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Extension token verification failed", {
      error,
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl,
      userAgent: req.get("User-Agent")
    });
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = {
  validateExtensionToken,
};
