const {
  getRulesByEmailService,
  saveRuleService,
  fetchActiveRulesToMockService,
  updateRuleStatusService,
  getRuleByIdService,
  updateRuleByIdService,
} = require("../services/ruleService");
const { sendSuccess, sendError } = require("../utils/response");

const fetchRulesController = async (req, res) => {
  try {
    const { pageSize, pageNum } = req.query;

    const email = req.user?.email;
    const result = await getRulesByEmailService(
      email,
      parseInt(pageNum) || 1,
      parseInt(pageSize) || 20
    );
    sendSuccess(res, {
      data: result,
      message: "Rules fetched successfully",
    });
  } catch (error) {
    sendError(res, {
      message: "Error fetching rules",
      err: error,
      statusCode: 500,
    });
  }
};

const saveRuleController = async (req, res) => {
  try {
    await saveRuleService(req.body, req.user?.email);
    sendSuccess(res, {
      message: "Rule saved successfully",
      statusCode: 201,
    });
  } catch (error) {
    sendError(res, {
      message: "Error saving rule",
      err: error,
      statusCode: 500,
    });
  }
};

const getActiveRulesToMockController = async (req, res) => {
  try {
    const email = req.user?.email;
    const rules = await fetchActiveRulesToMockService(email);
    sendSuccess(res, {
      data: rules,
      message: "Active rules fetched successfully",
    });
  } catch (error) {
    sendError(res, {
      message: "Error fetching active rules",
      err: error,
      statusCode: 500,
    });
  }
};

const updateRuleStatusController = async (req, res) => {
  try {
    const { ruleId, isActive } = req.body;
    const data = await updateRuleStatusService(
      ruleId,
      isActive,
      req.user?.email
    );
    sendSuccess(res, {
      message: "Rule status updated successfully",
      data,
    });
  } catch (error) {
    sendError(res, {
      message: "Error updating rule status",
      err: error,
    });
  }
};

const getRuleByIdController = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const email = req.user?.email;
    const rule = await getRuleByIdService(ruleId, email);
    sendSuccess(res, {
      data: rule,
      message: "Rule fetched successfully",
    });
  } catch (error) {
    sendError(res, {
      message: "Error fetching rule",
      err: error,
    });
  }
};

const updateRuleByIdController = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const email = req.user?.email;
    const ruleDetailsToUpdate = req.body;
    const updatedRule = await updateRuleByIdService(
      ruleId,
      email,
      ruleDetailsToUpdate
    );
    sendSuccess(res, {
      data: updatedRule,
      message: "Rule updated successfully",
    });
  } catch (error) {
    sendError(res, {
      message: "Error updating rule",
      err: error,
    });
  }
};

module.exports = {
  fetchRulesController,
  saveRuleController,
  getActiveRulesToMockController,
  updateRuleStatusController,
  getRuleByIdController,
  updateRuleByIdController,
};
