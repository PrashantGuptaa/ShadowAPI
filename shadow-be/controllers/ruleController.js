const {
  getRulesByEmailService,
  saveRuleService,
  fetchActiveRulesToMockService,
  updateRuleStatusService,
  getRuleByIdService,
  updateRuleByIdService,
} = require("../services/ruleService");
const { sendSuccess, sendError } = require("../utils/response");
const asyncWrapper = require("../middlewares/asyncWrapper");
const logger = require("../utils/logger");

const fetchRulesController = asyncWrapper(async (req, res) => {
  const { pageSize, pageNum, type = "all" } = req.query;
  const email = req.user?.email;

  logger.info("Fetching rules for user", {
    email,
    pageNum: parseInt(pageNum) || 1,
    pageSize: parseInt(pageSize) || 20,
    type,
  });

  const result = await getRulesByEmailService(
    email,
    parseInt(pageNum) || 1,
    parseInt(pageSize) || 20,
    type
  );

  logger.info("Rules fetched successfully", {
    email,
    totalRules: result.totalCount,
    returnedRules: result.rules.length,
  });

  sendSuccess(res, {
    data: result,
    message: "Rules fetched successfully",
  });
});

const saveRuleController = asyncWrapper(async (req, res) => {
  const email = req.user?.email;

  logger.info("Saving new rule", {
    email,
    ruleName: req.body.name,
    ruleMethod: req.body.method,
    ruleUrl: req.body.url,
  });

  await saveRuleService(req.body, email);

  logger.info("Rule saved successfully", {
    email,
    ruleName: req.body.name,
  });

  sendSuccess(res, {
    message: "Rule saved successfully",
    statusCode: 201,
  });
});

const getActiveRulesToMockController = asyncWrapper(async (req, res) => {
  const email = req.user?.email;

  logger.info("Fetching active rules for mocking", { email });

  const rules = await fetchActiveRulesToMockService(email);

  logger.info("Active rules fetched for mocking", {
    email,
    activeRulesCount: rules.length,
  });

  sendSuccess(res, {
    data: rules,
    message: "Active rules fetched successfully",
  });
});

const updateRuleStatusController = asyncWrapper(async (req, res) => {
  const { ruleId, isActive } = req.body;
  const email = req.user?.email;

  logger.info("Updating rule status", {
    email,
    ruleId,
    newStatus: isActive ? "active" : "inactive",
  });

  const data = await updateRuleStatusService(ruleId, isActive, email);

  logger.info("Rule status updated successfully", {
    email,
    ruleId,
    newStatus: isActive ? "active" : "inactive",
  });

  sendSuccess(res, {
    message: "Rule status updated successfully",
    data,
  });
});

const getRuleByIdController = asyncWrapper(async (req, res) => {
  const { ruleId } = req.params;
  const email = req.user?.email;

  logger.info("Fetching rule by ID", { email, ruleId });

  const rule = await getRuleByIdService(ruleId, email);

  logger.info("Rule fetched successfully by ID", {
    email,
    ruleId,
    ruleName: rule.name,
  });

  sendSuccess(res, {
    data: rule,
    message: "Rule fetched successfully",
  });
});

const updateRuleByIdController = asyncWrapper(async (req, res) => {
  const { ruleId } = req.params;
  const email = req.user?.email;
  const ruleDetailsToUpdate = req.body;

  logger.info("Updating rule by ID", {
    email,
    ruleId,
    updateFields: Object.keys(ruleDetailsToUpdate),
  });

  const updatedRule = await updateRuleByIdService(
    ruleId,
    email,
    ruleDetailsToUpdate
  );

  logger.info("Rule updated successfully by ID", {
    email,
    ruleId,
    ruleName: updatedRule.name,
  });

  sendSuccess(res, {
    data: updatedRule,
    message: "Rule updated successfully",
  });
});

module.exports = {
  fetchRulesController,
  saveRuleController,
  getActiveRulesToMockController,
  updateRuleStatusController,
  getRuleByIdController,
  updateRuleByIdController,
};
