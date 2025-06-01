// this will handle the user related operations

const User = require("../models/user");

const { sendSuccess, sendError } = require("../utils/response");
const {
  registerUserService,
  loginUserService,
  verifyEmailService,
} = require("../services/userService");

const getUserController = async (req, res) => {
  try {
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
    sendSuccess(res, {
      data: user,
      message: "User fetched successfully",
    });
  } catch (err) {
    sendError(res, {
      message: "Error fetching user",
      err,
      statusCode: 500,
    });
  }
};

const registerUserController = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const userData = { email, name, password };
    const newUser = await registerUserService(userData);
    sendSuccess(res, {
      data: newUser,
      message: "User registered successfully",
      statusCode: 201,
    });
  } catch (err) {
    sendError(res, {
      message: "Error registering user",
      err,
      statusCode: 500,
    });
  }
};

const loginUserController = async (req, res) => {
  try {
      console.info("Login attempt with body:", req.body);
    const { email, password } = req.body;
    const user = await loginUserService(email, password);
    sendSuccess(res, {
      data: user,
      message: "User logged in successfully",
    });
  } catch (error) {
    sendError(res, {
      message: "Error logging in user",
      err: error,
      statusCode: 500,
    });
  }
};

const verifyUserEmailController = async (req, res) => {
  try {
    const { token } = req.query;
    await verifyEmailService(token);
    sendSuccess(res, {
      message: "User email verified successfully",
      statusCode: 200,
    });
  } catch (err) {
    sendError(res, {
      message: "Error verifying user email",
      err,
      statusCode: 500,
    });
  }
};

module.exports = {
  getUserController,
  registerUserController,
  loginUserController,
  verifyUserEmailController,
};
