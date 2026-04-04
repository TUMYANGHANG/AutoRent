const MAX_ATTACHMENT_URL = 2000;

/**
 * POST /chat/conversations
 */
export const validateChatConversationCreate = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};

  if (!b.targetUserId || typeof b.targetUserId !== "string" || !b.targetUserId.trim()) {
    errors.push("targetUserId is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  next();
};

/**
 * POST /chat/conversations/:id/messages
 */
export const validateChatMessageBody = (req, res, next) => {
  const errors = [];
  const b = req.body ?? {};
  const hasText = b.text && String(b.text).trim();
  const hasAttachment = b.attachmentUrl && String(b.attachmentUrl).trim();

  if (!hasText && !hasAttachment) {
    errors.push("Message text or attachmentUrl is required");
  }

  if (b.attachmentUrl !== undefined && b.attachmentUrl !== null && b.attachmentUrl !== "") {
    if (typeof b.attachmentUrl !== "string") {
      errors.push("attachmentUrl must be a string");
    } else if (b.attachmentUrl.length > MAX_ATTACHMENT_URL) {
      errors.push(`attachmentUrl must be at most ${MAX_ATTACHMENT_URL} characters`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  next();
};

/**
 * GET /chat/conversations/:id/messages?limit=
 */
export const validateMessagesQuery = (req, res, next) => {
  const lim = req.query?.limit;
  if (lim === undefined || lim === "") return next();

  const n = Number(lim);
  if (Number.isNaN(n) || !Number.isInteger(n) || n < 1 || n > 100) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: ["limit must be an integer between 1 and 100"],
    });
  }
  next();
};
