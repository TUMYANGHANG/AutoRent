/**
 * Khalti payment gateway service (sandbox/production).
 * Uses KHALTI_SECRET_KEY and KHALTI_BASE_URL from env.
 */

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = (process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2").replace(
  /\/$/,
  ""
);

/**
 * Initiate Khalti ePayment. Returns { pidx, payment_url, expires_at, expires_in }.
 * @param {Object} params
 * @param {string} params.returnUrl - URL Khalti redirects to after payment
 * @param {string} params.websiteUrl - Merchant website URL
 * @param {number} params.amount - Amount in paisa (Rs 10 = 1000 paisa)
 * @param {string} params.purchaseOrderId - Unique order/booking ID
 * @param {string} params.purchaseOrderName - Order/booking name
 * @param {Object} [params.customerInfo] - { name, email, phone }
 */
export const initiatePayment = async ({
  returnUrl,
  websiteUrl,
  amount,
  purchaseOrderId,
  purchaseOrderName,
  customerInfo,
}) => {
  if (!KHALTI_SECRET_KEY) {
    const err = new Error("Khalti is not configured. Set KHALTI_SECRET_KEY in .env");
    err.code = "CONFIG_ERROR";
    throw err;
  }

  const amountPaisa = Math.round(Number(amount) * 100);
  if (amountPaisa < 1000) {
    const err = new Error("Amount must be at least Rs 10 (1000 paisa)");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const payload = {
    return_url: returnUrl,
    website_url: websiteUrl,
    amount: amountPaisa,
    purchase_order_id: purchaseOrderId,
    purchase_order_name: purchaseOrderName,
    ...(customerInfo && { customer_info: customerInfo }),
  };

  const res = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.detail || data?.return_url?.[0] || data?.amount?.[0] || JSON.stringify(data);
    const err = new Error(msg || "Khalti initiate failed");
    err.code = "KHALTI_ERROR";
    throw err;
  }

  return data;
};

/**
 * Lookup payment status by pidx. Returns { pidx, total_amount, status, transaction_id, fee, refunded }.
 */
export const lookupPayment = async (pidx) => {
  if (!KHALTI_SECRET_KEY) {
    const err = new Error("Khalti is not configured. Set KHALTI_SECRET_KEY in .env");
    err.code = "CONFIG_ERROR";
    throw err;
  }

  const res = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data?.detail || "Khalti lookup failed");
    err.code = "KHALTI_ERROR";
    throw err;
  }

  return data;
};
