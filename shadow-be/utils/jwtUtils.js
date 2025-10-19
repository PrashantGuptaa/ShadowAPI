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

  const privateKey = processKey(process.env.USER_SECRET_KEY, "private");
  const options = { expiresIn, algorithm: "RS256" };
  const token = jwt.sign(payload, privateKey, options);

  logger.debug("JWT token generated successfully", {
    userId: user.userId,
    email: user.email,
    expiresIn,
  });

  return token;
}

// Helper function to process and validate keys
const processKey = (rawKey, keyType = "public") => {
  if (!rawKey) {
    throw new AppError(`${keyType} key is required`, 500);
  }

  // Clean the key - remove quotes, trim whitespace, and handle line endings
  let processedKey = rawKey.replace(/\\n/g, "\n").trim();

  // Remove surrounding quotes
  if (
    (processedKey.startsWith('"') && processedKey.endsWith('"')) ||
    (processedKey.startsWith("'") && processedKey.endsWith("'"))
  ) {
    processedKey = processedKey.slice(1, -1);
  }

  // Try to decode from base64 if it doesn't have PEM headers
  const hasValidHeaders =
    processedKey.includes("-----BEGIN PUBLIC KEY-----") ||
    processedKey.includes("-----BEGIN PRIVATE KEY-----");

  if (!hasValidHeaders) {
    try {
      processedKey = Buffer.from(processedKey, "base64").toString("utf-8");
      logger.debug(`Successfully decoded base64 ${keyType} key`);
    } catch (e) {
      logger.error(`Failed to decode base64 ${keyType} key`, { error: e });
    }
  }

  // Final validation based on key type
  let isValidKey = false;
  if (keyType === "private") {
    isValidKey =
      processedKey.includes("-----BEGIN PRIVATE KEY-----") &&
      processedKey.includes("-----END PRIVATE KEY-----");
  } else {
    isValidKey =
      processedKey.includes("-----BEGIN PUBLIC KEY-----") ||
      processedKey.includes("-----BEGIN PRIVATE KEY-----");
  }

  if (!isValidKey) {
    logger.error(`Invalid ${keyType} key format`, {
      hasPublicBegin: processedKey.includes("-----BEGIN PUBLIC KEY-----"),
      hasPrivateBegin: processedKey.includes("-----BEGIN PRIVATE KEY-----"),
      hasPrivateEnd: processedKey.includes("-----END PRIVATE KEY-----"),
      keyLength: processedKey.length,
      keyPreview: processedKey.substring(0, 50) + "...",
    });
    throw new AppError(`Invalid ${keyType} key format for RS256`, 500);
  }

  return processedKey;
};

const verifyUserJwtToken = (token) => {
  try {
    const publicKey = processKey(process.env.USER_CONSUMER_KEY, "public");
    const options = { algorithms: ["RS256"] };
    const decoded = jwt.verify(token, publicKey, options);

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
