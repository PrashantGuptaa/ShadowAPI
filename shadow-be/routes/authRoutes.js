const express = require("express");

const { authRedirectWithGoogleController, googleCallbackController } = require("../controllers/authController");

const authRoutes = express.Router();

authRoutes.get("/google", authRedirectWithGoogleController);
authRoutes.get("/google/callback", googleCallbackController);

module.exports = authRoutes;
