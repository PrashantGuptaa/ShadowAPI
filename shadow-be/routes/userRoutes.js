const express = require("express");
const { loginUserController, registerUserController } = require("../controllers/userController");

const userRoutes = express.Router();

userRoutes.post("/login", loginUserController);
userRoutes.post("/register", registerUserController);

module.exports = userRoutes;
