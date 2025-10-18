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
  // Format the private key properly by replacing \n with actual newlines
  const privateKey = (process.env.USER_SECRET_KEY || "").replace(/\\n/g, "\n");
  console.log("privateKey length", privateKey.length);
  const options = { expiresIn, algorithm: "RS256" }; // Token expiration time
  const token = jwt.sign(payload, privateKey, options);

  logger.debug("JWT token generated successfully", {
    userId: user.userId,
    email: user.email,
    expiresIn,
  });

  return token;
}

const verifyUserJwtToken = (token) => {
  try {
    // For RS256, we need the public key for verification
    // If you have a separate public key, use USER_PUBLIC_KEY
    // Otherwise, extract public key from private key or use the private key
    const publicKey = (process.env.USER_CONSUMER_KEY || "").replace(
      /\\n/g,
      "\n"
    );
    console.log("publicKey length", publicKey.length);
    const decoded = jwt.verify(token, publicKey);

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
