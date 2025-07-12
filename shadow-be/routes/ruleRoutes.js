const express = require("express");
const { validateUser } = require("../middlewares/userMiddleware");
const {
  fetchRulesController,
  saveRuleController,
  getActiveRulesToMockController,
  updateRuleStatusController,
  getRuleByIdController,
  updateRuleByIdController,
} = require("../controllers/ruleController");

const ruleRoutes = express.Router();
ruleRoutes.use(validateUser);

ruleRoutes.get("/collection", fetchRulesController);
ruleRoutes.post("/create", saveRuleController);
ruleRoutes.get("/active-rules", getActiveRulesToMockController);
ruleRoutes.put("/update-status", updateRuleStatusController);
ruleRoutes.get("/:ruleId", getRuleByIdController);
ruleRoutes.put('/update/:ruleId', updateRuleByIdController);

module.exports = ruleRoutes;
