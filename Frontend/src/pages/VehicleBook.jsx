import {
  faArrowLeft,
  faCalendarCheck,
  faCreditCard,
  faExclamationTriangle,
  faMapMarkerAlt,
  faMoneyBillWave,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  authAPI,
  bookingRequestsAPI,
  getAuthToken,
  renterAPI,
} from "../utils/api.js";

const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `Rs. ${n.toLocaleString()}`;
};

const VehicleBook = () => {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [vehicleLoading, setVehicleLoading] = useState(true);
  const [vehicleError, setVehicleError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

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

  const isAuthenticated = !!getAuthToken();
  const isRenterUnverified =
    isAuthenticated &&
    currentUser?.role === "renter" &&
    currentUser?.isProfileVerified === false;

  useEffect(() => {
    if (!isAuthenticated) {
      setUserLoading(false);
      return;
    }
    authAPI
      .me()
      .then((u) => setCurrentUser(u ?? null))
      .catch(() => setCurrentUser(null))
      .finally(() => setUserLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!id) return;
    setVehicleLoading(true);
    setVehicleError(null);
    renterAPI
      .getVehicleById(id)
      .then((res) => {
        if (res?.data) setVehicle(res.data);
        else setVehicleError("Vehicle not found");
      })
      .catch((err) => setVehicleError(err?.message ?? "Failed to load vehicle"))
      .finally(() => setVehicleLoading(false));
  }, [id]);

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
  const amountToPay = rentalAmount; // Rental only; security deposit is collateral (returned on vehicle return)

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

  if (!userLoading && isRenterUnverified) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/20">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="h-12 w-12 text-amber-400"
              />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-white">
              Profile verification required
            </h1>
            <p className="mt-3 text-lg text-white/70">
              Complete your profile and get it verified by an admin before you
              can book vehicles. Go to your dashboard to complete and submit
              your profile.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
              >
                Go to dashboard
              </Link>
              <Link
                to={`/vehicles/${id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                Back to vehicle
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (vehicleLoading || !vehicle) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24">
          {vehicleError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-center">
              <p className="text-red-400">{vehicleError}</p>
              <Link
                to={`/vehicles/${id}`}
                className="mt-4 inline-block text-orange-400 hover:text-orange-300"
              >
                Back to vehicle
              </Link>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
              <p className="mt-4 text-white/70">Loading vehicle…</p>
            </>
          )}
        </div>
      </main>
    );
  }

  // Success state (request sent)
  if (requestSuccess) {
    const { request, vehicle: v } = requestSuccess;
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/20">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="h-12 w-12 text-amber-400"
              />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-white">
              Request sent
            </h1>
            <p className="mt-3 text-lg text-white/70">
              Your booking request has been sent to the vehicle owner. You will
              be notified when they respond.
            </p>
            <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4 text-left">
              <p className="font-semibold text-white">
                {v?.brand} {v?.model}
              </p>
              <p className="mt-1 text-white/70">
                {request?.startDate} – {request?.returnDate}
              </p>
              <p className="mt-1 text-white/70">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mr-2 h-4 w-4 text-orange-400"
                />
                Pickup: {request?.pickupPlace}
              </p>
              <p className="mt-2 text-sm text-white/50">
                Request ID: {request?.id}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
              >
                Go to dashboard
              </Link>
              <Link
                to={`/vehicles/${id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                Back to vehicle
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const brand = vehicle.brand ?? "";
  const model = vehicle.model ?? "";

  return (
    <main className="min-h-screen bg-[#05070b]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to={`/vehicles/${id}`}
          className="inline-flex items-center gap-2 text-white/70 transition hover:text-orange-400"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to vehicle
        </Link>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          <h2 className="text-lg font-semibold text-white">
            {brand} {model}
          </h2>
          <p className="mt-1 text-white/60">
            {formatPrice(vehicle.pricePerDay)} per day
            {vehicle.securityDeposit != null && vehicle.securityDeposit > 0 && (
              <>
                {" "}
                · {formatPrice(vehicle.securityDeposit)} security deposit
                (collateral)
              </>
            )}
          </p>
        </div>

        {/* Security deposit & late fee info */}
        <div className="mt-4 space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          {securityDeposit > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-200">
                Security deposit (collateral)
              </p>
              <p className="mt-0.5 text-sm text-white/70">
                The security deposit of {formatPrice(securityDeposit)} is{" "}
                <strong className="text-white">not a payment</strong> — it is
                held as collateral and will be{" "}
                <strong className="text-emerald-400">
                  returned in full when you return the vehicle
                </strong>{" "}
                in good condition.
              </p>
            </div>
          )}
          {vehicle.lateFeePerHour != null &&
            Number(vehicle.lateFeePerHour) > 0 && (
              <div>
                <p className="text-sm font-medium text-amber-200">
                  Late return fee
                </p>
                <p className="mt-0.5 text-sm text-white/70">
                  If the vehicle is not returned by the expected date/time, a
                  late fee of {formatPrice(vehicle.lateFeePerHour)} per hour
                  will be charged. Please return the vehicle on time to avoid
                  additional charges.
                </p>
              </div>
            )}
          {(!securityDeposit || securityDeposit === 0) &&
            (!vehicle.lateFeePerHour ||
              Number(vehicle.lateFeePerHour) === 0) && (
              <p className="text-sm text-white/70">
                Return the vehicle on time and in good condition. Late returns
                may incur additional fees.
              </p>
            )}
        </div>

        {step === 1 ? (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-white">
              Booking details
            </h3>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
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
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                      formErrors.startDate
                        ? "border-red-500"
                        : "border-white/20"
                    }`}
                  />
                  {formErrors.startDate && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Return date *
                  </label>
                  <input
                    type="date"
                    min={minReturnDate}
                    value={form.returnDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, returnDate: e.target.value }))
                    }
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                      formErrors.returnDate
                        ? "border-red-500"
                        : "border-white/20"
                    }`}
                  />
                  {formErrors.returnDate && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.returnDate}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Pickup place *
                </label>
                <input
                  type="text"
                  value={form.pickupPlace}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pickupPlace: e.target.value }))
                  }
                  placeholder="e.g. Kathmandu, Thamel or full address"
                  className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                    formErrors.pickupPlace
                      ? "border-red-500"
                      : "border-white/20"
                  }`}
                />
                {formErrors.pickupPlace && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.pickupPlace}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Dropoff place (optional)
                </label>
                <input
                  type="text"
                  value={form.dropoffPlace}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dropoffPlace: e.target.value }))
                  }
                  placeholder="Same as pickup if left blank"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Notes (optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Special requests, contact preference..."
                  rows={3}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/60">Price summary</p>
              <div className="mt-2 flex justify-between text-white">
                <span>
                  Rental ({days} day{days !== 1 ? "s" : ""})
                </span>
                <span>{formatPrice(rentalAmount)}</span>
              </div>
              {securityDeposit > 0 && (
                <div className="mt-1 flex justify-between text-white">
                  <span>Security deposit (collateral · refundable)</span>
                  <span>{formatPrice(securityDeposit)}</span>
                </div>
              )}
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold text-orange-400">
                <span>Amount to pay at pickup</span>
                <span>{formatPrice(amountToPay)}</span>
              </div>
              {securityDeposit > 0 && (
                <p className="mt-2 text-xs text-white/50">
                  Deposit is held as collateral and returned when you return the
                  vehicle.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              className="w-full rounded-xl bg-orange-500 px-6 py-4 text-lg font-bold text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-semibold text-white">
              Review and send request
            </h3>
            <p className="text-white/70">
              The owner will review your request. After approval, you can pay
              online with Stripe or Khalti, or pay when you pick up the vehicle.
            </p>
            <div className="space-y-3">
              <div className="flex w-full items-center gap-4 rounded-xl border-2 border-orange-500 bg-orange-500/10 px-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
                  <FontAwesomeIcon
                    icon={faMoneyBillWave}
                    className="h-6 w-6 text-orange-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Pay on pickup</p>
                  <p className="text-sm text-white/60">
                    Pay when you collect the vehicle (after owner approves)
                  </p>
                </div>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-black">
                  Default
                </span>
              </div>

              <div className="flex cursor-default items-center gap-4 rounded-xl border border-[#635BFF]/50 bg-[#635BFF]/10 px-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#635BFF]/20">
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className="h-6 w-6 text-[#A78BFA]"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Stripe (card)</p>
                  <p className="text-sm text-white/60">
                    Pay with card after owner approves (from your dashboard)
                  </p>
                </div>
                <span className="rounded-full bg-[#635BFF]/40 px-3 py-1 text-xs font-medium text-white">
                  Available
                </span>
              </div>

              <div className="flex cursor-default items-center gap-4 rounded-xl border border-[#5C2D91]/40 bg-[#5C2D91]/5 px-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5C2D91]/20">
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className="h-6 w-6 text-[#a855f7]"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Khalti</p>
                  <p className="text-sm text-white/60">
                    Pay online after owner approves (from dashboard)
                  </p>
                </div>
                <span className="rounded-full bg-[#5C2D91]/30 px-3 py-1 text-xs font-medium text-[#a855f7]">
                  Available
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/60">
                Amount to pay when you collect the vehicle (after approval)
              </p>
              <div className="mt-1 flex justify-between font-semibold text-orange-400">
                <span>Total to pay at pickup</span>
                <span>{formatPrice(amountToPay)}</span>
              </div>
              {securityDeposit > 0 && (
                <p className="mt-2 text-xs text-white/50">
                  Plus {formatPrice(securityDeposit)} deposit (held as
                  collateral, returned on vehicle return).
                </p>
              )}
            </div>

            {submitError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
                {submitError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={submitLoading}
                className="flex-1 rounded-xl bg-orange-500 px-6 py-4 text-lg font-bold text-black transition hover:bg-orange-400 disabled:opacity-70"
              >
                {submitLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-5 w-5 animate-spin"
                    />
                    Sending request…
                  </span>
                ) : (
                  "Send request to owner"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default VehicleBook;
