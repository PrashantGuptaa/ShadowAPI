const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const sendEmailService = async (mailOptions) => {
  const { to: email, subject, html } = mailOptions;
  logger.info("Initiating email send", { email, subject });
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
      logger.error("Email sending failed", { error, email, subject });
      return;
    }
    logger.info("Email sent successfully", {
      email,
      subject,
      messageId: info.messageId,
      response: info.response
    });
  });
};

module.exports = {
  sendEmailService,
};
