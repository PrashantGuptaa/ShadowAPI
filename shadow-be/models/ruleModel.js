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
    match: {
      type: String,
      enum: [PARTIAL_MATCH_ENUM, EXACT_MATCH_ENUM],
      default: PARTIAL_MATCH_ENUM,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ruleSchema.plugin(AutoIncrement, {
  inc_field: "ruleId",
  id: "ruleId_counter", // optional: custom counter ID
  disable_hooks: false,
});

const Rule = model("Rule", ruleSchema);

module.exports = Rule;
