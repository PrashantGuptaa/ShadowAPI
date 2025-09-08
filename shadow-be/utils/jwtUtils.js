const jwt = require("jsonwebtoken");
const AppError = require("./appError");
const logger = require("./logger");

function generateUserJwtToken(user, expiresIn = "24h") {
  const payload = {
    _id: user._id,
    userId: user.userId,
    email: user.email,
    name: user.name,
    picture: user.picture || null, // Optional field
  };
  const secretKey = process.env.USER_SECRET_KEY || "";
  const options = { expiresIn, algorithm: "RS256" }; // Token expiration time
  const token = jwt.sign(payload, secretKey, options);

  logger.debug("JWT token generated successfully", {
    userId: user.userId,
    email: user.email,
    expiresIn,
  });

  return token;
}

const verifyUserJwtToken = (token) => {
  try {
    const secretKey = process.env.USER_CONSUMER_KEY;
    const decoded = jwt.verify(token, secretKey);

    logger.debug("JWT token verified successfully", {
      userId: decoded.userId,
      email: decoded.email,
    });

    return decoded;
  } catch (error) {
    logger.error("JWT verification failed", {
      error,
      tokenPresent: !!token,
      errorType: error.name,
    });
    throw new AppError("Invalid token", 401, error);
  }
};
module.exports = {
  generateUserJwtToken,
  verifyUserJwtToken,
};
