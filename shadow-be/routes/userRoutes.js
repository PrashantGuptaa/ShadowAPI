const express = require("express");
const {
  loginUserController,
  registerUserController,
  verifyUserEmailController,
  getUpdatedTokenController,
  authRedirectWithGoogleController,
  googleCallbackController,
} = require("../controllers/userController");
const { validateUser } = require("../middlewares/userMiddleware");

const userRoutes = express.Router();

userRoutes.post("/login", loginUserController);
userRoutes.post("/register", registerUserController);
userRoutes.put("/verify-email", verifyUserEmailController);
userRoutes.get("/me", validateUser, getUpdatedTokenController);

module.exports = userRoutes;
