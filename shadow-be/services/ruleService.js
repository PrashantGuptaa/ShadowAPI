const Rule = require("../models/ruleModel");

const getRulesByUserIdService = async (userId, pageNum = 1, pageSize = 20) => {
  if (!userId) {
    throw new Error("User ID is required to fetch rules");
  }
  const offset = (pageNum - 1) * pageSize;
  const rules = await Rule.find(
    { isActive: true, deleted: false, createdBy: userId },
    "ruleId name description method url createdBy updatedBy"
  )
    .skip(offset)
    .limit(pageSize)
    .sort({ updatedAt: -1 });
  const totalCount = await Rule.countDocuments({
    isActive: true,
    deleted: false,
    createdBy: userId,
  });
  return {
    rules,
    totalCount,
  };
};

const saveRuleService = async (ruleData) => {
  // validate ruleData
  const { url, method, match, hasPayload, payload, response } = ruleData;
  if (!url || !method || !match || (hasPayload && !payload) || !response) {
    throw new Error("Invalid rule data");
  }
  // create or update rule
  const rule = new Rule({
    ...ruleData,
    createdBy: ruleData.createdBy || 1, // default to system if not provided
    updatedBy: ruleData.updatedBy || 1,
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
  getRulesByUserIdService,
  saveRuleService,
  fetchActiveRulesToMockService,
};
