import { faCheckCircle, faExclamationTriangle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { khaltiAPI, stripeAPI } from "../utils/api.js";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const pidx = searchParams.get("pidx");
    const purchaseOrderId = searchParams.get("purchase_order_id");
    const urlProvider = searchParams.get("provider");
    const urlStatus = searchParams.get("status");

    const isStripe = urlProvider === "stripe" || !!sessionId;

    if (isStripe) {
      setProvider("stripe");

      if (!sessionId || !purchaseOrderId) {
        setStatus("failed");
        setMessage("Invalid return URL: missing Stripe payment parameters");
        return;
      }

      if (urlStatus === "cancelled") {
        setStatus("failed");
        setMessage("Payment was cancelled");
        return;
      }

      (async () => {
        try {
          const res = await stripeAPI.verify(sessionId, purchaseOrderId);
          if (res?.success) {
            setStatus("success");
            setMessage(res.message || "Payment verified successfully");
            setDetails(res.data);
          } else {
            setStatus("failed");
            setMessage(res?.message || "Payment could not be verified");
          }
        } catch (err) {
          setStatus("failed");
          setMessage(err?.message || "Verification failed. Please check your dashboard.");
        }
      })();
    } else {
      setProvider("khalti");

      if (!pidx || !purchaseOrderId) {
        setStatus("failed");
        setMessage("Invalid return URL: missing payment parameters");
        return;
      }

      (async () => {
        try {
          const res = await khaltiAPI.verify(pidx, purchaseOrderId);
          if (res?.success) {
            setStatus("success");
            setMessage(res.message || "Payment verified successfully");
            setDetails(res.data);
          } else {
            setStatus("failed");
            setMessage(res?.message || urlStatus || "Payment could not be verified");
          }
        } catch (err) {
          setStatus("failed");
          setMessage(err?.message || "Verification failed. Please check your dashboard.");
        }
      })();
    }
  }, [searchParams]);

  const currencyLabel = provider === "stripe" ? "$" : "Rs.";

  return (
    <main className="min-h-screen bg-[#05070b]">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        {status === "loading" && (
          <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center">
              <FontAwesomeIcon icon={faSpinner} className="h-16 w-16 text-orange-500 animate-spin" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">Verifying payment…</h1>
            <p className="mt-3 text-white/70">
              Please wait while we confirm your payment{provider ? ` with ${provider === "stripe" ? "Stripe" : "Khalti"}` : ""}.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="w-full rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <FontAwesomeIcon icon={faCheckCircle} className="h-12 w-12 text-emerald-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">Payment successful</h1>
            <p className="mt-3 text-white/80">{message}</p>
            {details?.amount != null && (
              <p className="mt-2 text-lg font-semibold text-emerald-400">
                {currencyLabel} {Number(details.amount).toLocaleString()}
              </p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                state={{ refreshBookings: true }}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                Go to dashboard
              </Link>
              <Link
                to="/vehicles"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Browse vehicles
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="w-full rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12 text-red-400" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">Payment incomplete</h1>
            <p className="mt-3 text-white/80">{message}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                Go to dashboard
              </Link>
              <Link
                to="/vehicles"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Browse vehicles
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default PaymentReturn;
