const bcrypt = require("bcrypt");
const moment = require("moment");
const User = require("../models/userModel");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

const { sendEmailService } = require("./emailService");
const AppError = require("../utils/appError");
const { isValidPassword, isValidEmail } = require("../utils/helperFunc");
const {
  generateUserJwtToken,
  verifyUserJwtToken,
} = require("../utils/jwtUtils");
const logger = require("../utils/logger");

const registerUserService = async (userData) => {
  logger.info("Starting user registration", {
    email: userData.email,
    name: userData.name,
  });
  // Email, username and password are required
  const { email, name, password } = userData;
  if (!email || !name || !password) {
    throw new AppError("Email, name, and password are required", 400);
  }
  const userName =
    userData.userName ||
    uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      style: "capital",
      separator: " ",
    });

  // Check if the user already exists
  const existingUser = await User.find({ email });
  if (existingUser.length > 0) {
    throw new AppError(
      "User already exists with this email. Please login.",
      409
    );
  }

  // Validate the email format
  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }
  // Validate the password length
  if (!isValidPassword(password)) {
    throw new AppError(
      "Password must be 8+ characters, include uppercase, lowercase, number & special character.",
      400
    );
  }
  // Validate the name length
  if (name.length < 3) {
    throw new AppError("Name must be at least 3 characters long", 400);
  }
  // hash the password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password?.toString(), saltRounds);

  // Create a new user
  const newUser = {
    email,
    name,
    password: hashedPassword,
    userName,
  };
  try {
    const user = new User(newUser);
    const { _id, userId } = await user.save();
    logger.info("User registration completed", {
      _id,
      userId,
      email: user.email,
      userName,
    });
    const token = generateUserJwtToken(user, "1h");
    // Send verification email
    await sendVerificationEmailService(email);
    return { token, email, name, userName, userId, _id };
  } catch (error) {
    throw new AppError("Error registering user: " + error.message, 400, error);
  }
};

const loginUserService = async (email, password) => {
  logger.info("Processing login request", { email });
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  // Check if the user exists
  const user = await User.find(
    { email },
    "email name role userId password id userName isEmailVerified isActive"
  );
  if (user.length === 0) {
    throw new AppError("User not found with this email", 404);
  }
  // validate multiple users with same email
  if (user.length > 1) {
    throw new AppError("Multiple users found with the same email", 409);
  }
  // Compare the password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(
    password?.toString(),
    user[0].password
  );
  if (!isPasswordValid) {
    throw new AppError("Invalid password", 401);
  }

  // Check if user's email is verified
  if (!user[0].isEmailVerified) {
    logger.info(
      "Unverified user attempting login, sending verification email",
      {
        email,
        userId: user[0].userId,
      }
    );

    // Send verification email automatically
    try {
      await sendVerificationEmailService(email);
      throw new AppError(
        "Please verify your email before logging in. We've sent a new verification email to your inbox.",
        403,
        null,
        { requiresEmailVerification: true, email }
      );
    } catch (verificationError) {
      // If it's our custom error about email verification, throw it
      if (verificationError.statusCode === 403) {
        throw verificationError;
      }
      // If verification email sending failed, throw original error with context
      throw new AppError(
        "Please verify your email before logging in. Unable to send verification email at this time.",
        403,
        verificationError,
        { requiresEmailVerification: true, email }
      );
    }
  }

  // If the user exists, password is valid, and email is verified, return the user data
  const { name, role, userId, userName, _id } = user[0] || {};
  logger.info("User login completed", { email, userId });
  const token = generateUserJwtToken(user[0], "24h");
  return {
    token,
    email,
    name,
    role,
    userId,
    userName,
    _id,
  };
};

const sendVerificationEmailService = async (email) => {
  logger.info("Initiating email verification", { email });
  if (!email) {
    throw new AppError("Email is required to send verification email", 401);
  }
  // Check if the user exists with the provided email
  const userExists = await User.findOne(
    { email },
    "email isActive isEmailVerified verificationEmailLastSent"
  );
  if (!userExists) {
    throw new AppError(`User with email ${email} does not exist`, 404);
  }
  // Check if the user is already verified
  if (userExists.isEmailVerified) {
    throw new AppError(`User with email ${email} is already verified`, 409);
  }
  // Check if the verification email was sent in the last 10 mins
  const currentTime = moment().toDate();
  const lastSentTime = userExists.verificationEmailLastSent
    ? moment(userExists.verificationEmailLastSent).toDate()
    : null;
  logger.debug("Checking verification email timing", {
    email,
    lastSentTime,
    currentTime,
    timeDiffMinutes: lastSentTime
      ? (currentTime - lastSentTime) / (60 * 1000)
      : null,
  });
  if (
    lastSentTime &&
    currentTime - lastSentTime < 10 * 60 * 1000 // 10 minutes in milliseconds
  ) {
    throw new AppError(
      `Verification email was already sent to ${email} in the last 10 minutes`,
      401
    );
  }
  // Update the last sent time for the verification email
  await User.findOneAndUpdate(
    { email },
    { verificationEmailLastSent: currentTime },
    { new: true } // Return the updated user
  );
  const token = generateUserJwtToken({ email }, "10m");
  logger.debug("Generated verification token", {
    email,
    tokenPreview: token.substring(0, 10) + "...",
  });

  const verificationUrl = `${process.env.UI_URL}/verify-email?token=${token}`;
  logger.debug("Verification URL generated", { email });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email",
    //     text: `Click here to verify your email: ${verificationUrl}. This link expires in 10 minutes.`,
    html: `Click <a href="${verificationUrl}">here</a> to verify your email. This link expires in 10 minutes.`,
    headers: {
      "X-Priority": "1", // Highest priority
      "X-MSMail-Priority": "High", // For Outlook
      Importance: "high", // Standard header
    },
  };
  // Call the email service to send the email
  await sendEmailService(mailOptions);
  logger.info("Verification email sent successfully", { email });
};

const verifyEmailService = async (token) => {
  logger.info("Processing email verification", {
    tokenPreview: token ? token.substring(0, 10) + "..." : "null",
  });
  if (!token) {
    throw new AppError("Token is required for email verification", 401);
  }
  try {
    // const decoded = jwt.verify(token, process.env.USER_JWT_SECRET);
    const decoded = verifyUserJwtToken(token);
    // check if the token has expired
    if (!decoded || !decoded?.email) {
      throw new AppError("Invalid token", 401);
    }
    const { email } = decoded;
    logger.debug("Token decoded successfully", { email });

    // Check if the user exists with the provided email and is not already verified
    const userExists = await User.findOne(
      { email },
      "email isActive isEmailVerified"
    );
    if (!userExists) {
      throw new AppError(`User with email ${email} does not exist`, 404);
    }
    if (userExists.isEmailVerified) {
      throw new AppError(`User with email ${email} is already verified`, 409);
    }

    // Find the user by email and update their isActive status to true and isEmailVerified to true
    const user = await User.findOneAndUpdate(
      { email },
      { isActive: true, isEmailVerified: true },
      { new: true } // Return the updated user
    );

    logger.info("Email verification completed", {
      email: user.email,
      userId: user.userId,
    });
    const tokenResponse = generateUserJwtToken(user, "24h");
    return tokenResponse;
  } catch (error) {
    logger.error("Email verification failed", { error });
    throw new AppError("Invalid or expired token", 401, error);
  }
};

const forgotPasswordService = async (email) => {
  logger.info("Processing forgot password request", { email });
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  // Check if user exists
  const user = await User.findOne({ email }, "email name isEmailVerified");
  if (!user) {
    // For security, don't reveal if email exists or not
    logger.warn("Forgot password attempt for non-existent email", { email });
    return {
      message:
        "If an account with this email exists, you will receive a password reset email.",
    };
  }

  // Generate reset token
  const resetToken = generateUserJwtToken({ email }, "1h");

  // Store reset token hash in database (optional - for additional security)
  await User.findOneAndUpdate(
    { email },
    {
      passwordResetToken: resetToken,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
    { new: true }
  );

  logger.info("Password reset token generated", {
    email,
    tokenPreview: resetToken.substring(0, 10) + "...",
  });

  // Send reset email
  const resetUrl = `${process.env.UI_URL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <br>
      <p>Best regards,<br>Shadow Team</p>
    `,
    headers: {
      "X-Priority": "1",
      "X-MSMail-Priority": "High",
      Importance: "high",
    },
  };

  await sendEmailService(mailOptions);
  logger.info("Password reset email sent", { email });

  return {
    message:
      "If an account with this email exists, you will receive a password reset email.",
  };
};

const resetPasswordService = async (token, newPassword) => {
  logger.info("Processing password reset", {
    tokenPreview: token ? token.substring(0, 10) + "..." : "null",
  });

  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }

  // Validate new password
  if (!isValidPassword(newPassword)) {
    throw new AppError(
      "Password must be 8+ characters, include uppercase, lowercase, number & special character.",
      400
    );
  }

  try {
    // Verify the reset token
    const decoded = verifyUserJwtToken(token);
    if (!decoded || !decoded.email) {
      throw new AppError("Invalid or expired reset token", 401);
    }

    const { email } = decoded;

    // Find user and check if token is still valid
    const user = await User.findOne({
      email,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError("Invalid or expired reset token", 401);
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      newPassword.toString(),
      saltRounds
    );

    // Update password and clear reset token
    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        isActive: true, // Activate account if password reset
        isEmailVerified: true, // Consider email verified if they can reset password
      },
      { new: true }
    );

    logger.info("Password reset completed", { email });

    return {
      message:
        "Password has been reset successfully. You can now login with your new password.",
    };
  } catch (error) {
    logger.error("Password reset failed", { error });
    if (error.statusCode) {
      throw error;
    }
    throw new AppError("Invalid or expired reset token", 401, error);
  }
};

module.exports = {
  registerUserService,
  loginUserService,
  sendVerificationEmailService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
};
