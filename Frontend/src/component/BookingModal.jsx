import {
  faCalendarCheck,
  faCreditCard,
  faMapMarkerAlt,
  faMoneyBillWave,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { bookingRequestsAPI } from "../utils/api.js";

const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `Rs. ${n.toLocaleString()}`;
};

const BookingModal = ({ vehicle, isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    startDate: "",
    returnDate: "",
    pickupPlace: "",
    dropoffPlace: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(null);

  const id = vehicle?.id;
  const todayStr = new Date().toISOString().split("T")[0];
  const minReturnDate = form.startDate || todayStr;

  const pricePerDay = vehicle ? Number(vehicle.pricePerDay) : 0;
  const securityDeposit = vehicle ? Number(vehicle.securityDeposit) || 0 : 0;
  const days =
    form.startDate && form.returnDate
      ? Math.ceil(
          (new Date(form.returnDate) - new Date(form.startDate)) /
            (1000 * 60 * 60 * 24),
        ) || 1
      : 0;
  const rentalAmount = pricePerDay * Math.max(days, 1);
  const amountToPay = rentalAmount;

  const validateStep1 = () => {
    const err = {};
    if (!form.startDate) err.startDate = "Start date is required";
    if (!form.returnDate) err.returnDate = "Return date is required";
    if (!form.pickupPlace?.trim()) err.pickupPlace = "Pickup place is required";
    if (form.startDate && form.returnDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.returnDate);
      if (start > end)
        err.returnDate = "Return date must be on or after start date";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) err.startDate = "Start date cannot be in the past";
    }
    setFormErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateStep1()) {
      setSubmitError(null);
      setStep(2);
    }
  };

  const handleSubmitRequest = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const res = await bookingRequestsAPI.create({
        vehicleId: id,
        startDate: form.startDate,
        returnDate: form.returnDate,
        pickupPlace: form.pickupPlace.trim(),
        dropoffPlace: form.dropoffPlace?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
      if (res?.success && res?.data) {
        setRequestSuccess(res.data);
      } else {
        setSubmitError(res?.message ?? "Request failed");
      }
    } catch (err) {
      setSubmitError(err?.message ?? "Request failed");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setForm({ startDate: "", returnDate: "", pickupPlace: "", dropoffPlace: "", notes: "" });
      setFormErrors({});
      setSubmitError(null);
      setRequestSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const brand = vehicle?.brand ?? "";
  const model = vehicle?.model ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#05070b] shadow-2xl flex flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#05070b] px-4 py-2.5">
          <h2 className="text-base font-semibold text-white">
            Book {brand} {model}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden p-3">
          {requestSuccess ? (
            <div className="flex h-full flex-col items-center justify-center">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                  <FontAwesomeIcon
                    icon={faCalendarCheck}
                    className="h-6 w-6 text-white"
                  />
                </div>
                <h3 className="mt-2 text-lg font-extrabold text-white">
                  Request sent
                </h3>
                <p className="mt-1 text-sm text-white/70">
                  Your booking request has been sent to the vehicle owner. You
                  will be notified when they respond.
                </p>
                <div className="mt-2 rounded-lg border border-white/10 bg-black/30 p-2.5 text-left">
                  <p className="font-semibold text-white">
                    {requestSuccess.vehicle?.brand} {requestSuccess.vehicle?.model}
                  </p>
                  <p className="mt-1 text-white/70">
                    {requestSuccess.request?.startDate} –{" "}
                    {requestSuccess.request?.returnDate}
                  </p>
                  <p className="mt-1 text-white/70">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="mr-2 h-4 w-4 text-orange-400"
                    />
                    Pickup: {requestSuccess.request?.pickupPlace}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
                  >
                    Go to dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-white/10 bg-black/30 p-2.5">
                <h3 className="text-base font-semibold text-white">
                  {brand} {model}
                </h3>
                <p className="mt-0.5 text-sm text-white/60">
                  {formatPrice(vehicle?.pricePerDay)} per day
                  {vehicle?.securityDeposit != null &&
                    vehicle.securityDeposit > 0 && (
                      <>
                        {" "}
                        · {formatPrice(vehicle.securityDeposit)} security
                        deposit (collateral)
                      </>
                    )}
                </p>
              </div>

              <div className="mt-2 space-y-1 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                {securityDeposit > 0 && (
                  <div>
                    <p className="text-xs font-medium text-amber-200">
                      Security deposit (collateral)
                    </p>
                    <p className="mt-0.5 text-xs text-white/70">
                      The security deposit of {formatPrice(securityDeposit)} is{" "}
                      <strong className="text-white">not a payment</strong> — it
                      is held as collateral and will be{" "}
                      <strong className="text-emerald-400">
                        returned in full when you return the vehicle
                      </strong>{" "}
                      in good condition.
                    </p>
                  </div>
                )}
                {vehicle?.lateFeePerHour != null &&
                  Number(vehicle.lateFeePerHour) > 0 && (
                    <div>
                      <p className="text-xs font-medium text-amber-200">
                        Late return fee
                      </p>
                      <p className="mt-0.5 text-xs text-white/70">
                        If the vehicle is not returned by the expected date/time,
                        a late fee of {formatPrice(vehicle.lateFeePerHour)} per
                        hour will be charged.
                      </p>
                    </div>
                  )}
                {(!securityDeposit || securityDeposit === 0) &&
                  (!vehicle?.lateFeePerHour ||
                    Number(vehicle.lateFeePerHour) === 0) && (
                    <p className="text-xs text-white/70">
                      Return the vehicle on time and in good condition.
                    </p>
                  )}
              </div>

              {step === 1 ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,200px]">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-white">
                      Booking details
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-0.5 block text-xs font-medium text-white/80">
                          Start date *
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={form.startDate}
                          onChange={(e) => {
                            const v = e.target.value;
                            setForm((f) => {
                              const next = { ...f, startDate: v };
                              if (
                                v &&
                                f.returnDate &&
                                new Date(v) > new Date(f.returnDate)
                              )
                                next.returnDate = v;
                              return next;
                            });
                          }}
                          className={`w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            formErrors.startDate
                              ? "border-red-500"
                              : "border-white/20"
                          }`}
                        />
                        {formErrors.startDate && (
                          <p className="mt-0.5 text-xs text-red-400">
                            {formErrors.startDate}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-0.5 block text-xs font-medium text-white/80">
                          Return date *
                        </label>
                        <input
                          type="date"
                          min={minReturnDate}
                          value={form.returnDate}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, returnDate: e.target.value }))
                          }
                          className={`w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:invert focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                            formErrors.returnDate
                              ? "border-red-500"
                              : "border-white/20"
                          }`}
                        />
                        {formErrors.returnDate && (
                          <p className="mt-0.5 text-xs text-red-400">
                            {formErrors.returnDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-medium text-white/80">
                        Pickup place *
                      </label>
                      <input
                        type="text"
                        value={form.pickupPlace}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, pickupPlace: e.target.value }))
                        }
                        placeholder="e.g. Kathmandu, Thamel or full address"
                        className={`w-full rounded-lg border bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                          formErrors.pickupPlace
                            ? "border-red-500"
                            : "border-white/20"
                        }`}
                      />
                      {formErrors.pickupPlace && (
                        <p className="mt-0.5 text-xs text-red-400">
                          {formErrors.pickupPlace}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-0.5 block text-xs font-medium text-white/80">
                          Dropoff (optional)
                        </label>
                        <input
                          type="text"
                          value={form.dropoffPlace}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, dropoffPlace: e.target.value }))
                          }
                          placeholder="Same as pickup if blank"
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-xs font-medium text-white/80">
                          Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={form.notes}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, notes: e.target.value }))
                          }
                          placeholder="Special requests..."
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="mt-2 w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
                    >
                      Continue
                    </button>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <p className="text-xs font-medium text-white/60">Price summary</p>
                    <div className="mt-1 flex justify-between text-sm text-white">
                      <span>Rental ({days} day{days !== 1 ? "s" : ""})</span>
                      <span>{formatPrice(rentalAmount)}</span>
                    </div>
                    {securityDeposit > 0 && (
                      <div className="mt-0.5 flex justify-between text-xs text-white/80">
                        <span>Security deposit</span>
                        <span>{formatPrice(securityDeposit)}</span>
                      </div>
                    )}
                    <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-orange-400">
                      <span>Amount to pay</span>
                      <span>{formatPrice(amountToPay)}</span>
                    </div>
                    {securityDeposit > 0 && (
                      <p className="mt-1 text-[10px] text-white/50">
                        Deposit returned on vehicle return.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <h3 className="text-base font-semibold text-white">
                    Review and send request
                  </h3>
                  <p className="text-xs text-white/70">
                    The owner will review your request. After approval, you can
                    pay online with Stripe or Khalti, or pay when you pick up the
                    vehicle.
                  </p>
                  <div className="grid gap-1.5 sm:grid-cols-3">
                    <div className="flex items-center gap-2 rounded-lg border-2 border-orange-500 bg-orange-500/10 px-2.5 py-1.5">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="h-5 w-5 text-orange-400" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">Pay on pickup</p>
                        <p className="text-[10px] text-white/60">Default</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-[#635BFF]/50 bg-[#635BFF]/10 px-2.5 py-1.5">
                      <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5 text-[#A78BFA]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">Stripe</p>
                        <p className="text-[10px] text-white/60">After approval</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-[#5C2D91]/40 bg-[#5C2D91]/5 px-2.5 py-1.5">
                      <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5 text-[#a855f7]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">Khalti</p>
                        <p className="text-[10px] text-white/60">After approval</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                    <span className="text-sm text-white/70">Total to pay at pickup</span>
                    <span className="font-semibold text-orange-400">{formatPrice(amountToPay)}</span>
                  </div>
                  {submitError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                      {submitError}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitRequest}
                      disabled={submitLoading}
                      className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 disabled:opacity-70"
                    >
                      {submitLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                          Sending…
                        </span>
                      ) : (
                        "Send request to owner"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
