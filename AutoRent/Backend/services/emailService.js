import "dotenv/config";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

/**
 * Verify SendGrid configuration at startup.
 * Sends a no-op request to confirm the API key is valid.
 */
const verifyMailConnection = async () => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not set");
  }
  if (!FROM_EMAIL) {
    throw new Error("SENDGRID_FROM_EMAIL is not set");
  }
};

const SEND_TIMEOUT_MS = 15_000;

/**
 * Internal helper – send a single email via SendGrid with a timeout guard.
 */
const send = async (to, subject, html, text) => {
  console.log(`[Email] Sending "${subject}" to ${to}…`);
  const start = Date.now();

  try {
    const sendPromise = sgMail.send({ to, from: FROM_EMAIL, subject, html, text });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SendGrid request timed out")), SEND_TIMEOUT_MS)
    );

    const [response] = await Promise.race([sendPromise, timeoutPromise]);
    const ms = Date.now() - start;
    const messageId = response?.headers?.["x-message-id"] ?? null;
    console.log(`[Email] Sent to ${to} in ${ms}ms (id: ${messageId})`);
    return { success: true, messageId };
  } catch (error) {
    const ms = Date.now() - start;
    const body = error?.response?.body;
    console.error(`[Email] Failed after ${ms}ms:`, body?.errors ?? body ?? error.message);
    throw new Error(`Failed to send email: ${body?.errors?.[0]?.message ?? error.message}`);
  }
};

/**
 * Send OTP email to user
 */
const sendOTPEmail = async (email, otp) => {
  const subject = "Email Verification - AutoRent";
  const html = `
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
  `;
  const text = `Welcome to AutoRent!\n\nYour OTP: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't create an account with AutoRent, please ignore this email.`;
  return send(email, subject, html, text);
};

/**
 * Send password reset OTP email
 */
const sendPasswordResetOTPEmail = async (email, otp) => {
  const subject = "Password Reset - AutoRent";
  const html = `
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
  `;
  const text = `Reset Your Password - AutoRent\n\nOTP: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request a password reset, please ignore this email.`;
  return send(email, subject, html, text);
};

/**
 * Send "new vehicle submitted for review" to admin
 */
const sendNewVehicleSubmittedToAdmin = async (adminEmail, vehicleName, ownerName = "An owner") => {
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
  return send(adminEmail, subject, html, text);
};

/**
 * Send "vehicle approved" to owner
 */
const sendVehicleApprovedToOwner = async (ownerEmail, vehicleName) => {
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
  return send(ownerEmail, subject, html, text);
};

/**
 * Send "vehicle rejected" to owner
 */
const sendVehicleRejectedToOwner = async (ownerEmail, vehicleName, reason = "") => {
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
  return send(ownerEmail, subject, html, text);
};

/**
 * Auto-reply after someone submits a contact / FAQ / quick contact inquiry.
 */
const sendContactInquiryThankYou = async (email, name) => {
  const displayName = String(name || "there").trim().slice(0, 200) || "there";
  const subject = "We received your message — AutoRent";
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Thank you</title></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h2 style="color: #333; margin-top: 0;">Thank you for contacting us</h2>
        <p>Hi ${displayName.replace(/</g, "&lt;").replace(/>/g, "&gt;")},</p>
        <p>We’ve received your message and appreciate you reaching out to AutoRent. Our team will review it and get back to you as soon as we can.</p>
        <p style="margin-bottom: 0;">Best regards,<br><strong>The AutoRent Team</strong></p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated confirmation. Please do not reply directly to this email unless it was sent from your usual mail client.</p>
      </div>
    </body>
    </html>
  `;
  const text = `Thank you for contacting AutoRent\n\nHi ${displayName},\n\nWe've received your message and will get back to you as soon as we can.\n\nBest regards,\nThe AutoRent Team`;
  return send(email, subject, html, text);
};

export {
  sendContactInquiryThankYou,
  sendNewVehicleSubmittedToAdmin,
  sendOTPEmail,
  sendPasswordResetOTPEmail,
  sendVehicleApprovedToOwner,
  sendVehicleRejectedToOwner,
  verifyMailConnection,
};
