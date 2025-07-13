const jwt = require("jsonwebtoken");
const AppError = require("./appError");

function generateUserJwtToken(user, expiresIn = "24h") {
  const payload = {
    _id: user._id,
    userId: user.userId,
    email: user.email,
    name: user.name,
    picture: user.picture || null, // Optional field
  };
  const secretKey = process.env.USER_JWT_SECRET;
  const options = { expiresIn }; // Token expiration time
  const token = jwt.sign(payload, secretKey, options);
  return token;
}

const verifyUserJwtToken = (token) => {
  try {
    const secretKey = process.env.USER_JWT_SECRET;
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    throw new AppError("Invalid token", 401);
  }
};
module.exports = {
  generateUserJwtToken,
  verifyUserJwtToken,
};
