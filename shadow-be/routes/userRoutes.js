const express = require("express");
const { loginUserController, registerUserController, verifyUserEmailController } = require("../controllers/userController");

const userRoutes = express.Router();

userRoutes.post("/login", loginUserController);
userRoutes.post("/register", registerUserController);
userRoutes.put("/verify-email", verifyUserEmailController)

module.exports = userRoutes;
