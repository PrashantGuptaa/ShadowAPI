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
  let privateKey = (process.env.USER_SECRET_KEY || "").replace(/\\n/g, "\n");

  // Clean the key - remove any surrounding quotes and extra whitespace
  privateKey = privateKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.slice(1, -1);
  }

  // Additional Vercel-specific formatting
  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    // If the key doesn't have proper headers, it might be base64 encoded
    try {
      privateKey = Buffer.from(privateKey, "base64").toString("utf-8");
    } catch (e) {
      logger.error("Failed to decode base64 private key", { error: e });
    }
  }

  // Ensure proper line endings
  privateKey = privateKey.replace(/\\n/g, "\n");
  // Validate the key format
  if (
    !privateKey.includes("-----BEGIN PRIVATE KEY-----") ||
    !privateKey.includes("-----END PRIVATE KEY-----")
  ) {
    logger.error("Invalid private key format", {
      hasBegin: privateKey.includes("-----BEGIN PRIVATE KEY-----"),
      hasEnd: privateKey.includes("-----END PRIVATE KEY-----"),
      keyLength: privateKey.length,
    });
    throw new AppError("Invalid private key format for RS256", 500);
  }

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
    let publicKey = (process.env.USER_CONSUMER_KEY || "").replace(/\\n/g, "\n");

    // Additional Vercel-specific formatting for public key
    if (
      !publicKey.includes("-----BEGIN PUBLIC KEY-----") &&
      !publicKey.includes("-----BEGIN PRIVATE KEY-----")
    ) {
      try {
        publicKey = Buffer.from(publicKey, "base64").toString("utf-8");
      } catch (e) {
        logger.error("Failed to decode base64 public key", { error: e });
      }
    }

    console.log("publicKey length", publicKey.length);
    console.log("publicKey starts with:", publicKey.substring(0, 50));
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
