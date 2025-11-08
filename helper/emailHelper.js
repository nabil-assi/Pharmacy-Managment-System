const nodemailer = require("nodemailer");
require("dotenv").config();
let transporter;

function initEmailTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail(to, subject, html) {
  try {
    const transporter = initEmailTransporter();

    const mailOptions = {
      from: `"Pharmacy System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

module.exports = { sendEmail };
