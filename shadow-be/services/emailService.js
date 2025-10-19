const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const sendEmailService = async (mailOptions) => {
  const { to: email, subject, html } = mailOptions;
  logger.info("Initiating email send", { email, subject });

  // // Validate required fields
  // if (!email || !subject || !html) {
  //   throw new Error("Email, subject, and html content are required");
  // }

  // Validate environment variables
  if (
    !process.env.EMAIL_SERVICE ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    logger.error("Email service configuration missing", {
      hasService: !!process.env.EMAIL_SERVICE,
      hasUser: !!process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASSWORD,
    });
    throw new Error("Email service not properly configured");
  }


  // Create a transporter object using SMTP
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Test the connection first
    await transporter.verify();
    logger.info("Email transporter verified successfully");

    // Send the email using async/await
    const info = await transporter.sendMail(mailOptions);

    logger.info("Email sent successfully", {
      email,
      subject,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return info;
  } catch (error) {
    logger.error("Email sending failed", {
      error: error.message,
      email,
      subject,
      errorCode: error.code,
      errorCommand: error.command,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = {
  sendEmailService,
};
