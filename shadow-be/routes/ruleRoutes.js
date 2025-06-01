const express = require("express");
const { validateUser } = require("../middlewares/userMW");
const { fetchRulesController } = require("../controllers/ruleController");

const ruleRoutes = express.Router();

ruleRoutes.get("/collection", validateUser, fetchRulesController);

module.exports = ruleRoutes;
