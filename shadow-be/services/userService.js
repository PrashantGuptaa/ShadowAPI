const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

const registerUserService = async (userData) => {
  console.info("Registering user with data:", userData);
  // Email, username and password are required
  const { email, name, password } = userData;
  if (!email || !name || !password) {
    throw new Error("Email, name, and password are required");
  }
  const userName =
    userData.userName ||
    uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "_",
      style: "capital",
    });

  // Check if the user already exists
  const existingUser = await User.find({ email });
  if (existingUser.length > 0) {
    throw new Error("User already exists with this email");
  }

  // Validate the email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }
  // Validate the password length
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  // Validate the name length
  if (name.length < 3) {
    throw new Error("Name must be at least 3 characters long");
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
    const { _id, id } = await user.save();
    console.info("User registered successfully:", _id, id, user, user.email);
    const token = jwt.sign({ _id, id }, process.env.USER_JWT_SECRET, {
      expiresIn: "1h", // optional
    });
    return { token, email, name, userName, id, _id };
  } catch (error) {
    throw new Error("Error registering user: " + error.message);
  }
};

const loginUserService = async (email, password) => {
  console.info("Login attempt for email:", email);
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  // Check if the user exists
  const user = await User.find(
    { email },
    "email name role userId password id userName"
  );
  if (user.length === 0) {
    throw new Error("User not found with this email");
  }
  // validate multiple users with same email
  if (user.length > 1) {
    throw new Error("Multiple users found with the same email");
  }
  // Compare the password with the hashed password in the database
  const isPasswordValid = await bcrypt.compare(
    password?.toString(),
    user[0].password
  );
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }
  // If the user exists and the password is valid, return the user data
  const { name, role, userId, id, userName, _id } = user[0] || {};
  console.info("User logged in successfully:", email);
  const token = jwt.sign({ _id, id }, process.env.USER_JWT_SECRET, {
    expiresIn: "1h", // optional
  });
  return {
    token,
    email,
    name,
    role,
    id,
    userName,
    _id,
  };
};

module.exports = {
  registerUserService,
  loginUserService,
};
