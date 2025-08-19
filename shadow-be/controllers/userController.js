const User = require("../models/userModel");
const asyncWrapper = require("../middlewares/asyncWrapper");
const { sendSuccess, sendError } = require("../utils/response");
const {
  registerUserService,
  loginUserService,
  verifyEmailService,
} = require("../services/userService");
const { generateUserJwtToken } = require("../utils/jwtUtils");
const logger = require("../utils/logger");

const getUserController = asyncWrapper(async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return sendError(res, {
      message: "Email query parameter is required",
      statusCode: 400,
    });
  }

  // Find the user by email - fetch only email, name, role, userId
  const user = await User.findOne({ email }, "email name role userId");
  if (!user) {
    return sendError(res, {
      message: "User not found",
      statusCode: 404,
    });
  }

  logger.info("User fetched successfully", {
    email,
    userId: user.userId,
  });

  sendSuccess(res, {
    data: user,
    message: "User fetched successfully",
  });
});

const registerUserController = asyncWrapper(async (req, res) => {
  const { email, name, password } = req.body;

  const userData = { email, name, password };
  const newUser = await registerUserService(userData);

  logger.info("User registered successfully", {
    email,
    userId: newUser.userId,
  });

  sendSuccess(res, {
    data: newUser,
    message: "User registered successfully",
    statusCode: 201,
  });
});

const loginUserController = asyncWrapper(async (req, res) => {
  logger.info("Login attempt", {
    email: req.body.email,
    ip: req.ip || req.connection.remoteAddress,
  });

  const { email, password } = req.body;
  const user = await loginUserService(email, password);

  logger.info("User logged in successfully", {
    email,
    userId: user.userId,
  });

  sendSuccess(res, {
    data: user,
    message: "User logged in successfully",
  });
});

const verifyUserEmailController = asyncWrapper(async (req, res) => {
  const { token } = req.body;
  const response = await verifyEmailService(token);

  logger.info("User email verified successfully", {
    token: token.substring(0, 10) + "...",
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

module.exports = {
  getUserController,
  registerUserController,
  loginUserController,
  verifyUserEmailController,
  getUpdatedTokenController,
};
