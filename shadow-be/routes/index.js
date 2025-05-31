const express = require("express");
const router = express.Router();

const interceptorRoutes = require("./interceptorRoutes");
const userRoutes = require("./userRoutes");

router.use("/interceptor", interceptorRoutes);
router.use("/user", userRoutes);

module.exports = router;
