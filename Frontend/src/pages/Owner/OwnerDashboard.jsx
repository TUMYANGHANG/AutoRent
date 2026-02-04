import {
  faBell,
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
  faTrashCan,
  faTimesCircle,
  faUser,
  faUserTag,
  faWallet,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddVehicleForm from "../../component/owner/AddVehicleForm.jsx";
import EditVehicleForm from "../../component/owner/EditVehicleForm.jsx";
import OwnerNavbar from "../../component/owner/OwnerNavbar.jsx";
import OwnerSidebar from "../../component/owner/OwnerSidebar.jsx";
import OwnerProfileForm from "../../component/owner/OwnerProfileForm.jsx";
import { getAuthToken, notificationsAPI, removeAuthToken, userDetailsAPI, vehicleAPI } from "../../utils/api.js";

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

  useEffect(() => {
    if (activeSection === "notifications") {
      setNotificationsLoading(true);
      notificationsAPI
        .getNotifications()
        .then((data) => setNotifications(Array.isArray(data) ? data : []))
        .catch(() => setNotifications([]))
        .finally(() => setNotificationsLoading(false));
    }
  }, [activeSection]);

  useEffect(() => {
    notificationsAPI.getUnreadCount().then((n) => setUnreadCount(n)).catch(() => setUnreadCount(0));
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "profile") {
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
    }
  }, [activeSection, user.id]);

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

  const handleDeleteVehicle = async (vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vehicle.brand} ${vehicle.model}"? This cannot be undone.`
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

  const ownerPageTitles = {
    dashboard: "Dashboard",
    notifications: "Notifications",
    vehicles: "My Vehicles",
    "add-vehicle": "Add Vehicle",
    rentals: "Rentals",
    earnings: "Earnings",
    profile: "Profile",
  };
  const pageTitle = ownerPageTitles[activeSection] ?? "Dashboard";

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <OwnerNavbar user={user} onLogout={handleLogout} pageTitle={pageTitle} />
      <div className="flex flex-1">
        <OwnerSidebar
          activeKey={activeSection}
          onSelect={setActiveSection}
          unreadCount={unreadCount}
          onLogout={handleLogout}
        />
        <main className="min-w-0 flex-1 px-4 py-12 pl-14 sm:px-6 lg:pl-8">
          <div className="mx-auto max-w-5xl">
            {activeSection === "notifications" ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                  {notifications.some((n) => !n.isRead) && (
                    <button
                      type="button"
                      onClick={() => {
                        notificationsAPI.markAllAsRead().then(() => {
                          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                          setUnreadCount(0);
                        });
                      }}
                      className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  {notificationsLoading ? (
                    <div className="p-12 text-center text-slate-500">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">No notifications yet.</div>
                  ) : (
                    <ul className="divide-y divide-slate-200">
                      {notifications.map((n) => {
                        const formatDate = (d) => {
                          if (!d) return "—";
                          return new Date(d).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        };
                        return (
                          <li
                            key={n.id}
                            className={`flex items-start gap-4 px-4 py-4 ${!n.isRead ? "bg-orange-50/50" : ""}`}
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
                              <FontAwesomeIcon icon={faBell} className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900">{n.title}</p>
                              {n.message && (
                                <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                              )}
                              <p className="mt-1 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                            </div>
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => {
                                  notificationsAPI.markAsRead(n.id).then(() => {
                                    setNotifications((prev) =>
                                      prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))
                                    );
                                    setUnreadCount((c) => Math.max(0, c - 1));
                                  });
                                }}
                                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                              >
                                Mark read
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </>
            ) : activeSection === "profile" ? (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-extrabold text-slate-900">Profile</h1>
                  <p className="mt-2 text-slate-600">Manage your profile information</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {userDetails?.profilePicture ? (
                        <img
                          src={userDetails.profilePicture}
                          alt={fullName}
                          className="h-16 w-16 rounded-full object-cover border-2 border-orange-500/30"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                          {user.firstName?.[0]?.toUpperCase() ||
                            user.email[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
                        <p className="text-slate-500">Profile Information</p>
                      </div>
                    </div>
                    {!isEditingProfile && (
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                        <div className="py-8 text-center text-slate-500">Loading profile...</div>
                      ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                              <FontAwesomeIcon
                                icon={faUser}
                                className="h-5 w-5 text-orange-600"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">Full Name</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">
                                {fullName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                              <FontAwesomeIcon
                                icon={faEnvelope}
                                className="h-5 w-5 text-orange-600"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">
                                Email Address
                              </p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {userDetails?.phoneNumber && (
                            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Phone Number</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                  {userDetails.phoneNumber}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.dateOfBirth && (
                            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Date of Birth</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                  {new Date(userDetails.dateOfBirth).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.address && (
                            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Address</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                  {userDetails.address}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.city && (
                            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <FontAwesomeIcon
                                  icon={faMapMarkerAlt}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">City</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                  {userDetails.city}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.licenseNumber && (
                            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <FontAwesomeIcon
                                  icon={faIdCard}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">License Number</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                  {userDetails.licenseNumber}
                                </p>
                                {userDetails.isLicenseVerified && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                                    <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {userDetails?.licenseExpiry && (
                            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">License Expiry</p>
                                <p className="mt-1 text-lg font-semibold text-slate-900">
                                  {new Date(userDetails.licenseExpiry).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {userDetails?.licenseImage && (
                            <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 md:col-span-2">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                                <FontAwesomeIcon
                                  icon={faImage}
                                  className="h-5 w-5 text-orange-600"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-500">License Image</p>
                                <img
                                  src={userDetails.licenseImage}
                                  alt="License"
                                  className="mt-2 max-h-48 rounded-lg border border-slate-200"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 md:col-span-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                              <FontAwesomeIcon
                                icon={faUserTag}
                                className="h-5 w-5 text-orange-600"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-500">Role</p>
                              <p className="mt-1 text-lg font-semibold text-slate-900">Vehicle Owner</p>
                            </div>
                          </div>

                          {!userDetails && (
                            <div className="md:col-span-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-center">
                              <p className="text-orange-700 text-sm">
                                Complete your profile to get started. Click "Edit Profile" to add your information.
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
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                        Loading vehicles...
                      </div>
                    ) : vehicles.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                        <p className="text-slate-600">You have no vehicles yet.</p>
                        <button
                          type="button"
                          onClick={() => setActiveSection("add-vehicle")}
                          className="mt-4 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                          Add your first vehicle
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px]">
                            <thead className="border-b border-slate-200 bg-slate-50">
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
                            <tbody className="divide-y divide-slate-200">
                              {vehicles.map((v) => (
                                <tr key={v.id} className="hover:bg-slate-50">
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
                                        <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
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
                                        <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                                        View details
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingVehicleId(v.id)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                      >
                                        <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteVehicle(v)}
                                        disabled={deletingId === v.id}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        aria-label="Delete vehicle"
                                      >
                                        <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4" />
                                        {deletingId === v.id ? "Deleting..." : "Delete"}
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
                        <h2 className="text-xl font-bold text-slate-900">Vehicle details</h2>
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
                                <p className="text-sm font-medium text-slate-500">Brand / Model</p>
                                <p className="font-semibold text-slate-900">
                                  {detailVehicle.brand} {detailVehicle.model}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Year</p>
                                <p className="font-semibold text-slate-900">{detailVehicle.manufactureYear}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Vehicle type</p>
                                <p className="font-semibold text-slate-900">{detailVehicle.vehicleType || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Status</p>
                                <p className="font-semibold text-slate-900">{detailVehicle.status}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-500">Verified</p>
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
                                  <p className="text-sm font-medium text-slate-500">Color</p>
                                  <p className="font-semibold text-slate-900">{detailVehicle.color}</p>
                                </div>
                              )}
                              <div className="sm:col-span-2">
                                <p className="text-sm font-medium text-slate-500">Price per day (NRP)</p>
                                <p className="font-semibold text-slate-900">NRP {detailVehicle.pricePerDay}</p>
                              </div>
                              {detailVehicle.description && (
                                <div className="sm:col-span-2">
                                  <p className="text-sm font-medium text-slate-500">Description</p>
                                  <p className="text-slate-700">{detailVehicle.description}</p>
                                </div>
                              )}
                            </div>

                            {((detailVehicle.images?.length ?? 0) > 0 || (detailVehicle.documents?.length ?? 0) > 0) && (
                              <div className="mt-6">
                                <p className="mb-2 text-sm font-medium text-slate-700">Images & documents</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {detailVehicle.images?.map((img) => (
                                    <div key={img.id} className="rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50">
                                      <img
                                        src={img.imageUrl}
                                        alt="Vehicle"
                                        className="h-40 w-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.style.display = "none";
                                          const fallback = e.target.nextElementSibling;
                                          if (fallback) fallback.classList.remove("hidden");
                                        }}
                                      />
                                      <div className="hidden h-40 w-full bg-slate-200">
                                        <div className="flex h-full w-full items-center justify-center text-slate-500">Image unavailable</div>
                                      </div>
                                      <div className="px-3 py-2 text-xs text-slate-600">Vehicle photo</div>
                                    </div>
                                  ))}
                                  {detailVehicle.documents?.map((doc) => (
                                    <div key={doc.id} className="rounded-xl border-2 border-amber-400 overflow-hidden bg-amber-50/50">
                                      {doc.documentUrl?.toLowerCase?.().endsWith(".pdf") ? (
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
                                              const fallback = e.target.nextElementSibling;
                                              if (fallback) fallback.classList.remove("hidden");
                                            }}
                                          />
                                          <div className="hidden h-40 w-full bg-amber-100">
                                            <div className="flex h-full w-full items-center justify-center text-amber-700">Document unavailable</div>
                                          </div>
                                        </>
                                      )}
                                      <div className="px-3 py-2 text-xs font-medium text-amber-700">Vehicle document</div>
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
                                <FontAwesomeIcon icon={faPenToSquare} className="h-4 w-4" />
                                Edit vehicle
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteVehicle(detailVehicle)}
                                disabled={deletingId === detailVehicle.id}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4" />
                                {deletingId === detailVehicle.id ? "Deleting..." : "Delete vehicle"}
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-slate-500">Could not load vehicle.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900">
                Vehicle Owner Dashboard
              </h1>
              <p className="mt-2 text-slate-600">
                Welcome back, {user.firstName || "User"}! Manage your vehicles and
                earnings.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mb-8 grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Vehicles
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {activeSection === "dashboard" && vehicles.length >= 0 ? vehicles.length : "0"}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <FontAwesomeIcon
                      icon={faCar}
                      className="h-6 w-6 text-orange-600"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Active Rentals
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="h-6 w-6 text-green-600"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Earnings
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">NRP 0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <FontAwesomeIcon
                      icon={faDollarSign}
                      className="h-6 w-6 text-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Available Balance
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">NRP 0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <FontAwesomeIcon
                      icon={faWallet}
                      className="h-6 w-6 text-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setActiveSection("add-vehicle")}
                className="group w-full rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 transition-all duration-300 group-hover:bg-orange-200">
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="h-8 w-8 text-orange-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Add New Vehicle
                    </h3>
                    <p className="mt-1 text-slate-600">
                      List your vehicle and start earning rental income
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSection("vehicles")}
                className="group w-full rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:bg-blue-200">
                    <FontAwesomeIcon
                      icon={faCar}
                      className="h-8 w-8 text-blue-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Manage Vehicles
                    </h3>
                    <p className="mt-1 text-slate-600">
                      View and manage all your listed vehicles
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* User Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                  {user.firstName?.[0]?.toUpperCase() ||
                    user.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
                  <p className="text-slate-500">Profile Information</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-5 w-5 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Full Name</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="h-5 w-5 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Email Address
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 md:col-span-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="h-5 w-5 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Role</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      Vehicle Owner
                    </p>
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
