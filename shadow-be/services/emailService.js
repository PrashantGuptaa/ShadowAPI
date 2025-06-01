const nodemailer = require("nodemailer");

const sendEmailService = async (mailOptions) => {
  const { to: email, subject, html } = mailOptions;
  console.info("Sending email to:", email);
//   if (!email || !subject || !html) {
//     throw new Error("Email, subject, and text are required");
//   }

  // Create a transporter object using SMTP
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Step 3: Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error:", error);
    }
    console.log("Email sent:", info.response);
  });
};

module.exports = {
  sendEmailService,
};
