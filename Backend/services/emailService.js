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

/**
 * Send "new vehicle submitted for review" to admin
 * @param {string} adminEmail
 * @param {string} vehicleName - e.g. "Honda City"
 * @param {string} [ownerName] - e.g. "John Doe"
 * @returns {Promise<Object>}
 */
const sendNewVehicleSubmittedToAdmin = async (adminEmail, vehicleName, ownerName = "An owner") => {
  try {
    const transporter = createTransporter();
    const subject = "New Vehicle Submitted for Review - AutoRent";
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Vehicle</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333;">New Vehicle Submitted for Review</h2>
          <p><strong>${vehicleName}</strong> has been submitted by <strong>${ownerName}</strong> and is pending your approval.</p>
          <p>Please log in to the Admin Dashboard to review and approve or reject this vehicle.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email from AutoRent.</p>
        </div>
      </body>
      </html>
    `;
    const text = `New Vehicle Submitted for Review\n\n${vehicleName} has been submitted by ${ownerName}. Please log in to the Admin Dashboard to review.`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending new vehicle notification to admin:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send "vehicle approved" to owner
 * @param {string} ownerEmail
 * @param {string} vehicleName
 * @returns {Promise<Object>}
 */
const sendVehicleApprovedToOwner = async (ownerEmail, vehicleName) => {
  try {
    const transporter = createTransporter();
    const subject = "Your Vehicle Has Been Approved - AutoRent";
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Vehicle Approved</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #16a34a;">Your Vehicle Has Been Approved</h2>
          <p>Good news! <strong>${vehicleName}</strong> has been approved by our admin and is now listed for rent.</p>
          <p>Renters can now view and book your vehicle from the platform.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email from AutoRent.</p>
        </div>
      </body>
      </html>
    `;
    const text = `Your vehicle "${vehicleName}" has been approved and is now listed for rent.`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ownerEmail,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending vehicle approved to owner:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send "vehicle rejected" to owner
 * @param {string} ownerEmail
 * @param {string} vehicleName
 * @param {string} [reason] - optional rejection reason
 * @returns {Promise<Object>}
 */
const sendVehicleRejectedToOwner = async (ownerEmail, vehicleName, reason = "") => {
  try {
    const transporter = createTransporter();
    const subject = "Vehicle Not Approved - AutoRent";
    const reasonBlock = reason ? `<p><strong>Reason:</strong> ${reason}</p>` : "";
    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Vehicle Not Approved</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #dc2626;">Vehicle Not Approved</h2>
          <p>Unfortunately, <strong>${vehicleName}</strong> was not approved for listing at this time.</p>
          ${reasonBlock}
          <p>You can log in to your Owner Dashboard to view details or submit a new vehicle.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated email from AutoRent.</p>
        </div>
      </body>
      </html>
    `;
    const text = `Your vehicle "${vehicleName}" was not approved.${reason ? ` Reason: ${reason}` : ""} Log in to your dashboard for more details.`;
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: ownerEmail,
      subject,
      html,
      text,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending vehicle rejected to owner:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export {
  sendNewVehicleSubmittedToAdmin,
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendVehicleApprovedToOwner,
  sendVehicleRejectedToOwner,
  verifyMailConnection,
};

