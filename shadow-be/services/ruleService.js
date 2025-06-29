const Rule = require("../models/ruleModel");
const AppError = require("../utils/appError");

const getRulesByEmailService = async (email, pageNum = 1, pageSize = 20) => {
  console.log("Fetching rules for user:", email);
  if (!email) {
    throw new AppError("Email is required to fetch rules", 400);
  }
  const offset = (pageNum - 1) * pageSize;
  const rules = await Rule.find(
    { deleted: false, createdBy: email },
    "ruleId name description method url updatedBy updatedAt isActive"
  )
    .skip(offset)
    .limit(pageSize)
    .sort({ updatedAt: -1 });
  const totalCount = await Rule.countDocuments({
    deleted: false,
    createdBy: email,
  });
  return {
    rules,
    totalCount,
  };
};

const saveRuleService = async (ruleData, email) => {
  // validate ruleData
  const { url, method, match, hasPayload, payload, response } = ruleData;
  if (!url || !method || !match || (hasPayload && !payload) || !response) {
    throw new Error("Invalid rule data");
  }
  // create or update rule
  const rule = new Rule({
    ...ruleData,
    createdBy: email,
    updatedBy: email,
  });
  const savedRule = await rule.save();
  return savedRule;
};

const fetchActiveRulesToMockService = async (userId) => {
  // if (!userId) {
  //   throw new Error("User ID is required to fetch active rules");
  // }
  const rules = await Rule.find({
    // isActive: true,
    // deleted: false,
    // createdBy: userId,
  });
  return rules;
};

module.exports = {
  getRulesByEmailService,
  saveRuleService,
  fetchActiveRulesToMockService,
};
