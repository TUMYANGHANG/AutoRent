import sgMail from "@sendgrid/mail";
import "dotenv/config";
import { OTP_EXPIRY_MINUTES } from "./otpService.js";

const API_KEY = process.env.SENDGRID_API_KEY?.trim();
if (API_KEY) {
  sgMail.setApiKey(API_KEY);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parse SENDGRID_FROM_EMAIL: "you@domain.com" or "AutoRent <you@domain.com>".
 * SendGrid expects { email, name } — a single string with angle brackets is unreliable.
 */
function parseSendGridFrom(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  const angle = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (angle) {
    const name = angle[1].trim().replace(/^["']|["']$/g, "");
    const email = angle[2].trim();
    if (!EMAIL_RE.test(email)) return null;
    return { email, name };
  }
  if (EMAIL_RE.test(trimmed)) {
    return { email: trimmed };
  }
  return null;
}

function getMailFrom() {
  const parsed = parseSendGridFrom(process.env.SENDGRID_FROM_EMAIL);
  if (!parsed) {
    throw new Error(
      "Invalid SENDGRID_FROM_EMAIL — use an email or \"Name <email@domain.com>\" (sender must be verified in SendGrid)"
    );
  }
  return parsed.name
    ? { email: parsed.email, name: parsed.name }
    : parsed.email;
}

/**
 * Verify SendGrid: env present, from-address parseable, API key accepted by SendGrid.
 */
const verifyMailConnection = async () => {
  if (!API_KEY) {
    throw new Error("SENDGRID_API_KEY is not set");
  }
  getMailFrom();

  const res = await fetch("https://api.sendgrid.com/v3/user/profile", {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `SendGrid rejected this API key (HTTP ${res.status}). Check the key in SendGrid → API Keys. ${body.slice(0, 160)}`
    );
  }
  const from = parseSendGridFrom(process.env.SENDGRID_FROM_EMAIL);
  console.log(
    `[Email] SendGrid OK — sending as ${from?.name ? `"${from.name}" ` : ""}<${from?.email}>`
  );
};

const SEND_TIMEOUT_MS = (() => {
  const v = Number(process.env.SEND_TIMEOUT_MS);
  if (Number.isFinite(v) && v >= 5_000 && v <= 60_000) return Math.floor(v);
  return 30_000; // enforce max wait target for send request
})();

/**
 * Internal helper – send a single email via SendGrid with a timeout guard.
 */
const send = async (to, subject, html, text, options = {}) => {
  console.log(`[Email] Sending "${subject}" to ${to}…`);
  const start = Date.now();

  try {
    const from = getMailFrom();
    const msg = {
      to,
      from,
      subject,
      html,
      text,
      // Default: transactional-style (callers can override via options).
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "High",
        "X-Auto-Response-Suppress": "All",
      },
      ...options,
    };
    const sendPromise = sgMail.send(msg);
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
const otpSendOptions = {
  // Helps SendGrid treat the message as transactional (and can improve inbox timing vs marketing).
  categories: ["otp"],
  mailSettings: {
    bypassListManagement: { enable: true },
  },
};

const sendOTPEmail = async (email, otp) => {
  // Avoid putting the raw code in the subject — some providers score that as spam/phish.
  const subject = "Your AutoRent verification code";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP Code</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2 style="color: #111; margin-top: 0;">AutoRent verification code</h2>
        <p>Use this one-time password to verify your email:</p>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; text-align: center; margin: 16px 0;">
          <h1 style="color: #111; font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p>If you did not request this code, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 18px 0;">
        <p style="color: #6b7280; font-size: 12px;">Automated transactional message from AutoRent.</p>
      </div>
    </body>
    </html>
  `;
  const text = `AutoRent verification code\n\nOTP: ${otp}\n\nThis OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this code, ignore this email.`;
  return send(email, subject, html, text, otpSendOptions);
};

/**
 * Send password reset OTP email
 */
const sendPasswordResetOTPEmail = async (email, otp) => {
  const subject = "AutoRent password reset — verification code";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password reset code</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 560px; margin: 0 auto; padding: 20px;">
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2 style="color: #111; margin-top: 0;">AutoRent password reset code</h2>
        <p>Use this one-time password to reset your password:</p>
        <div style="background-color: #f9fafb; padding: 16px; border-radius: 6px; text-align: center; margin: 16px 0;">
          <h1 style="color: #111; font-size: 32px; letter-spacing: 6px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p>If you did not request this code, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 18px 0;">
        <p style="color: #6b7280; font-size: 12px;">Automated transactional message from AutoRent.</p>
      </div>
    </body>
    </html>
  `;
  const text = `AutoRent password reset code\n\nOTP: ${otp}\n\nThis OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.\n\nIf you did not request this code, ignore this email.`;
  return send(email, subject, html, text, otpSendOptions);
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
  verifyMailConnection
};

