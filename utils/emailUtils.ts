// utils/emailUtils.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or any other email service
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Signup',
    text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};
