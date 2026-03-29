import {
  faCheckCircle,
  faMapMarkerAlt,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { bookingRequestsAPI, bookingsAPI } from "../../utils/api.js";

const OwnerRentals = () => {
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  useEffect(() => {
    setBookingsLoading(true);
    setRequestsLoading(true);
    Promise.all([
      bookingsAPI
        .getMyBookings()
        .then((list) => setBookings(Array.isArray(list) ? list : []))
        .catch(() => setBookings([])),
      bookingRequestsAPI
        .getForOwner()
        .then((list) => setRequests(Array.isArray(list) ? list : []))
        .catch(() => setRequests([])),
    ]).finally(() => {
      setBookingsLoading(false);
      setRequestsLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      bookingsAPI
        .getMyBookings()
        .then((list) => setBookings(Array.isArray(list) ? list : []))
        .catch(() => {});
      bookingRequestsAPI
        .getForOwner()
        .then((list) => setRequests(Array.isArray(list) ? list : []))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleApproveRequest = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
      await bookingRequestsAPI.approve(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setBookingsLoading(true);
      const list = await bookingsAPI.getMyBookings();
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      alert(err?.message ?? "Failed to approve request.");
    } finally {
      setProcessingRequestId(null);
      setBookingsLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
      await bookingRequestsAPI.reject(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      alert(err?.message ?? "Failed to reject request.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Rentals</h2>
        <p className="mt-1 text-slate-600">
          Booking requests and rentals for your vehicles
        </p>
      </div>
      <div className="space-y-6">
        {requests.length > 0 && (
          <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] shadow-sm overflow-hidden">
            <div className="border-b border-[#E2D4C4] bg-[#FFE3BF] px-4 py-3">
              <h3 className="font-semibold text-slate-900">
                Pending requests
              </h3>
              <p className="text-sm text-[#555555]">
                Approve or reject booking requests
              </p>
            </div>
            <div className="divide-y divide-amber-200">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {r.vehicle?.brand} {r.vehicle?.model}
                    </p>
                    <p className="text-sm text-slate-600">
                      {r.startDate} – {r.returnDate}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-4 w-4 text-orange-500"
                      />
                      {r.pickupPlace}
                    </p>
                    {r.renter && (
                      <p className="mt-1 text-sm text-slate-600">
                        Requested by: {r.renter.firstName} {r.renter.lastName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApproveRequest(r.id)}
                      disabled={processingRequestId === r.id}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="h-4 w-4"
                      />
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectRequest(r.id)}
                      disabled={processingRequestId === r.id}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      <FontAwesomeIcon
                        icon={faTimesCircle}
                        className="h-4 w-4"
                      />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] shadow-sm overflow-hidden">
          <div className="border-b border-[#E2D4C4] bg-[#FFE3BF] px-4 py-3">
            <h3 className="font-semibold text-slate-900">
              Confirmed bookings
            </h3>
          </div>
          {bookingsLoading || requestsLoading ? (
            <div className="p-12 text-center text-slate-500">Loading...</div>
          ) : bookings.length === 0 && requests.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No rentals or pending requests yet.
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No confirmed bookings yet.
            </div>
          ) : (
            <div className="divide-y divide-[#E2D4C4]">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {b.vehicle?.brand} {b.vehicle?.model}
                    </p>
                    <p className="text-sm text-slate-600">
                      {b.startDate} – {b.returnDate}
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-4 w-4 text-orange-500"
                      />
                      {b.pickupPlace}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      b.status === "confirmed"
                        ? "bg-sky-100 text-sky-700"
                        : b.status === "in_progress"
                          ? "bg-amber-100 text-amber-700"
                          : b.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {b.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OwnerRentals;
