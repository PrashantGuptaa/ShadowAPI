const express = require("express");
const router = express.Router();

const interceptorRoutes = require("./interceptorRoutes");
const userRoutes = require("./userRoutes");
const ruleRoutes = require("./ruleRoutes");

router.use("/interceptor", interceptorRoutes);
router.use("/user", userRoutes);
router.use("/rule", ruleRoutes);

module.exports = router;
