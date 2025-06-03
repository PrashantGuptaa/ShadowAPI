const jwt = require("jsonwebtoken");

const validateUser = (req, res, next) => {
  // Middleware to validate user data
  console.log("Headers:", req.headers);
  // Decode the token from the request header
  const token = req.headers["auth-token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);
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
