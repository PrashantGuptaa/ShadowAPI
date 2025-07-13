const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    userId: {
      type: Number,
      unique: true,
      // required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: false, // Optional for OAuth users
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    bio: {
      type: String,
      default: null,
    },
    socialLinks: {
      type: Map,
      of: String,
      default: {},
    },
    phone: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    verificationEmailLastSent: {
      type: Date,
    },
    verificationPhoneLastSent: {
      type: Date,
    },
    picture: {
      type: String,
      default: null,
    },
    source: {
      type: String,
      enum: ["local", "google", "facebook", "github"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.plugin(AutoIncrement, {
  inc_field: "userId",
  id: "userId_counter", // optional: custom counter ID
  disable_hooks: false,
});

const User = model("User", userSchema);
module.exports = User;
