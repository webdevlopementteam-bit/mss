import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_MAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const buildOtpEmailHtml = (title, otp, note) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #111;">${title}</h2>
    <p style="color: #444; font-size: 15px;">${note}</p>
    <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 16px; background: #f5f5f5; border-radius: 6px; margin: 20px 0;">
      ${otp}
    </div>
    <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
  </div>
`;

export const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.GOOGLE_MAIL,
    to,
    subject,
    html,
  });
};

export const sendVerificationOtpEmail = (to, otp) => {
  return sendEmail({
    to,
    subject: "Verify your email — OTP inside",
    html: buildOtpEmailHtml(
      "Verify your email",
      otp,
      "Use the code below to verify your email address."
    ),
  });
};

export const sendResendOtpEmail = (to, otp) => {
  return sendEmail({
    to,
    subject: "Your new verification code",
    html: buildOtpEmailHtml(
      "Your new code",
      otp,
      "Here is the new verification code you requested."
    ),
  });
};

export const sendForgotPasswordOtpEmail = (to, otp) => {
  return sendEmail({
    to,
    subject: "Password reset code",
    html: buildOtpEmailHtml(
      "Reset your password",
      otp,
      "Use the code below to reset your password."
    ),
  });
};
