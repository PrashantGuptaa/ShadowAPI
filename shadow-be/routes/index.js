const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const ruleRoutes = require("./ruleRoutes");
const authRoutes = require("./authRoutes");

router.use("/user", userRoutes);
router.use("/rule", ruleRoutes);
router.use("/auth", authRoutes);

module.exports = router;
