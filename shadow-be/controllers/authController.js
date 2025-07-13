const axios = require("axios");

const User = require("../models/userModel");
const { generateUserJwtToken } = require("../utils/jwtUtils");
const { sendError } = require("../utils/response");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

// login user with Google
// /auth/google
const authRedirectWithGoogleController = async (req, res) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=profile%20email&access_type=offline&prompt=consent`;
  res.redirect(redirectUrl);
};

const googleCallbackController = async (req, res) => {
  const code = req.query.code;

  try {
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    // Exchange code for tokens
    const { data } = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { access_token } = data;

    // Fetch user info
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    // save or update user in database
    const {
      email,
      name,
      picture,
      id: googleId,
      verified_email,
    } = userInfo.data;
    // Generate a random userName
    const randomUserName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      style: "capital",
      separator: " ",
    });

    // Find user by email and update or create if doesn't exist
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          picture,
          googleId,
          isEmailVerified: verified_email,
          source: "google",
        },
        // Only set userName if this is a new user
        $setOnInsert: { userName: randomUserName },
      },
      {
        new: true,
        upsert: true,
      }
    );
    const token = generateUserJwtToken(user, "24h");

    res.redirect(`http://localhost:5173/auth/success?token=${token}`);
  } catch (err) {
    sendError(res, {
      message: "Google authentication failed",
      err,
    });
  }
};

module.exports = {
  authRedirectWithGoogleController,
  googleCallbackController,
};
