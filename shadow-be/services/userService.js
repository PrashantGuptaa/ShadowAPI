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

const registerUserService = async (userData) => {
  console.info("Registering user with data:", userData);
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
    console.info("User registered successfully:", _id, userId, user.email);
    const token = generateUserJwtToken(user, "1h");
    // Send verification email
    await sendVerificationEmailService(email);
    return { token, email, name, userName, userId, _id };
  } catch (error) {
    throw new AppError("Error registering user: " + error.message, 400);
  }
};

const loginUserService = async (email, password) => {
  console.info("Login attempt for email:", email);
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }
  // Check if the user exists
  const user = await User.find(
    { email },
    "email name role userId password id userName"
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
  // If the user exists and the password is valid, return the user data
  const { name, role, userId, userName, _id } = user[0] || {};
  console.info("User logged in successfully:", email);
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
  console.info("Sending verification email to:", email);
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
  console.info(
    "Last sent time for verification email:",
    lastSentTime,
    "Current time:",
    currentTime
  );
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
  console.info("Generated token for email verification:", token);

  const verificationUrl = `${process.env.FE_APP_URL}verify-email?token=${token}`;
  console.info("Verification URL:", verificationUrl);
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
  console.info("Verification email sent to:", email);
};

const verifyEmailService = async (token) => {
  console.info("Verifying email with token:", token);
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
    console.info("Decoded email from token:", email);

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

    console.info("Email verified successfully for user:", user.email);
    const tokenResponse = generateUserJwtToken(user, "24h");
    return tokenResponse;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw new AppError("Invalid or expired token", 401);
  }
};

module.exports = {
  registerUserService,
  loginUserService,
  sendVerificationEmailService,
  verifyEmailService,
};
