const { getRulesByUserIdService } = require("../services/ruleService");
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

module.exports = {
  fetchRulesController,
};