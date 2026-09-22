const nodemailer = require("nodemailer")
require('dotenv').config();



const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth:{
        user : process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

const sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"My Commerce" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email - OTP Code",
    html: `<h2>Your OTP code is: ${otp}</h2><p>Expires in 10 minutes.</p>`,
  });
};


module.exports = sendOTPEmail;