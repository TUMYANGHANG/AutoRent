import "dotenv/config";
import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Verify SMTP connection (for startup check).
 * @returns {Promise<void>}
 */
const verifyMailConnection = async () => {
  const transporter = createTransporter();
  await transporter.verify();
};

/**
 * Send OTP email to user
 * @param {string} email - User's email address
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} - Email send result
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Email Verification - AutoRent",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-top: 0;">Welcome to AutoRent!</h2>
            <p>Thank you for registering with AutoRent. Please verify your email address by entering the OTP code below:</p>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't create an account with AutoRent, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to AutoRent!
        
        Thank you for registering with AutoRent. Please verify your email address by entering the OTP code below:
        
        OTP: ${otp}
        
        This OTP will expire in 10 minutes.
        
        If you didn't create an account with AutoRent, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send password reset OTP email
 * @param {string} email - User's email address
 * @param {string} otp - OTP code
 * @returns {Promise<Object>} - Email send result
 */
const sendPasswordResetOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Password Reset - AutoRent",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
            <p>You requested a password reset for your AutoRent account. Use the OTP code below to set a new password:</p>
            <div style="background-color: #fff; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <h1 style="color: #f97316; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password - AutoRent

        Use the OTP code below to set a new password:

        OTP: ${otp}

        This OTP will expire in 10 minutes.

        If you didn't request a password reset, please ignore this email.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export {
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  verifyMailConnection,
};

