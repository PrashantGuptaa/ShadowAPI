const express = require("express");
const {
  loginUserController,
  registerUserController,
  verifyUserEmailController,
  getUpdatedTokenController,
  forgotPasswordController,
  resetPasswordController,
} = require("../controllers/userController");
const { validateUser } = require("../middlewares/userMiddleware");
const {
  authRateLimiter,
  forgotPasswordRateLimiter,
  strictRateLimiter,
} = require("../middlewares/rateLimiter");

const userRoutes = express.Router();

userRoutes.post("/login", authRateLimiter, loginUserController);
userRoutes.post("/register", authRateLimiter, registerUserController);
userRoutes.put("/verify-email", authRateLimiter, verifyUserEmailController);
userRoutes.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  forgotPasswordController
);
userRoutes.post("/reset-password", strictRateLimiter, resetPasswordController);
userRoutes.get("/me", validateUser, getUpdatedTokenController);

module.exports = userRoutes;
