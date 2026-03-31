import {
  faCalendarCheck,
  faClock,
  faFileInvoiceDollar,
  faMapMarkerAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const RenterBookings = ({
  user,
  bookings,
  bookingsLoading,
  onShowDetails,
  onOpenInvoice,
  onReviewVehicle,
  onNavigate,
}) => {
  return (
    <div id="my-bookings" className="mb-8 scroll-mt-8">
      <h2 className="mb-4 text-2xl font-bold text-white">My Bookings</h2>
      {!user.isProfileVerified ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
          <FontAwesomeIcon
            icon={faClock}
            className="mx-auto h-12 w-12 text-amber-400/70"
          />
          <p className="mt-4 text-amber-200/90">
            Complete and verify your profile to view bookings.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="mt-4 inline-block rounded-xl bg-amber-500 px-6 py-2 font-semibold text-black transition hover:bg-amber-400"
          >
            Go to Profile
          </button>
        </div>
      ) : bookingsLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/60">
          Loading...
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <FontAwesomeIcon
            icon={faCalendarCheck}
            className="mx-auto h-12 w-12 text-white/30"
          />
          <p className="mt-4 text-white/70">No bookings yet</p>
          <Link
            to="/vehicles"
            className="mt-4 inline-block rounded-xl bg-orange-500 px-6 py-2 font-semibold text-black transition hover:bg-orange-400"
          >
            Browse vehicles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange-500/30 hover:bg-orange-500/5"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onShowDetails(b.id, e);
                }}
                className="min-w-0 flex-1 cursor-pointer text-left"
              >
                <p className="font-semibold text-white">
                  {b.vehicle?.brand} {b.vehicle?.model}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {b.startDate} – {b.returnDate}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="h-4 w-4 text-orange-400"
                  />
                  {b.pickupPlace}
                </p>
              </button>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    b.status === "confirmed" || b.status === "pending"
                      ? "bg-sky-500/20 text-sky-400"
                      : b.status === "in_progress"
                        ? "bg-amber-500/20 text-amber-400"
                        : b.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : b.status === "cancelled"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/10 text-white/70"
                  }`}
                >
                  {b.status.replace("_", " ")}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onOpenInvoice(b.id);
                  }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  title="Download invoice"
                >
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    className="h-4 w-4"
                  />
                  Invoice
                </button>
                {b.status === "completed" && b.vehicleId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onReviewVehicle({
                        vehicleId: b.vehicleId,
                        vehicleName:
                          `${b.vehicle?.brand ?? ""} ${b.vehicle?.model ?? ""}`.trim() ||
                          "this vehicle",
                        bookingId: b.id,
                      });
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-400 transition hover:bg-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    title="Rate this vehicle"
                  >
                    <FontAwesomeIcon icon={faStar} className="h-4 w-4" />
                    Rate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RenterBookings;
