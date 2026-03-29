import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

console.log(`[Stripe] Secret key: ${STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.slice(0, 12) + "…" : "NOT SET"}`);

/**
 * Create a Stripe Checkout Session.
 * @returns {{ sessionId: string, checkoutUrl: string }}
 */
export const createCheckoutSession = async ({
  successUrl,
  cancelUrl,
  amount,
  currency = "usd",
  bookingId,
  productName,
  customerEmail,
}) => {
  if (!stripe) {
    const err = new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
    err.code = "CONFIG_ERROR";
    throw err;
  }

  const amountCents = Math.round(Number(amount) * 100);
  if (amountCents < 50) {
    const err = new Error("Amount must be at least $0.50 (50 cents)");
    err.code = "VALIDATION_ERROR";
    throw err;
  }

  const separator = successUrl.includes("?") ? "&" : "?";
  const fullSuccessUrl = `${successUrl}${separator}session_id={CHECKOUT_SESSION_ID}&provider=stripe&purchase_order_id=${bookingId}`;
  const fullCancelUrl = `${cancelUrl}${cancelUrl.includes("?") ? "&" : "?"}status=cancelled&provider=stripe&purchase_order_id=${bookingId}`;

  console.log(`[Stripe] Creating checkout session:`, { amount: amountCents, currency, bookingId });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: productName || "Vehicle Rental" },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId },
      ...(customerEmail && { customer_email: customerEmail }),
      success_url: fullSuccessUrl,
      cancel_url: fullCancelUrl,
    });

    console.log(`[Stripe] Session created – id: ${session.id}`);
    return { sessionId: session.id, checkoutUrl: session.url };
  } catch (error) {
    console.error(`[Stripe] Create session FAILED:`, error.message);
    const err = new Error(error.message || "Stripe checkout session creation failed");
    err.code = "STRIPE_ERROR";
    throw err;
  }
};

/**
 * Retrieve a Stripe Checkout Session to verify payment.
 * @returns {{ status, paymentStatus, paymentIntent, amountTotal, currency }}
 */
export const retrieveSession = async (sessionId) => {
  if (!stripe) {
    const err = new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
    err.code = "CONFIG_ERROR";
    throw err;
  }

  console.log(`[Stripe] Retrieving session: ${sessionId}`);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`[Stripe] Session status: ${session.status}, payment: ${session.payment_status}`);
    return {
      status: session.status,
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    };
  } catch (error) {
    console.error(`[Stripe] Retrieve FAILED:`, error.message);
    const err = new Error(error.message || "Stripe session lookup failed");
    err.code = "STRIPE_ERROR";
    throw err;
  }
};
