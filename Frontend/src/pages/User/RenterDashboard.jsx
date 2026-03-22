import {
  faCalendar,
  faCalendarCheck,
  faCar,
  faCheckCircle,
  faClock,
  faComments,
  faCreditCard,
  faDownload,
  faEdit,
  faEnvelope,
  faFileInvoiceDollar,
  faHistory,
  faHome,
  faIdCard,
  faImage,
  faMapMarkerAlt,
  faPhone,
  faRightFromBracket,
  faSearch,
  faSpinner,
  faStar,
  faUser,
  faUserTag,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BookingInvoice from "../../component/BookingInvoice.jsx";
import ReviewFormModal from "../../component/ReviewFormModal.jsx";
import ConversationChat from "../../component/chat/ConversationChat.jsx";
import RenterProfileForm from "../../component/renter/RenterProfileForm.jsx";
import {
  bookingRequestsAPI,
  bookingsAPI,
  chatAPI,
  getAuthToken,
  khaltiAPI,
  removeAuthToken,
  reviewsAPI,
  userDetailsAPI,
} from "../../utils/api.js";
import { downloadInvoicePdf } from "../../utils/invoicePdf.js";
import { disconnectSocket } from "../../utils/socket.js";

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
  const [isEditing, setIsEditing] = useState(false);
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
  const [chatTargetUser, setChatTargetUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const invoiceRef = useRef(null);

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

  // Load owners list for Chat tab
  useEffect(() => {
    if (activeTab !== TABS.chat) return;
    let cancelled = false;
    const fetchOwners = async () => {
      try {
        setChatListLoading(true);
        setChatError(null);
        const data = await chatAPI.getOwners();
        if (!cancelled) {
          setChatList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setChatList([]);
          setChatError(err?.message ?? "Failed to load owners.");
        }
      } finally {
        if (!cancelled) setChatListLoading(false);
      }
    };
    fetchOwners();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleProfileUpdate = async () => {
    try {
      const res = await userDetailsAPI.getUserDetails(user.id);
      setUserDetails(res?.data || null);
      setIsEditing(false);
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

  return (
    <div className="min-h-screen bg-[#0a0d12]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* Profile verification status - show on overview/profile */}
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
                  you save, an admin will verify your profile. Once verified,
                  you can book and rent vehicles.
                </p>
              </div>
            </div>
          ))}

        {/* Quick Stats - show on overview, bookings, pending requests, and chat */}
        {(activeTab === TABS.overview ||
          activeTab === TABS.bookings ||
          activeTab === TABS.pendingRequests ||
          activeTab === TABS.chat) && (
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

        {/* Quick Actions - overview only */}
        {activeTab === TABS.overview && (
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/vehicles"
              className="group flex cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/30 hover:bg-amber-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 transition group-hover:bg-amber-500/30">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="h-8 w-8 text-amber-400"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">
                    Browse Vehicles
                  </h3>
                  <p className="mt-1 text-white/70">
                    Search and find the perfect vehicle for your needs
                  </p>
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab(TABS.bookings)}
              className="group w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-sky-500/30 hover:bg-sky-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20 transition group-hover:bg-sky-500/30">
                  <FontAwesomeIcon
                    icon={faCalendarCheck}
                    className="h-8 w-8 text-sky-400"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">My Bookings</h3>
                  <p className="mt-1 text-white/70">
                    View and manage your current and past bookings
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab(TABS.pendingRequests)}
              className="group w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/30 hover:bg-amber-500/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 transition group-hover:bg-amber-500/30">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="h-8 w-8 text-amber-400"
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">
                    My Pending Requests
                  </h3>
                  <p className="mt-1 text-white/70">
                    View and manage your pending booking requests
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* My Bookings - bookings tab */}
        {activeTab === TABS.bookings && (
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
                  onClick={() => setActiveTab(TABS.profile)}
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
                        handleShowBookingDetails(b.id, e);
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
                          handleOpenInvoice(b.id);
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
                            setReviewModalBooking({
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
        )}

        {/* My Pending Requests - pending requests tab */}
        {activeTab === TABS.pendingRequests && (
          <div id="my-pending-requests" className="mb-8 scroll-mt-8">
            <h2 className="mb-4 text-2xl font-bold text-white">
              My Pending Requests
            </h2>
            {!user.isProfileVerified ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
                <FontAwesomeIcon
                  icon={faClock}
                  className="mx-auto h-12 w-12 text-amber-400/70"
                />
                <p className="mt-4 text-amber-200/90">
                  Complete and verify your profile to view pending requests.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab(TABS.profile)}
                  className="mt-4 inline-block rounded-xl bg-amber-500 px-6 py-2 font-semibold text-black transition hover:bg-amber-400"
                >
                  Go to Profile
                </button>
              </div>
            ) : requestsLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/60">
                Loading...
              </div>
            ) : requests.filter((r) => r.status === "pending").length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
                <FontAwesomeIcon
                  icon={faClock}
                  className="mx-auto h-12 w-12 text-white/30"
                />
                <p className="mt-4 text-white/70">No pending requests</p>
                <Link
                  to="/vehicles"
                  className="mt-4 inline-block rounded-xl bg-orange-500 px-6 py-2 font-semibold text-black transition hover:bg-orange-400"
                >
                  Browse vehicles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {requests
                  .filter((r) => r.status === "pending")
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleShowRequestDetails(r, e)}
                        className="min-w-0 flex-1 cursor-pointer text-left"
                      >
                        <p className="font-semibold text-white">
                          {r.vehicle?.brand} {r.vehicle?.model}
                        </p>
                        <p className="mt-1 text-sm text-white/60">
                          {r.startDate} – {r.returnDate}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="h-4 w-4 text-orange-400"
                          />
                          {r.pickupPlace}
                        </p>
                      </button>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
                          Pending owner approval
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCancelRequest(r.id)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                          <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                          Cancel request
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Chat tab */}
        {activeTab === TABS.chat && (
          <div id="chat" className="mb-8 scroll-mt-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Chat</h2>
            <p className="mb-4 text-sm text-white/70">
              Chat with owners about vehicles, bookings, and more.
            </p>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]">
              <section className="rounded-2xl border border-white/10 bg-white/5 shadow-sm">
                <div className="border-b border-white/10 px-4 py-3">
                  <h3 className="text-sm font-semibold text-white">Owners</h3>
                  <p className="mt-0.5 text-xs text-white/60">
                    Select an owner to start chatting
                  </p>
                </div>
                <div className="max-h-[420px] overflow-y-auto p-3">
                  {chatListLoading ? (
                    <p className="py-6 text-center text-sm text-white/60">
                      Loading owners…
                    </p>
                  ) : chatError ? (
                    <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {chatError}
                    </p>
                  ) : chatList.length === 0 ? (
                    <p className="py-6 text-center text-sm text-white/60">
                      No owners available yet.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {chatList.map((o) => (
                        <li key={o.id}>
                          <button
                            type="button"
                            onClick={() => setChatTargetUser(o)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                              chatTargetUser?.id === o.id
                                ? "bg-orange-500/20 text-orange-100 border border-orange-400/60"
                                : "bg-black/40 text-white/80 border border-white/10 hover:bg-black/60"
                            }`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/20 text-orange-300">
                              <span className="text-xs font-semibold">
                                {(o.firstName?.[0] || o.email?.[0] || "O")
                                  .toString()
                                  .toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {[o.firstName, o.lastName]
                                  .filter(Boolean)
                                  .join(" ") || o.email || "Owner"}
                              </p>
                              {o.email && (
                                <p className="truncate text-xs text-white/50">
                                  {o.email}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
              <section className="rounded-2xl border border-white/10 bg-white/5 shadow-sm p-3 min-h-[320px]">
                {chatTargetUser ? (
                  <ConversationChat
                    targetUserId={chatTargetUser.id}
                    targetUser={chatTargetUser}
                    currentUser={user}
                    onClose={() => setChatTargetUser(null)}
                    variant="page"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-white/60">
                    Select an owner on the left to start chatting.
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* User Info Card - profile tab */}
        {activeTab === TABS.profile && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {userDetails?.profilePicture ? (
                  <img
                    src={userDetails.profilePicture}
                    alt={fullName}
                    className="h-16 w-16 rounded-full object-cover border-2 border-amber-500/30"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-2xl font-bold text-amber-400">
                    {user.firstName?.[0]?.toUpperCase() ||
                      user.email[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{fullName}</h2>
                  <p className="text-white/70">Profile Information</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <RenterProfileForm
                user={user}
                userDetails={userDetails}
                onSuccess={handleProfileUpdate}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <>
                {loadingDetails ? (
                  <div className="py-8 text-center text-white/60">
                    Loading profile...
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                        <FontAwesomeIcon
                          icon={faUser}
                          className="h-5 w-5 text-amber-400"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70">
                          Full Name
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {fullName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                        <FontAwesomeIcon
                          icon={faEnvelope}
                          className="h-5 w-5 text-amber-400"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70">
                          Email Address
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {userDetails?.phoneNumber && (
                      <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                          <FontAwesomeIcon
                            icon={faPhone}
                            className="h-5 w-5 text-amber-400"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            Phone Number
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {userDetails.phoneNumber}
                          </p>
                        </div>
                      </div>
                    )}

                    {userDetails?.dateOfBirth && (
                      <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="h-5 w-5 text-amber-400"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            Date of Birth
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {new Date(
                              userDetails.dateOfBirth,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {userDetails?.address && (
                      <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="h-5 w-5 text-amber-400"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            Address
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {userDetails.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {userDetails?.city && (
                      <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="h-5 w-5 text-amber-400"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            City
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {userDetails.city}
                          </p>
                        </div>
                      </div>
                    )}

                    {userDetails?.licenseNumber && (
                      <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                          <FontAwesomeIcon
                            icon={faIdCard}
                            className="h-5 w-5 text-amber-400"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            License Number
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {userDetails.licenseNumber}
                          </p>
                          {userDetails.isLicenseVerified && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="h-3 w-3"
                              />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {userDetails?.licenseExpiry && (
                      <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="h-5 w-5 text-amber-400"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/70">
                            License Expiry
                          </p>
                          <p className="mt-1 text-lg font-semibold text-white">
                            {new Date(
                              userDetails.licenseExpiry,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}

                    {userDetails?.licenseImage && (
                      <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4 md:col-span-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                          <FontAwesomeIcon
                            icon={faImage}
                            className="h-5 w-5 text-amber-400"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white/70">
                            License Image
                          </p>
                          <img
                            src={userDetails.licenseImage}
                            alt="License"
                            className="mt-2 max-h-48 rounded-lg border border-white/20"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4 md:col-span-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                        <FontAwesomeIcon
                          icon={faUserTag}
                          className="h-5 w-5 text-amber-400"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/70">
                          Role
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          Renter
                        </p>
                      </div>
                    </div>

                    {!userDetails && (
                      <div className="md:col-span-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-center">
                        <p className="text-amber-200/80 text-sm">
                          Complete your profile to get started. Click "Edit
                          Profile" to add your information.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Booking/Request details popup */}
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
                          detailsBooking.status === "confirmed"
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
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                handlePayWithKhalti(detailsBooking.id)
                              }
                              disabled={khaltiLoading}
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
                            {khaltiError && (
                              <p className="mt-2 text-sm text-red-400">
                                {khaltiError}
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

        {/* Invoice modal */}
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
