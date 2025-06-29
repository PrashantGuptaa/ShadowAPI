const express = require("express");
const { validateUser } = require("../middlewares/userMiddleware");
const {
  fetchRulesController,
  saveRuleController,
  getActiveRulesToMockController,
  updateRuleStatusController,
} = require("../controllers/ruleController");

const ruleRoutes = express.Router();
ruleRoutes.use(validateUser);

ruleRoutes.get("/collection", fetchRulesController);
ruleRoutes.post("/create", saveRuleController);
ruleRoutes.get("/active-rules", getActiveRulesToMockController);
ruleRoutes.put("/update-status", updateRuleStatusController);

module.exports = ruleRoutes;
