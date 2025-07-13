const Rule = require("../models/ruleModel");
const AppError = require("../utils/appError");

const getRulesByEmailService = async (email, pageNum = 1, pageSize = 10, type) => {
  console.log("Fetching rules for user:", email);
  if (!email) {
    throw new AppError("Email is required to fetch rules", 400);
  }
  const offset = (pageNum - 1) * pageSize;
  const rules = await Rule.find(
    { deleted: false, createdBy: email, ...(type !== 'all' && { isActive: type === 'active' }) },
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

const fetchActiveRulesToMockService = async (email) => {
  console.log("Fetching active rules for user:", email);
  if (!email) {
    throw new Error("Email is required to fetch active rules");
  }
  const rules = await Rule.find({
    isActive: true,
    deleted: false,
    createdBy: email,
  });
  console.log("Active rules fetched:", rules.length);
  return rules;
};

const updateRuleStatusService = async (ruleId, isActive, email) => {
  if (!ruleId || typeof isActive !== "boolean") {
    throw new AppError("Invalid rule ID or status", 400);
  }
  const rule = await Rule.findOneAndUpdate(
    { ruleId, createdBy: email, deleted: false },
    { isActive, updatedBy: email },
    { new: true }
  );
  if (!rule) {
    throw new AppError(
      "Rule not found or you do not have permission to update it",
      404
    );
  }
  return rule;
};

const getRuleByIdService = async (ruleId, email) => {
  if (!ruleId || !email) {
    throw new AppError("Rule ID and email are required", 400);
  }
  const rule = await Rule.findOne({ ruleId, createdBy: email, deleted: false });
  if (!rule) {
    throw new AppError(
      "Rule not found or you do not have permission to access it",
      404
    );
  }
  return rule;
};

const updateRuleByIdService = async (ruleId, email, ruleDetailsToUpdate) => {
  if (!ruleId || !email) {
    throw new AppError("Rule ID and email are required", 400);
  }
  // updating the rule
  const updatedRule = await Rule.findOneAndUpdate(
    { ruleId, createdBy: email, deleted: false },
    { ...ruleDetailsToUpdate, updatedBy: email, isActive: false },
    { new: true }
  );
  if (!updatedRule) {
    throw new AppError(
      "Rule not found or you do not have permission to update it",
      404
    );
  }
  return updatedRule;
};

module.exports = {
  getRulesByEmailService,
  saveRuleService,
  fetchActiveRulesToMockService,
  updateRuleStatusService,
  getRuleByIdService,
  updateRuleByIdService,
};
