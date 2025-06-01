const mongoose = require("mongoose");
const {
  METHOD_TYPES_ENUM,
  PARTIAL_MATCH_ENUM,
  EXACT_MATCH_ENUM,
} = require("../config/rule.config");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { Schema, model } = mongoose;

const ruleSchema = new Schema(
  {
    ruleId: {
      type: Number,
      unique: true,
      // required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    method: {
      type: String,
      enum: [...Object.values(METHOD_TYPES_ENUM)],
      required: true,
      default: METHOD_TYPES_ENUM.GET,
    },
    payload: {
      type: Schema.Types.Mixed,
      default: null,
    },
    response: {
      type: Schema.Types.Mixed,
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    urlMatchType: {
      type: String,
      enum: [PARTIAL_MATCH_ENUM, EXACT_MATCH_ENUM],
      default: PARTIAL_MATCH_ENUM,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Number,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Number,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ruleSchema.plugin(AutoIncrement, { inc_field: "ruleId" });
const Rule = model("Rule", ruleSchema);
module.exports = Rule;
