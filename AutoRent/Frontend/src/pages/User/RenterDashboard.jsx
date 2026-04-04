import {
  faCalendarCheck,
  faCar,
  faCheckCircle,
  faClock,
  faComments,
  faCreditCard,
  faDownload,
  faFileInvoiceDollar,
  faHistory,
  faHome,
  faMapMarkerAlt,
  faRightFromBracket,
  faSpinner,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BookingInvoice from "../../component/BookingInvoice.jsx";
import ReviewFormModal from "../../component/ReviewFormModal.jsx";
import {
  bookingRequestsAPI,
  bookingsAPI,
  getAuthToken,
  khaltiAPI,
  stripeAPI,
  removeAuthToken,
  reviewsAPI,
  userDetailsAPI,
} from "../../utils/api.js";
import { downloadInvoicePdf } from "../../utils/invoicePdf.js";
import { disconnectSocket } from "../../utils/socket.js";
import RenterBookings from "./RenterBookings.jsx";
import RenterChat from "./RenterChat.jsx";
import RenterOverview from "./RenterOverview.jsx";
import RenterPendingRequests from "./RenterPendingRequests.jsx";
import RenterProfile from "./RenterProfile.jsx";

const TABS = {
  overview: "overview",
  bookings: "bookings",
  pendingRequests: "pending-requests",
  chat: "chat",
  profile: "profile",
};

const RenterDashboard = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(TABS.overview);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState(null);
  const [detailsRequest, setDetailsRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [khaltiLoading, setKhaltiLoading] = useState(false);
  const [khaltiError, setKhaltiError] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const invoiceRef = useRef(null);

  const canCancelBookingStatus = (status) =>
    status === "pending" || status === "confirmed";

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const handleLogout = () => {
    disconnectSocket();
    removeAuthToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!getAuthToken()) return;
      try {
        setLoadingDetails(true);
        const res = await userDetailsAPI.getUserDetails(user.id);
        setUserDetails(res?.data || null);
      } catch (err) {
        if (err?.message?.includes("not found")) {
          setUserDetails(null);
        }
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchUserDetails();
  }, [user.id]);

  useEffect(() => {
    if (!invoiceBooking && !invoiceLoading) return;
    const handler = (e) => {
      if (e.key === "Escape") setInvoiceBooking(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [invoiceBooking, invoiceLoading]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        setDetailsBooking(null);
        setDetailsRequest(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleShowBookingDetails = async (bookingId, e) => {
    if (e) e.preventDefault();
    setDetailsLoading(true);
    setDetailsBooking(null);
    try {
      const full = await bookingsAPI.getById(bookingId);
      if (full) setDetailsBooking(full);
    } catch (err) {
      console.error("Failed to load booking details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleShowRequestDetails = (request, e) => {
    if (e) e.preventDefault();
    setDetailsRequest(request);
  };

  const handlePayWithKhalti = async (bookingId) => {
    setKhaltiError(null);
    setKhaltiLoading(true);
    try {
      const res = await khaltiAPI.initiate(bookingId);
      if (res?.success && res?.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
        return;
      }
      setKhaltiError(res?.message ?? "Failed to initiate payment");
    } catch (err) {
      setKhaltiError(err?.message ?? "Failed to initiate Khalti payment");
    } finally {
      setKhaltiLoading(false);
    }
  };

  const handlePayWithStripe = async (bookingId) => {
    setStripeError(null);
    setStripeLoading(true);
    try {
      const res = await stripeAPI.initiate(bookingId);
      if (res?.success && res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }
      setStripeError(res?.message ?? "Failed to initiate payment");
    } catch (err) {
      setStripeError(err?.message ?? "Failed to initiate Stripe payment");
    } finally {
      setStripeLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      if (!getAuthToken() || !user.isProfileVerified) return;
      try {
        setBookingsLoading(true);
        const list = await bookingsAPI.getMyBookings();
        setBookings(Array.isArray(list) ? list : []);
      } catch {
        setBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
    if (location.state?.refreshBookings) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    user.isProfileVerified,
    location.state?.refreshBookings,
    location.pathname,
    navigate,
  ]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!getAuthToken() || !user.isProfileVerified) return;
      try {
        setRequestsLoading(true);
        const list = await bookingRequestsAPI.getMyRequests();
        setRequests(Array.isArray(list) ? list : []);
      } catch {
        setRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };
    fetchRequests();
  }, [user.isProfileVerified]);

  useEffect(() => {
    if (!getAuthToken() || !user.isProfileVerified) return;
    const interval = setInterval(() => {
      bookingsAPI
        .getMyBookings()
        .then((list) => setBookings(Array.isArray(list) ? list : []))
        .catch(() => {});
      bookingRequestsAPI
        .getMyRequests()
        .then((list) => setRequests(Array.isArray(list) ? list : []))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user.isProfileVerified]);

  const handleProfileUpdate = async () => {
    try {
      const res = await userDetailsAPI.getUserDetails(user.id);
      setUserDetails(res?.data || null);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  const handleOpenInvoice = async (bookingId) => {
    setInvoiceLoading(true);
    setInvoiceBooking(null);
    try {
      const full = await bookingsAPI.getById(bookingId);
      if (full) setInvoiceBooking(full);
    } catch (err) {
      console.error("Failed to load booking:", err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleDownloadInvoicePdf = async () => {
    if (!invoiceBooking) return;
    let element =
      invoiceRef.current ?? document.getElementById("invoice-for-pdf");
    if (!element) {
      await new Promise((r) => setTimeout(r, 150));
      element =
        invoiceRef.current ?? document.getElementById("invoice-for-pdf");
    }
    if (!element) {
      alert("Invoice not ready. Please try again in a moment.");
      return;
    }
    try {
      const name = `invoice-${invoiceBooking.id?.slice(0, 8) || "booking"}.pdf`;
      await downloadInvoicePdf(element, name);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert(err?.message || "Failed to download PDF. Please try again.");
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await bookingRequestsAPI.cancel(requestId);
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err) {
      console.error("Failed to cancel request:", err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (
      !window.confirm(
        "Cancel this booking? The owner will be notified and the vehicle may become available again for those dates.",
      )
    ) {
      return;
    }
    setCancellingBookingId(bookingId);
    try {
      const res = await bookingsAPI.cancel(bookingId);
      const updated = res?.data;
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, ...(updated ? { status: updated.status } : { status: "cancelled" }) }
            : b,
        ),
      );
      setDetailsBooking((prev) =>
        prev?.id === bookingId
          ? {
              ...prev,
              status: updated?.status ?? "cancelled",
            }
          : prev,
      );
    } catch (err) {
      alert(err?.message ?? "Could not cancel booking. Try again.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TABS.overview:
        return (
          <RenterOverview
            user={user}
            bookings={bookings}
            requests={requests}
            onNavigate={setActiveTab}
          />
        );
      case TABS.bookings:
        return (
          <RenterBookings
            user={user}
            bookings={bookings}
            bookingsLoading={bookingsLoading}
            onShowDetails={handleShowBookingDetails}
            onOpenInvoice={handleOpenInvoice}
            onReviewVehicle={setReviewModalBooking}
            onNavigate={setActiveTab}
            onCancelBooking={handleCancelBooking}
            cancellingBookingId={cancellingBookingId}
            canCancelBookingStatus={canCancelBookingStatus}
          />
        );
      case TABS.pendingRequests:
        return (
          <RenterPendingRequests
            user={user}
            requests={requests}
            requestsLoading={requestsLoading}
            onShowDetails={handleShowRequestDetails}
            onCancelRequest={handleCancelRequest}
            onNavigate={setActiveTab}
          />
        );
      case TABS.chat:
        return <RenterChat user={user} />;
      case TABS.profile:
        return (
          <RenterProfile
            user={user}
            userDetails={userDetails}
            loadingDetails={loadingDetails}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d12]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              Renter Dashboard
            </h1>
            <p className="mt-2 text-white/70">
              Welcome back, {user.firstName || "User"}! Find and book your
              perfect vehicle.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start">
            <div className="flex flex-wrap rounded-xl border border-white/20 bg-white/5 p-1">
              {[
                { id: TABS.overview, label: "Overview", icon: faHome },
                {
                  id: TABS.bookings,
                  label: "My Bookings",
                  icon: faCalendarCheck,
                },
                {
                  id: TABS.pendingRequests,
                  label: "My Pending Requests",
                  icon: faClock,
                },
                { id: TABS.chat, label: "Chat", icon: faComments },
                { id: TABS.profile, label: "Profile", icon: faUser },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    activeTab === tab.id
                      ? "bg-amber-500/30 text-amber-300"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={tab.icon} className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white/90 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5" />
              Logout
            </button>
            <Link
              to="/"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500/20 px-5 py-3 font-semibold text-amber-400 ring-1 ring-amber-500/40 transition hover:bg-amber-500/30 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <FontAwesomeIcon icon={faHome} className="h-5 w-5" />
              Home
            </Link>
          </div>
        </div>

        {(activeTab === TABS.overview || activeTab === TABS.profile) &&
          (user.isProfileVerified ? (
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-4">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="h-6 w-6 text-emerald-400"
              />
              <div>
                <p className="font-semibold text-emerald-200">
                  Profile verified
                </p>
                <p className="text-sm text-emerald-200/80">
                  You can book vehicles and add favorites.
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4">
              <FontAwesomeIcon
                icon={faClock}
                className="h-6 w-6 text-amber-400"
              />
              <div>
                <p className="font-semibold text-amber-200">
                  Profile pending verification
                </p>
                <p className="text-sm text-amber-200/80">
                  Complete your profile (including license upload) below. After
                  you save, an admin will verify your profile. Once verified, you
                  can book and rent vehicles.
                </p>
              </div>
            </div>
          ))}

        {(activeTab === TABS.overview ||
          activeTab === TABS.bookings ||
          activeTab === TABS.pendingRequests) && (
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-200/80">
                    Active Rentals
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {
                      bookings.filter((b) =>
                        ["confirmed", "in_progress"].includes(b.status),
                      ).length
                    }
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/25">
                  <FontAwesomeIcon
                    icon={faCar}
                    className="h-6 w-6 text-amber-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab(TABS.pendingRequests)}
              className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-6 text-left transition hover:border-sky-500/40 hover:bg-sky-500/15"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-sky-200/80">
                    Pending Requests
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {requests.filter((r) => r.status === "pending").length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/25">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="h-6 w-6 text-sky-400"
                  />
                </div>
              </div>
            </button>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-200/80">
                    Total Rentals
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {bookings.length}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/25">
                  <FontAwesomeIcon
                    icon={faHistory}
                    className="h-6 w-6 text-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {renderTabContent()}

        {(detailsBooking || detailsRequest || detailsLoading) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => {
              if (!detailsLoading) {
                setDetailsBooking(null);
                setDetailsRequest(null);
              }
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Booking details"
          >
            <div
              className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#0a0d12] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Booking details
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setDetailsBooking(null);
                    setDetailsRequest(null);
                  }}
                  className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {detailsLoading ? (
                  <div className="py-12 text-center text-white/60">
                    Loading...
                  </div>
                ) : detailsBooking ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Vehicle
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {detailsBooking.vehicle?.brand}{" "}
                        {detailsBooking.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Rental period
                      </p>
                      <p className="mt-1 text-white">
                        {detailsBooking.startDate} – {detailsBooking.returnDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Pickup
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-white">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="h-4 w-4 text-orange-400"
                        />
                        {detailsBooking.pickupPlace}
                      </p>
                    </div>
                    {detailsBooking.dropoffPlace && (
                      <div>
                        <p className="text-xs font-medium uppercase text-white/50">
                          Dropoff
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-white">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="h-4 w-4 text-orange-400"
                          />
                          {detailsBooking.dropoffPlace}
                        </p>
                      </div>
                    )}
                    {detailsBooking.notes && (
                      <div>
                        <p className="text-xs font-medium uppercase text-white/50">
                          Notes
                        </p>
                        <p className="mt-1 text-white">
                          {detailsBooking.notes}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Status
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                          detailsBooking.status === "pending"
                            ? "bg-sky-500/20 text-sky-400"
                            : detailsBooking.status === "confirmed"
                              ? "bg-sky-500/20 text-sky-400"
                              : detailsBooking.status === "in_progress"
                                ? "bg-amber-500/20 text-amber-400"
                                : detailsBooking.status === "completed"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : detailsBooking.status === "cancelled"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-white/10 text-white/70"
                        }`}
                      >
                        {detailsBooking.status?.replace("_", " ")}
                      </span>
                    </div>
                    {detailsBooking.payment && (
                      <div>
                        <p className="text-xs font-medium uppercase text-white/50">
                          Payment
                        </p>
                        <p className="mt-1 text-white">
                          Rs.{" "}
                          {Number(
                            detailsBooking.payment.amount || 0,
                          ).toLocaleString()}{" "}
                          ·{" "}
                          <span
                            className={
                              detailsBooking.payment.status === "paid"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }
                          >
                            {detailsBooking.payment.status}
                          </span>
                        </p>
                        {detailsBooking.payment.status === "pending" && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handlePayWithKhalti(detailsBooking.id)
                              }
                              disabled={khaltiLoading || stripeLoading}
                              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#5C2D91] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a2375] disabled:opacity-70"
                            >
                              {khaltiLoading ? (
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="h-4 w-4 animate-spin"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faCreditCard}
                                  className="h-4 w-4"
                                />
                              )}
                              Pay with Khalti
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handlePayWithStripe(detailsBooking.id)
                              }
                              disabled={stripeLoading || khaltiLoading}
                              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#635BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#524ddb] disabled:opacity-70"
                            >
                              {stripeLoading ? (
                                <FontAwesomeIcon
                                  icon={faSpinner}
                                  className="h-4 w-4 animate-spin"
                                />
                              ) : (
                                <FontAwesomeIcon
                                  icon={faCreditCard}
                                  className="h-4 w-4"
                                />
                              )}
                              Pay with Stripe
                            </button>
                            {(khaltiError || stripeError) && (
                              <p className="mt-1 w-full text-sm text-red-400">
                                {khaltiError || stripeError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-4">
                      <Link
                        to={`/vehicles/${detailsBooking.vehicleId}`}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        <FontAwesomeIcon icon={faCar} className="h-4 w-4" />
                        View vehicle
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const id = detailsBooking.id;
                          setDetailsBooking(null);
                          handleOpenInvoice(id);
                        }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
                      >
                        <FontAwesomeIcon
                          icon={faFileInvoiceDollar}
                          className="h-4 w-4"
                        />
                        Invoice
                      </button>
                      {canCancelBookingStatus(detailsBooking.status) && (
                        <button
                          type="button"
                          onClick={() => handleCancelBooking(detailsBooking.id)}
                          disabled={cancellingBookingId === detailsBooking.id}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-60"
                        >
                          {cancellingBookingId === detailsBooking.id ? (
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="h-4 w-4 animate-spin"
                            />
                          ) : (
                            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                          )}
                          Cancel booking
                        </button>
                      )}
                    </div>
                  </div>
                ) : detailsRequest ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Vehicle
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {detailsRequest.vehicle?.brand}{" "}
                        {detailsRequest.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Requested dates
                      </p>
                      <p className="mt-1 text-white">
                        {detailsRequest.startDate} – {detailsRequest.returnDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Pickup
                      </p>
                      <p className="mt-1 flex items-center gap-2 text-white">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="h-4 w-4 text-orange-400"
                        />
                        {detailsRequest.pickupPlace}
                      </p>
                    </div>
                    {detailsRequest.dropoffPlace && (
                      <div>
                        <p className="text-xs font-medium uppercase text-white/50">
                          Dropoff
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-white">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="h-4 w-4 text-orange-400"
                          />
                          {detailsRequest.dropoffPlace}
                        </p>
                      </div>
                    )}
                    {detailsRequest.notes && (
                      <div>
                        <p className="text-xs font-medium uppercase text-white/50">
                          Notes
                        </p>
                        <p className="mt-1 text-white">
                          {detailsRequest.notes}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium uppercase text-white/50">
                        Status
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
                        Pending owner approval
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                      <Link
                        to={`/vehicles/${detailsRequest.vehicleId}`}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                      >
                        <FontAwesomeIcon icon={faCar} className="h-4 w-4" />
                        View vehicle
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          handleCancelRequest(detailsRequest.id);
                          setDetailsRequest(null);
                        }}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                        Cancel request
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {(invoiceLoading || invoiceBooking) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => !invoiceLoading && setInvoiceBooking(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Invoice"
          >
            <div
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-gray-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/20 bg-gray-900 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  Booking Invoice
                </h3>
                <div className="flex items-center gap-2">
                  {invoiceBooking && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadInvoicePdf();
                      }}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-black transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                      Download PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => !invoiceLoading && setInvoiceBooking(null)}
                    className="rounded-xl border border-white/20 px-4 py-2 font-semibold text-white/90 hover:bg-white/10"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6">
                {invoiceLoading ? (
                  <div className="py-12 text-center text-white/70">
                    Loading invoice...
                  </div>
                ) : invoiceBooking ? (
                  <div className="rounded-xl bg-white p-2">
                    <BookingInvoice
                      ref={invoiceRef}
                      booking={invoiceBooking}
                      vehicle={invoiceBooking.vehicle}
                      payment={invoiceBooking.payment}
                      user={{
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
        {reviewModalBooking && (
          <ReviewFormModal
            isOpen={!!reviewModalBooking}
            onClose={() => setReviewModalBooking(null)}
            onSubmit={async (rating, comment) => {
              await reviewsAPI.create(reviewModalBooking.vehicleId, {
                rating,
                comment,
                bookingId: reviewModalBooking.bookingId,
              });
            }}
            vehicleName={reviewModalBooking.vehicleName}
          />
        )}
      </div>
    </div>
  );
};

export default RenterDashboard;
