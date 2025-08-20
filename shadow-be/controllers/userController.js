const User = require("../models/userModel");
const asyncWrapper = require("../middlewares/asyncWrapper");
const { sendSuccess, sendError } = require("../utils/response");
const {
  registerUserService,
  loginUserService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
} = require("../services/userService");
const { generateUserJwtToken } = require("../utils/jwtUtils");
const logger = require("../utils/logger");
const {
  InputSanitizer,
  USER_REGISTRATION_SCHEMA,
  USER_LOGIN_SCHEMA,
  FORGOT_PASSWORD_SCHEMA,
  RESET_PASSWORD_SCHEMA,
  EMAIL_VERIFICATION_SCHEMA,
} = require("../utils/sanitizer");

const getUserController = asyncWrapper(async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return sendError(res, {
      message: "Email query parameter is required",
      statusCode: 400,
    });
  }

  // Sanitize email input
  const sanitizedEmail = InputSanitizer.sanitizeEmail(email);

  // Find the user by email - fetch only email, name, role, userId
  const user = await User.findOne(
    { email: sanitizedEmail },
    "email name role userId"
  );
  if (!user) {
    return sendError(res, {
      message: "User not found",
      statusCode: 404,
    });
  }

  logger.info("User fetched successfully", {
    email: sanitizedEmail,
    userId: user.userId,
  });

  sendSuccess(res, {
    data: user,
    message: "User fetched successfully",
  });
});

const registerUserController = asyncWrapper(async (req, res) => {
  // Sanitize and validate input
  const sanitizedData = InputSanitizer.sanitizeObject(
    req.body,
    USER_REGISTRATION_SCHEMA
  );

  logger.info("Processing user registration", {
    email: sanitizedData.email,
    name: sanitizedData.name,
    ip: req.ip || req.connection.remoteAddress,
  });

  const newUser = await registerUserService(sanitizedData);

  logger.info("User registered successfully", {
    email: sanitizedData.email,
    userId: newUser.userId,
  });

  sendSuccess(res, {
    data: newUser,
    message: "User registered successfully",
    statusCode: 201,
  });
});

const loginUserController = asyncWrapper(async (req, res) => {
  // Sanitize and validate input
  const sanitizedData = InputSanitizer.sanitizeObject(
    req.body,
    USER_LOGIN_SCHEMA
  );

  logger.info("Login attempt", {
    email: sanitizedData.email,
    ip: req.ip || req.connection.remoteAddress,
  });

  const user = await loginUserService(
    sanitizedData.email,
    sanitizedData.password
  );

  logger.info("User logged in successfully", {
    email: sanitizedData.email,
    userId: user.userId,
  });

  sendSuccess(res, {
    data: user,
    message: "User logged in successfully",
  });
});

const verifyUserEmailController = asyncWrapper(async (req, res) => {
  // Sanitize and validate input
  const sanitizedData = InputSanitizer.sanitizeObject(
    req.body,
    EMAIL_VERIFICATION_SCHEMA
  );

  logger.info("Processing email verification", {
    tokenPreview: sanitizedData.token.substring(0, 10) + "...",
    ip: req.ip || req.connection.remoteAddress,
  });

  const response = await verifyEmailService(sanitizedData.token);

  logger.info("User email verified successfully", {
    tokenPreview: sanitizedData.token.substring(0, 10) + "...",
  });

  sendSuccess(res, {
    message: "User email verified successfully",
    statusCode: 200,
    data: response,
  });
});

const getUpdatedTokenController = asyncWrapper(async (req, res) => {
  // Generate a new JWT token for the user
  const user = req?.user; // Assuming user is set in the request by authentication middleware
  const token = generateUserJwtToken(user, "24h");

  logger.info("New token issued", {
    email: user?.email,
    userId: user?.userId,
  });

  sendSuccess(res, {
    message: "Token updated successfully",
    data: { token, ...user },
  });
});

const forgotPasswordController = asyncWrapper(async (req, res) => {
  // Sanitize and validate input
  const sanitizedData = InputSanitizer.sanitizeObject(
    req.body,
    FORGOT_PASSWORD_SCHEMA
  );

  logger.info("Forgot password request", {
    email: sanitizedData.email,
    ip: req.ip || req.connection.remoteAddress,
  });

  const result = await forgotPasswordService(sanitizedData.email);

  sendSuccess(res, {
    message: result.message,
    statusCode: 200,
  });
});

const resetPasswordController = asyncWrapper(async (req, res) => {
  // Sanitize and validate input
  const sanitizedData = InputSanitizer.sanitizeObject(
    req.body,
    RESET_PASSWORD_SCHEMA
  );

  logger.info("Reset password attempt", {
    tokenPreview: sanitizedData.token
      ? sanitizedData.token.substring(0, 10) + "..."
      : "null",
    ip: req.ip || req.connection.remoteAddress,
  });

  const result = await resetPasswordService(
    sanitizedData.token,
    sanitizedData.newPassword
  );

  sendSuccess(res, {
    message: result.message,
    statusCode: 200,
  });
});

module.exports = {
  getUserController,
  registerUserController,
  loginUserController,
  verifyUserEmailController,
  getUpdatedTokenController,
  forgotPasswordController,
  resetPasswordController,
};
