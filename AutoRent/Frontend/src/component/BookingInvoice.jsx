import { forwardRef } from "react";

const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `Rs. ${n.toLocaleString()}`;
};

/**
 * Printable invoice for a booking. Use with ref for PDF capture.
 */
const BookingInvoice = forwardRef(({ booking, vehicle, payment, user }, ref) => {
  if (!booking) return null;

  const rentalDays =
    booking.startDate && booking.returnDate
      ? Math.ceil(
          (new Date(booking.returnDate) - new Date(booking.startDate)) /
            (1000 * 60 * 60 * 24)
        ) || 1
      : 1;
  const pricePerDay = vehicle?.pricePerDay ? Number(vehicle.pricePerDay) : 0;
  const vehicleDeposit = vehicle?.securityDeposit ? Number(vehicle.securityDeposit) : 0;
  const storedDeposit = payment?.securityDeposit != null ? Number(payment.securityDeposit) : null;
  const securityDeposit = storedDeposit ?? vehicleDeposit;
  // New: payment.amount = rental only; payment.securityDeposit = collateral
  // Legacy: payment.amount = rental+deposit, securityDeposit null → derive rental
  const rawAmount = payment?.amount ? Number(payment.amount) : 0;
  const rentalAmount = storedDeposit != null
    ? rawAmount
    : securityDeposit > 0
      ? Math.max(0, rawAmount - securityDeposit) || pricePerDay * rentalDays
      : rawAmount || pricePerDay * rentalDays;
  const amountToPay = rentalAmount;

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.lastName || "Customer";

  return (
    <div
      ref={ref}
      id="invoice-for-pdf"
      className="mx-auto w-full max-w-2xl bg-white p-10 text-gray-900"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="border-b-2 border-orange-500 pb-6">
        <h1 className="text-3xl font-bold text-orange-600">AUTO RENT</h1>
        <p className="mt-1 text-sm text-gray-600">Vehicle Rental Invoice</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-semibold uppercase text-gray-500">Bill to</p>
          <p className="mt-1 font-semibold">{fullName}</p>
          {user?.email && <p className="text-sm text-gray-600">{user.email}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase text-gray-500">Invoice details</p>
          <p className="mt-1 font-semibold">Invoice # {booking.id?.slice(0, 8)?.toUpperCase() || "—"}</p>
          <p className="text-sm text-gray-600">
            Date: {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "—"}
          </p>
          <p className="text-sm text-gray-600">Status: {booking.status?.replace("_", " ") || "—"}</p>
        </div>
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase text-gray-500">Vehicle & rental period</p>
        <div className="mt-3 rounded-lg border border-gray-200 p-4">
          <p className="font-semibold">
            {vehicle?.brand} {vehicle?.model}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {booking.startDate} – {booking.returnDate} ({rentalDays} day{rentalDays !== 1 ? "s" : ""})
          </p>
          <p className="mt-2 text-sm">
            <span className="font-medium">Pickup:</span> {booking.pickupPlace}
          </p>
          {booking.dropoffPlace && (
            <p className="mt-1 text-sm">
              <span className="font-medium">Dropoff:</span> {booking.dropoffPlace}
            </p>
          )}
        </div>
      </div>

      <div className="mt-10">
        <p className="text-xs font-semibold uppercase text-gray-500">Charges</p>
        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 text-left text-sm font-semibold">Description</th>
              <th className="py-2 text-right text-sm font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 text-sm">Rental ({rentalDays} day{rentalDays !== 1 ? "s" : ""})</td>
              <td className="py-3 text-right text-sm">{formatPrice(rentalAmount)}</td>
            </tr>
            {securityDeposit > 0 && (
              <tr className="border-b border-gray-100">
                <td className="py-3 text-sm">
                  Security deposit (collateral · refundable on vehicle return)
                </td>
                <td className="py-3 text-right text-sm">{formatPrice(securityDeposit)}</td>
              </tr>
            )}
            <tr className="border-b-2 border-gray-200">
              <td className="py-3 font-semibold">Amount to pay</td>
              <td className="py-3 text-right font-semibold text-orange-600">{formatPrice(amountToPay)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-lg bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase text-gray-500">Payment</p>
        <p className="mt-1 text-sm">
          Method: {payment?.method === "pay_on_pickup" ? "Pay on pickup" : payment?.method || "—"}
        </p>
        <p className="mt-1 text-sm">Status: {payment?.status || "—"}</p>
        {securityDeposit > 0 && (
          <p className="mt-2 text-xs text-gray-600">
            Security deposit is held as collateral and returned when the vehicle is returned in good condition.
          </p>
        )}
      </div>

      <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
        <p>Thank you for choosing AUTO RENT</p>
        <p className="mt-1">This is a computer-generated invoice. No signature required.</p>
      </div>
    </div>
  );
});

BookingInvoice.displayName = "BookingInvoice";

export default BookingInvoice;
