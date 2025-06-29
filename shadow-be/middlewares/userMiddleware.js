const { verifyUserJwtToken } = require("../utils/helperFunc");

const validateUser = (req, res, next) => {
  // Middleware to validate user data
  const token = req.headers["auth-token"];
  if (!token) {
    console.warn("Unauthorized access attempt: No token provided");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = verifyUserJwtToken(token);
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = {
  validateUser,
};
