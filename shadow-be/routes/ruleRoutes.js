const express = require("express");
const { validateUser } = require("../middlewares/userMiddleware");
const { validateExtensionToken } = require("../middlewares/extensionMiddleware");
const {
  fetchRulesController,
  saveRuleController,
  getActiveRulesToMockController,
  updateRuleStatusController,
  getRuleByIdController,
  updateRuleByIdController,
  deleteRuleByIdController,
} = require("../controllers/ruleController");

const ruleRoutes = express.Router();

ruleRoutes.get("/extension/active-rules", validateExtensionToken, getActiveRulesToMockController);

ruleRoutes.use(validateUser);

ruleRoutes.get("/collection", fetchRulesController);
ruleRoutes.put("/delete/:ruleId", deleteRuleByIdController);
ruleRoutes.post("/create", saveRuleController);
ruleRoutes.get("/active-rules", getActiveRulesToMockController);
ruleRoutes.put("/update-status", updateRuleStatusController);
ruleRoutes.get("/:ruleId", getRuleByIdController);
ruleRoutes.put('/update/:ruleId', updateRuleByIdController);

module.exports = ruleRoutes;
