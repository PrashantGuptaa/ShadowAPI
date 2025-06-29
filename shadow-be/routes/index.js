const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const ruleRoutes = require("./ruleRoutes");

router.use("/user", userRoutes);
router.use("/rule", ruleRoutes);

module.exports = router;
