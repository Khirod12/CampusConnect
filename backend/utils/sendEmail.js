const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      family: 4,   // 👈 VERY IMPORTANT (forces IPv4)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });

    console.log("Email sent successfully");

  } catch (error) {
    console.log("Email error:", error);
  }
};

module.exports = sendEmail;
