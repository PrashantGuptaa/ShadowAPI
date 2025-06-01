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

module.exports = {
  getRulesByUserIdService,
};
