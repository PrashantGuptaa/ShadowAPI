const express = require("express");
const { validateUser } = require("../middlewares/userMiddleware");
const {
  fetchRulesController,
  saveRuleController,
  getActiveRulesToMockController,
} = require("../controllers/ruleController");

const ruleRoutes = express.Router();

ruleRoutes.get("/collection", validateUser, fetchRulesController);
ruleRoutes.post("/create", saveRuleController);
ruleRoutes.get("/active-rules", getActiveRulesToMockController );

module.exports = ruleRoutes;
