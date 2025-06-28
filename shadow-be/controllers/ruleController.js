const {
  getRulesByUserIdService,
  saveRuleService,
  fetchActiveRulesToMockService,
} = require("../services/ruleService");
const { sendSuccess, sendError } = require("../utils/response");

const fetchRulesController = async (req, res) => {
  try {
    const { pageSize, pageNum } = req.query;

    const userId = req.user?.userId;
    const result = await getRulesByUserIdService(
      userId,
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
    await saveRuleService(req.body);
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
    
    const userId = req.user?.userId;
    const rules = await fetchActiveRulesToMockService(userId);
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
}

module.exports = {
  fetchRulesController,
  saveRuleController,
  getActiveRulesToMockController,
};

