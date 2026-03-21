import {
  faCalendar,
  faCar,
  faChartLine,
  faCheckCircle,
  faDollarSign,
  faEdit,
  faEnvelope,
  faEye,
  faIdCard,
  faImage,
  faMapMarkerAlt,
  faPenToSquare,
  faPhone,
  faPlus,
  faTimesCircle,
  faTrashCan,
  faUser,
  faUserTag,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConversationChat from "../../component/chat/ConversationChat.jsx";
import AddVehicleForm from "../../component/owner/AddVehicleForm.jsx";
import EditVehicleForm from "../../component/owner/EditVehicleForm.jsx";
import OwnerNavbar from "../../component/owner/OwnerNavbar.jsx";
import OwnerProfileForm from "../../component/owner/OwnerProfileForm.jsx";
import OwnerSidebar from "../../component/owner/OwnerSidebar.jsx";
import {
  bookingRequestsAPI,
  bookingsAPI,
  chatAPI,
  getAuthToken,
  notificationsAPI,
  removeAuthToken,
  userDetailsAPI,
  vehicleAPI,
} from "../../utils/api.js";
import { disconnectSocket, getSocket } from "../../utils/socket.js";

const OwnerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [ownerStats, setOwnerStats] = useState({
    activeRentals: 0,
    totalEarnings: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    try {
      const res = await vehicleAPI.getMyVehicles();
      setVehicles(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "vehicles" || activeSection === "dashboard") {
      fetchVehicles();
    }
    if (activeSection !== "vehicles") {
      setEditingVehicleId(null);
      setDetailVehicle(null);
    }
  }, [activeSection, fetchVehicles]);

  // Load notifications & unread count once and keep them in navbar
  useEffect(() => {
    setNotificationsLoading(true);
    notificationsAPI
      .getNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));

    notificationsAPI
      .getUnreadCount()
      .then((n) => setUnreadCount(n))
      .catch(() => setUnreadCount(0));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      if (!notif?.isRead) {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  useEffect(() => {
    if (activeSection === "rentals") {
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
    }
  }, [activeSection]);

  // Load renters list for Chat page
  useEffect(() => {
    if (activeSection !== "chat") return;
    let cancelled = false;
    const fetchChatList = async () => {
      try {
        setChatListLoading(true);
        setChatError(null);
        const data = await chatAPI.getRenters();
        if (!cancelled) {
          setChatList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setChatList([]);
          setChatError(err?.message ?? "Failed to load renters.");
        }
      } finally {
        if (!cancelled) {
          setChatListLoading(false);
        }
      }
    };
    fetchChatList();
    return () => {
      cancelled = true;
    };
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "dashboard") {
      setStatsLoading(true);
      bookingsAPI
        .getOwnerStats()
        .then((data) =>
          setOwnerStats({
            activeRentals: data?.activeRentals ?? 0,
            totalEarnings: data?.totalEarnings ?? 0,
          }),
        )
        .catch(() => setOwnerStats({ activeRentals: 0, totalEarnings: 0 }))
        .finally(() => setStatsLoading(false));
    }
  }, [activeSection]);

  useEffect(() => {
    if (!getAuthToken()) return;

    const fetchUserDetails = async () => {
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

  const handleProfileUpdate = async () => {
    try {
      const res = await userDetailsAPI.getUserDetails(user.id);
      setUserDetails(res?.data || null);
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  const openVehicleDetail = (vehicle) => {
    setDetailVehicle(null);
    setDetailLoading(true);
    vehicleAPI
      .getVehicleById(vehicle.id)
      .then((res) => setDetailVehicle(res.data))
      .catch(() => setDetailVehicle(null))
      .finally(() => setDetailLoading(false));
  };

  const closeVehicleDetail = () => {
    setDetailVehicle(null);
  };

  const handleVehicleUpdated = () => {
    setEditingVehicleId(null);
    fetchVehicles();
  };

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

  const handleDeleteVehicle = async (vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vehicle.brand} ${vehicle.model}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(vehicle.id);
    try {
      await vehicleAPI.deleteVehicle(vehicle.id);
      if (detailVehicle?.id === vehicle.id) closeVehicleDetail();
      setEditingVehicleId((id) => (id === vehicle.id ? null : id));
      fetchVehicles();
    } catch (err) {
      alert(err?.message ?? "Failed to delete vehicle.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAllNotificationsRead = () => {
    notificationsAPI.markAllAsRead().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });
  };

  const handleMarkNotificationRead = (id) => {
    notificationsAPI.markAsRead(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    });
  };

  const ownerPageTitles = {
    dashboard: "Dashboard",
    vehicles: "My Vehicles",
    "add-vehicle": "Add Vehicle",
    rentals: "Rentals",
    earnings: "Earnings",
    chat: "Chat",
    profile: "Profile",
  };
  const pageTitle = ownerPageTitles[activeSection] ?? "Dashboard";

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

  return (
    <div className="flex min-h-screen flex-col bg-[#D9D9D9]">
      <OwnerNavbar
        user={user}
        profilePicture={userDetails?.profilePicture}
        onLogout={handleLogout}
        pageTitle={pageTitle}
        unreadCount={unreadCount}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onMarkNotificationRead={handleMarkNotificationRead}
      />
      <div className="flex flex-1">
        <OwnerSidebar
          activeKey={activeSection}
          onSelect={setActiveSection}
          onLogout={handleLogout}
        />
        <main className="min-w-0 flex-1 px-4 py-12 pl-14 sm:px-6 lg:pl-8">
          <div className="mx-auto max-w-5xl">
            {activeSection === "profile" ? (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-extrabold text-black">
                    Profile
                  </h1>
                  <p className="mt-2 text-[#555555]">
                    Manage your profile information
                  </p>
                </div>
                <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {userDetails?.profilePicture ? (
                        <img
                          src={userDetails.profilePicture}
                          alt={fullName}
                          className="h-16 w-16 rounded-full object-cover border-2 border-[#4DFFBC]"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4DFFBC] text-2xl font-bold text-[#555555]">
                          {user.firstName?.[0]?.toUpperCase() ||
                            user.email[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-black">
                          {fullName}
                        </h2>
                        <p className="text-[#555555]">Profile Information</p>
                      </div>
                    </div>
                    {!isEditingProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#898989] bg-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#555555] transition hover:bg-[#898989] hover:text-white"
                      >
                        <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <OwnerProfileForm
                      user={user}
                      userDetails={userDetails}
                      onSuccess={handleProfileUpdate}
                      onCancel={() => setIsEditingProfile(false)}
                    />
                  ) : (
                    <>
                      {loadingDetails ? (
                        <div className="py-8 text-center text-[#555555]">
                          Loading profile...
                        </div>
                      ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="h-5 w-5 text-[#555555]"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#555555]">
                                Full Name
                              </p>
                              <p className="mt-1 text-lg font-semibold text-black">
                                {fullName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="h-5 w-5 text-[#555555]"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#555555]">
                                Email Address
                              </p>
                              <p className="mt-1 text-lg font-semibold text-black">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {userDetails?.phoneNumber && (
                            <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="h-5 w-5 text-[#555555]"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#555555]">
                                  Phone Number
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black">
                                  {userDetails.phoneNumber}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.dateOfBirth && (
                            <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="h-5 w-5 text-[#555555]"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#555555]">
                                  Date of Birth
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black">
                                  {new Date(
                                    userDetails.dateOfBirth,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.address && (
                            <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#555555]">
                                  Address
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black">
                                  {userDetails.address}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.city && (
                            <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#555555]">
                                  City
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black">
                                  {userDetails.city}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.licenseNumber && (
                            <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faIdCard}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#555555]">
                                  License Number
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black">
                                  {userDetails.licenseNumber}
                                </p>
                                {userDetails.isLicenseVerified && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#4DFFBC]">
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
                            <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#555555]">
                                  License Expiry
                                </p>
                                <p className="mt-1 text-lg font-semibold text-black">
                                  {new Date(
                                    userDetails.licenseExpiry,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.licenseImage && (
                            <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4 md:col-span-2">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faImage}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-[#555555]">
                                  License Image
                                </p>
                                <img
                                  src={userDetails.licenseImage}
                                  alt="License"
                                  className="mt-2 max-h-48 rounded-lg border border-[#898989]"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4 md:col-span-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                              <FontAwesomeIcon
                                icon={faUserTag}
                                className="h-5 w-5 text-orange-600"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#555555]">
                                Role
                              </p>
                              <p className="mt-1 text-lg font-semibold text-black">
                                Vehicle Owner
                              </p>
                            </div>
                          </div>

                          {!userDetails && (
                            <div className="md:col-span-2 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D] px-4 py-3 text-center">
                              <p className="text-[#FF4D4D] text-sm">
                                Complete your profile to get started. Click
                                "Edit Profile" to add your information.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : activeSection === "add-vehicle" ? (
              <AddVehicleForm
                onCancel={() => setActiveSection("dashboard")}
                onSuccess={() => {
                  setActiveSection("vehicles");
                  fetchVehicles();
                }}
              />
            ) : activeSection === "rentals" ? (
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
                                  Requested by: {r.renter.firstName}{" "}
                                  {r.renter.lastName}
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
                      <div className="p-12 text-center text-slate-500">
                        Loading...
                      </div>
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
            ) : activeSection === "vehicles" ? (
              <>
                {editingVehicleId ? (
                  <EditVehicleForm
                    vehicle={vehicles.find((v) => v.id === editingVehicleId)}
                    onSuccess={handleVehicleUpdated}
                    onCancel={() => setEditingVehicleId(null)}
                  />
                ) : (
                  <>
                    {vehiclesLoading ? (
                      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-8 text-center text-slate-500">
                        Loading vehicles...
                      </div>
                    ) : vehicles.length === 0 ? (
                      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-8 text-center">
                        <p className="text-slate-600">
                          You have no vehicles yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveSection("add-vehicle")}
                          className="mt-4 rounded-xl bg-[#FF4D4D] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e63f3f]"
                        >
                          Add your first vehicle
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px]">
                            <thead className="border-b border-[#E2D4C4] bg-[#FFE3BF]">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                  Brand / Model
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                  Year
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                  Type
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                  Verified
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2D4C4]">
                              {vehicles.map((v) => (
                                <tr key={v.id} className="hover:bg-[#FFEFE0]">
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                    {v.brand} {v.model}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {v.manufactureYear}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-600">
                                    {v.vehicleType || "—"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                      {v.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {v.isVerified ? (
                                      <span className="inline-flex items-center gap-1 text-green-600">
                                        <FontAwesomeIcon
                                          icon={faCheckCircle}
                                          className="h-4 w-4"
                                        />
                                        Yes
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">No</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openVehicleDetail(v)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                      >
                                        <FontAwesomeIcon
                                          icon={faEye}
                                          className="h-4 w-4"
                                        />
                                        View details
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingVehicleId(v.id)
                                        }
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                      >
                                        <FontAwesomeIcon
                                          icon={faPenToSquare}
                                          className="h-4 w-4"
                                        />
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteVehicle(v)}
                                        disabled={deletingId === v.id}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        aria-label="Delete vehicle"
                                      >
                                        <FontAwesomeIcon
                                          icon={faTrashCan}
                                          className="h-4 w-4"
                                        />
                                        {deletingId === v.id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* View details modal */}
                {(detailVehicle !== null || detailLoading) && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                        <h2 className="text-xl font-bold text-slate-900">
                          Vehicle details
                        </h2>
                        <button
                          type="button"
                          onClick={closeVehicleDetail}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Close"
                        >
                          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="p-6">
                        {detailLoading ? (
                          <p className="text-slate-500">Loading...</p>
                        ) : detailVehicle ? (
                          <>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-sm font-medium text-slate-500">
                                  Brand / Model
                                </p>
                                <p className="font-semibold text-slate-900">
                                  {detailVehicle.brand} {detailVehicle.model}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">
                                  Year
                                </p>
                                <p className="font-semibold text-slate-900">
                                  {detailVehicle.manufactureYear}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">
                                  Vehicle type
                                </p>
                                <p className="font-semibold text-slate-900">
                                  {detailVehicle.vehicleType || "—"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">
                                  Status
                                </p>
                                <p className="font-semibold text-slate-900">
                                  {detailVehicle.status}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">
                                  Verified
                                </p>
                                <p className="font-semibold text-slate-900">
                                  {detailVehicle.isVerified ? (
                                    <span className="text-green-600">Yes</span>
                                  ) : (
                                    <span className="text-slate-500">No</span>
                                  )}
                                </p>
                              </div>
                              {detailVehicle.color && (
                                <div>
                                  <p className="text-sm font-medium text-slate-500">
                                    Color
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {detailVehicle.color}
                                  </p>
                                </div>
                              )}
                              <div className="sm:col-span-2">
                                <p className="text-sm font-medium text-slate-500">
                                  Price per day (NRP)
                                </p>
                                <p className="font-semibold text-slate-900">
                                  NRP {detailVehicle.pricePerDay}
                                </p>
                              </div>
                              {detailVehicle.description && (
                                <div className="sm:col-span-2">
                                  <p className="text-sm font-medium text-slate-500">
                                    Description
                                  </p>
                                  <p className="text-slate-700">
                                    {detailVehicle.description}
                                  </p>
                                </div>
                              )}
                            </div>

                            {((detailVehicle.images?.length ?? 0) > 0 ||
                              (detailVehicle.documents?.length ?? 0) > 0) && (
                              <div className="mt-6">
                                <p className="mb-2 text-sm font-medium text-slate-700">
                                  Images & documents
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {detailVehicle.images?.map((img) => (
                                    <div
                                      key={img.id}
                                      className="rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50"
                                    >
                                      <img
                                        src={img.imageUrl}
                                        alt="Vehicle"
                                        className="h-40 w-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.style.display = "none";
                                          const fallback =
                                            e.target.nextElementSibling;
                                          if (fallback)
                                            fallback.classList.remove("hidden");
                                        }}
                                      />
                                      <div className="hidden h-40 w-full bg-slate-200">
                                        <div className="flex h-full w-full items-center justify-center text-slate-500">
                                          Image unavailable
                                        </div>
                                      </div>
                                      <div className="px-3 py-2 text-xs text-slate-600">
                                        Vehicle photo
                                      </div>
                                    </div>
                                  ))}
                                  {detailVehicle.documents?.map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="rounded-xl border-2 border-amber-400 overflow-hidden bg-amber-50/50"
                                    >
                                      {doc.documentUrl
                                        ?.toLowerCase?.()
                                        .endsWith(".pdf") ? (
                                        <a
                                          href={doc.documentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex h-40 w-full items-center justify-center bg-amber-100 text-amber-800 hover:bg-amber-200"
                                        >
                                          View PDF document
                                        </a>
                                      ) : (
                                        <>
                                          <img
                                            src={doc.documentUrl}
                                            alt="Vehicle document"
                                            className="h-40 w-full object-cover"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.style.display = "none";
                                              const fallback =
                                                e.target.nextElementSibling;
                                              if (fallback)
                                                fallback.classList.remove(
                                                  "hidden",
                                                );
                                            }}
                                          />
                                          <div className="hidden h-40 w-full bg-amber-100">
                                            <div className="flex h-full w-full items-center justify-center text-amber-700">
                                              Document unavailable
                                            </div>
                                          </div>
                                        </>
                                      )}
                                      <div className="px-3 py-2 text-xs font-medium text-amber-700">
                                        Vehicle document
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  closeVehicleDetail();
                                  setEditingVehicleId(detailVehicle.id);
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <FontAwesomeIcon
                                  icon={faPenToSquare}
                                  className="h-4 w-4"
                                />
                                Edit vehicle
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteVehicle(detailVehicle)
                                }
                                disabled={deletingId === detailVehicle.id}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <FontAwesomeIcon
                                  icon={faTrashCan}
                                  className="h-4 w-4"
                                />
                                {deletingId === detailVehicle.id
                                  ? "Deleting..."
                                  : "Delete vehicle"}
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-slate-500">
                            Could not load vehicle.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : activeSection === "chat" ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Chat</h2>
                  <p className="mt-1 text-slate-600">
                    Chat with your renters in real time
                  </p>
                </div>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]">
                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Renters
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Select a renter to start chatting
                      </p>
                    </div>
                    <div className="max-h-[480px] overflow-y-auto p-3">
                      {chatListLoading ? (
                        <p className="py-6 text-center text-slate-500 text-sm">
                          Loading renters…
                        </p>
                      ) : chatError ? (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                          {chatError}
                        </p>
                      ) : chatList.length === 0 ? (
                        <p className="py-6 text-center text-slate-500 text-sm">
                          No renters found yet.
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {chatList.map((u) => (
                            <li key={u.id}>
                              <button
                                type="button"
                                onClick={() => setChatTargetUser(u)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                                  chatTargetUser?.id === u.id
                                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                                  <span className="text-xs font-semibold">
                                    {(u.firstName?.[0] || u.email?.[0] || "U")
                                      .toString()
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium">
                                    {[u.firstName, u.lastName]
                                      .filter(Boolean)
                                      .join(" ") ||
                                      u.email ||
                                      "User"}
                                  </p>
                                  {u.email && (
                                    <p className="truncate text-xs text-slate-500">
                                      {u.email}
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
                  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 min-h-[360px]">
                    {chatTargetUser ? (
                      <ConversationChat
                        targetUserId={chatTargetUser.id}
                        targetUser={chatTargetUser}
                        currentUser={user}
                        onClose={() => setChatTargetUser(null)}
                        variant="page"
                        theme="light"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-4 text-center text-slate-500 text-sm">
                        Select a renter on the left to start chatting.
                      </div>
                    )}
                  </section>
                </div>
              </>
            ) : (
              <>
                {/* Hero header */}
                <div className="mb-8 rounded-xl border border-[#898989] bg-gradient-to-r from-[#898989] via-[#898989] to-[#898989] px-6 py-6 text-white shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D9D9D9]">
                        Owner overview
                      </p>
                      <h1 className="mt-2 text-2xl font-bold md:text-3xl">
                        Welcome back, {user.firstName || "Owner"}
                      </h1>
                      <p className="mt-1 text-sm text-[#D9D9D9]">
                        Monitor your fleet, rentals and earnings from a single,
                        classic dashboard.
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-right">
                        <p className="text-[11px] uppercase tracking-wide text-[#D9D9D9]">
                          Vehicles listed
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                          {vehicles.length}
                        </p>
                      </div>
                      <div className="hidden rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-right sm:block">
                        <p className="text-[11px] uppercase tracking-wide text-[#D9D9D9]">
                          Unread alerts
                        </p>
                        <p className="mt-1 text-xl font-semibold">
                          {unreadCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary cards */}
                <div className="mb-8 grid gap-6 md:grid-cols-3">
                  <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase text-[#555555]">
                          Vehicles listed
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-black">
                          {vehicles.length}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4D4D] text-white">
                        <FontAwesomeIcon icon={faCar} className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase text-[#555555]">
                          Active rentals
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-black">
                          {statsLoading ? "..." : ownerStats.activeRentals}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4DFFBC] text-[#555555]">
                        <FontAwesomeIcon
                          icon={faChartLine}
                          className="h-5 w-5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase text-[#555555]">
                          Total earnings
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-black">
                          {statsLoading
                            ? "..."
                            : `NRP ${(ownerStats.totalEarnings ?? 0).toLocaleString()}`}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4D4D] text-white">
                        <FontAwesomeIcon
                          icon={faDollarSign}
                          className="h-5 w-5"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main content: actions + profile */}
                <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
                  {/* Actions */}
                  <div className="space-y-4 lg:col-span-2">
                    <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-6 py-5 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-base font-semibold text-black">
                            Add a new vehicle
                          </h2>
                          <p className="mt-1 text-sm text-[#555555]">
                            List another car or bike to grow your earning
                            potential.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSection("add-vehicle")}
                          className="inline-flex items-center gap-2 rounded-lg bg-[#FF4D4D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e63f3f]"
                        >
                          <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                          Add vehicle
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-6 py-5 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-base font-semibold text-black">
                            Manage your fleet
                          </h2>
                          <p className="mt-1 text-sm text-[#555555]">
                            View availability, verification and status for all
                            of your vehicles.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSection("vehicles")}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#898989] bg-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#555555] transition hover:bg-[#898989] hover:text-white"
                        >
                          <FontAwesomeIcon icon={faCar} className="h-4 w-4" />
                          View vehicles
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Owner summary */}
                  <div className="flex h-full flex-col rounded-xl border border-[#898989] bg-[#D9D9D9] px-6 py-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                      {userDetails?.profilePicture ? (
                        <img
                          src={userDetails.profilePicture}
                          alt={fullName}
                          className="h-12 w-12 rounded-full object-cover border-2 border-[#4DFFBC]"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4DFFBC] text-lg font-bold text-[#555555]">
                          {user.firstName?.[0]?.toUpperCase() ||
                            user.email[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-[#555555]">
                          Account owner
                        </p>
                        <p className="text-sm font-semibold text-black">
                          {fullName}
                        </p>
                        <p className="text-xs text-[#555555]">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[#555555]">Role</span>
                        <span className="font-medium text-black">
                          Vehicle Owner
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#555555]">Vehicles listed</span>
                        <span className="font-medium text-black">
                          {vehicles.length}
                        </span>
                      </div>
                      <div className="mt-4 border-top border-[#898989] pt-3 text-xs text-[#555555]">
                        Use the sidebar to switch between rentals, earnings and
                        profile details.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
