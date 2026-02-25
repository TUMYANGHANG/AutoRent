import {
  faBan,
  faBell,
  faCar,
  faChartBar,
  faCheckCircle,
  faEnvelope,
  faEye,
  faIdCard,
  faImage,
  faPhone,
  faShield,
  faTrashCan,
  faUser,
  faUserTag,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../component/admin/AdminNavbar.jsx";
import AdminSidebar from "../../component/admin/AdminSidebar.jsx";
import { adminAPI, notificationsAPI, removeAuthToken } from "../../utils/api.js";

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicleOwnerFilter, setVehicleOwnerFilter] = useState("");
  const [allOwners, setAllOwners] = useState([]);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({
    totalVehicles: 0,
    totalUsers: 0,
    activeRentals: 0,
    pendingActions: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [pendingProfilesLoading, setPendingProfilesLoading] = useState(false);
  const [verifyProfileLoading, setVerifyProfileLoading] = useState(null);
  const [rejectProfileLoading, setRejectProfileLoading] = useState(null);
  const [profileDetailUser, setProfileDetailUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState(""); // "" | "renter" | "owner"
  const [deleteUserLoading, setDeleteUserLoading] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const adminPageTitles = {
    dashboard: "Dashboard",
    notifications: "Notifications",
    users: "User Management",
    vehicles: "Vehicle Management",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
  };
  const pageTitle = adminPageTitles[activeSection] ?? "Dashboard";

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    if (activeSection !== "vehicles") return;
    setVehiclesLoading(true);
    const params = vehicleOwnerFilter ? { ownerId: vehicleOwnerFilter } : {};
    adminAPI
      .getAllVehicles(params)
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setVehicles(data);
        if (!vehicleOwnerFilter) {
          const seen = new Set();
          const owners = data
            .map((v) => v.owner)
            .filter((o) => o?.id && !seen.has(o.id) && seen.add(o.id));
          setAllOwners(owners);
        }
      })
      .catch(() => setVehicles([]))
      .finally(() => setVehiclesLoading(false));
  }, [activeSection, vehicleOwnerFilter]);

  useEffect(() => {
    if (activeSection === "dashboard") {
      setStatsLoading(true);
      adminAPI
        .getStats()
        .then((res) => {
          const data = res?.data ?? {};
          setDashboardStats((prev) => ({
            ...prev,
            totalVehicles: data.totalVehicles ?? 0,
            totalUsers: data.totalUsers ?? 0,
            activeRentals: data.activeRentals ?? 0,
            pendingActions: data.pendingActions ?? 0,
          }));
        })
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "users") {
      setAllUsersLoading(true);
      const role = userRoleFilter === "renter" || userRoleFilter === "owner" ? userRoleFilter : undefined;
      adminAPI
        .getAllUsers(role)
        .then((list) => setAllUsers(Array.isArray(list) ? list : []))
        .catch(() => setAllUsers([]))
        .finally(() => setAllUsersLoading(false));
    }
  }, [activeSection, userRoleFilter]);

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

  const openVehicleDetail = (vehicle) => {
    setDetailVehicle(null);
    setDetailLoading(true);
    adminAPI
      .getVehicleById(vehicle.id)
      .then((res) => setDetailVehicle(res.data))
      .catch(() => setDetailVehicle(null))
      .finally(() => setDetailLoading(false));
  };

  const closeVehicleDetail = () => {
    setDetailVehicle(null);
  };

  const refreshDashboardStats = () => {
    adminAPI
      .getStats()
      .then((res) => {
        const data = res?.data ?? {};
        setDashboardStats((prev) => ({
          ...prev,
          totalVehicles: data.totalVehicles ?? prev.totalVehicles,
          totalUsers: data.totalUsers ?? prev.totalUsers,
          activeRentals: data.activeRentals ?? prev.activeRentals,
          pendingActions: data.pendingActions ?? prev.pendingActions,
        }));
      })
      .catch(() => {});
  };

  const handleVerifyProfile = (userId) => {
    setVerifyProfileLoading(userId);
    adminAPI
      .verifyProfile(userId, true)
      .then(() => {
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isProfileVerified: true } : u))
        );
        if (profileDetailUser?.id === userId) {
          setProfileDetailUser((p) => (p ? { ...p, isProfileVerified: true } : null));
        }
      })
      .finally(() => setVerifyProfileLoading(null));
  };

  const handleRejectProfile = (userId) => {
    setRejectProfileLoading(userId);
    adminAPI
      .verifyProfile(userId, false)
      .then(() => {
        setAllUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isProfileVerified: false } : u))
        );
        if (profileDetailUser?.id === userId) {
          setProfileDetailUser((p) => (p ? { ...p, isProfileVerified: false } : null));
        }
      })
      .finally(() => setRejectProfileLoading(null));
  };

  const handleDeleteUser = (userId) => {
    setDeleteUserLoading(userId);
    adminAPI
      .deleteUser(userId)
      .then(() => {
        setAllUsers((prev) => prev.filter((u) => u.id !== userId));
        setDeleteConfirmUser(null);
        if (profileDetailUser?.id === userId) setProfileDetailUser(null);
      })
      .finally(() => setDeleteUserLoading(null));
  };

  const handleVerifyVehicle = (vehicleId) => {
    setVerifyLoading(vehicleId);
    adminAPI
      .updateVehicleVerify(vehicleId, true)
      .then((res) => {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === vehicleId ? { ...v, isVerified: true } : v,
          ),
        );
        if (detailVehicle?.id === vehicleId) {
          setDetailVehicle((prev) =>
            prev ? { ...prev, isVerified: true } : null,
          );
        }
        refreshDashboardStats();
      })
      .finally(() => setVerifyLoading(null));
  };

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <>
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Users
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {statsLoading ? "—" : dashboardStats.totalUsers}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="h-6 w-6 text-red-600"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Vehicles
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {statsLoading ? "—" : dashboardStats.totalVehicles}
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <FontAwesomeIcon
                    icon={faChartBar}
                    className="h-6 w-6 text-blue-600"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Pending Actions
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {statsLoading ? "—" : dashboardStats.pendingActions}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <FontAwesomeIcon
                    icon={faShield}
                    className="h-6 w-6 text-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
                {user.firstName?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {fullName}
                </h2>
                <p className="text-slate-500">Administrator Profile</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                <FontAwesomeIcon
                  icon={faUser}
                  className="h-5 w-5 text-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="h-5 w-5 text-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 md:col-span-2">
                <FontAwesomeIcon
                  icon={faUserTag}
                  className="h-5 w-5 text-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-500">Role</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeSection === "notifications") {
      const formatDate = (d) => {
        if (!d) return "—";
        const date = new Date(d);
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      return (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent notifications</h2>
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
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-4 px-4 py-4 ${!n.isRead ? "bg-red-50/50" : ""}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                      <FontAwesomeIcon icon={faBell} className="h-5 w-5 text-red-600" />
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
                ))}
              </ul>
            )}
          </div>
        </>
      );
    }

    if (activeSection === "vehicles") {
      const ownerLabel = (o) =>
        [o?.firstName, o?.lastName].filter(Boolean).join(" ") || o?.email || "—";
      return (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="vehicle-owner-filter" className="text-sm font-medium text-slate-700">
              Filter by owner:
            </label>
            <select
              id="vehicle-owner-filter"
              value={vehicleOwnerFilter}
              onChange={(e) => setVehicleOwnerFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All owners</option>
              {allOwners.map((o) => (
                <option key={o.id} value={o.id}>
                  {ownerLabel(o)} {o?.email ? `(${o.email})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {vehiclesLoading ? (
              <div className="p-12 text-center text-slate-500">
                Loading vehicles...
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No vehicles found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Brand / Model
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Owner
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
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {v.brand} {v.model}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {ownerLabel(v.owner)}
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
                          <button
                            type="button"
                            onClick={() => openVehicleDetail(v)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      );
    }

    if (activeSection === "users") {
      const fullName = (u) =>
        [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "—";
      const initial = (u) =>
        (u?.firstName?.[0] || u?.lastName?.[0] || u?.email?.[0] || "?").toUpperCase();
      return (
        <>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">User Management</h2>
          <p className="mb-4 text-sm text-slate-600">
            View all users. Filter by role, verify renter profiles, or delete users.
          </p>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <label htmlFor="user-role-filter" className="text-sm font-medium text-slate-700">
              Filter by role:
            </label>
            <select
              id="user-role-filter"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All (Owner & Renter)</option>
              <option value="owner">Owner</option>
              <option value="renter">Renter</option>
            </select>
          </div>

          {allUsersLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              Loading users...
            </div>
          ) : allUsers.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
              No users found.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-700">
                      {initial(u)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">{fullName(u)}</p>
                      <p className="text-sm text-slate-600 truncate">{u.email}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            u.role === "owner"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {u.role}
                        </span>
                        {u.role === "renter" && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              u.isProfileVerified ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {u.isProfileVerified ? "Verified" : "Pending"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setProfileDetailUser(u)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                      View
                    </button>
                    {u.role === "renter" && !u.isProfileVerified && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleVerifyProfile(u.id)}
                          disabled={verifyProfileLoading === u.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                          {verifyProfileLoading === u.id ? "Verifying..." : "Verify"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectProfile(u.id)}
                          disabled={rejectProfileLoading === u.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-60"
                          title="Reject (e.g. wrong license)"
                        >
                          <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
                          {rejectProfileLoading === u.id ? "Rejecting..." : "Reject"}
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmUser(u)}
                      disabled={deleteUserLoading === u.id || u.id === user?.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={u.id === user?.id ? "Cannot delete yourself" : "Delete user"}
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4" />
                      {deleteUserLoading === u.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Profile detail modal */}
          {profileDetailUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    {profileDetailUser.role === "renter" ? "Renter" : "Owner"} profile
                  </h2>
                  <button
                    type="button"
                    onClick={() => setProfileDetailUser(null)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Close"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                      <FontAwesomeIcon icon={faUser} className="h-5 w-5 text-slate-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="font-semibold text-slate-900">{fullName(profileDetailUser)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                      <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-slate-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-semibold text-slate-900">{profileDetailUser.email}</p>
                      </div>
                    </div>
                    {profileDetailUser.phoneNumber && (
                      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 sm:col-span-2">
                        <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500">Phone</p>
                          <p className="font-semibold text-slate-900">{profileDetailUser.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    {profileDetailUser.address && (
                      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 sm:col-span-2">
                        <div>
                          <p className="text-sm text-slate-500">Address</p>
                          <p className="font-semibold text-slate-900">{profileDetailUser.address}{profileDetailUser.city ? `, ${profileDetailUser.city}` : ""}</p>
                        </div>
                      </div>
                    )}
                    {(profileDetailUser.licenseNumber || profileDetailUser.licenseExpiry) && (
                      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 sm:col-span-2">
                        <FontAwesomeIcon icon={faIdCard} className="h-5 w-5 text-slate-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-500">License</p>
                          <p className="font-semibold text-slate-900">
                            {profileDetailUser.licenseNumber || "—"}
                            {profileDetailUser.licenseExpiry && (
                              <span className="text-slate-600 font-normal">
                                {" "}(exp: {new Date(profileDetailUser.licenseExpiry).toLocaleDateString()})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {profileDetailUser.licenseImage && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700 flex items-center gap-2">
                        <FontAwesomeIcon icon={faImage} className="h-4 w-4" />
                        License image
                      </p>
                      <img
                        src={profileDetailUser.licenseImage}
                        alt="License"
                        className="max-h-80 rounded-xl border border-slate-200 object-contain bg-slate-50"
                      />
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                    {profileDetailUser.role === "renter" && !profileDetailUser.isProfileVerified && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleVerifyProfile(profileDetailUser.id)}
                          disabled={verifyProfileLoading === profileDetailUser.id}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                          {verifyProfileLoading === profileDetailUser.id ? "Verifying..." : "Verify profile"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectProfile(profileDetailUser.id)}
                          disabled={rejectProfileLoading === profileDetailUser.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-60"
                        >
                          <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
                          {rejectProfileLoading === profileDetailUser.id ? "Rejecting..." : "Reject"}
                        </button>
                      </>
                    )}
                    {profileDetailUser.role === "renter" && profileDetailUser.isProfileVerified && (
                      <p className="text-sm text-slate-500">Verified. Verify/Reject will appear again after the renter edits their profile.</p>
                    )}
                    {profileDetailUser.id !== user?.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDetailUser(null);
                          setDeleteConfirmUser(profileDetailUser);
                        }}
                        disabled={deleteUserLoading === profileDetailUser.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4" />
                        Delete user
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirmation modal */}
          {deleteConfirmUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900">Delete user?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  This will permanently delete <strong>{fullName(deleteConfirmUser)}</strong> ({deleteConfirmUser.email}) and all related data. This cannot be undone.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmUser(null)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(deleteConfirmUser.id)}
                    disabled={deleteUserLoading === deleteConfirmUser.id}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {deleteUserLoading === deleteConfirmUser.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }

    if (activeSection === "reports" || activeSection === "settings") {
      return <p className="text-slate-600">Coming soon.</p>;
    }

    if (activeSection === "profile") {
      return (
        <p className="text-slate-600">
          Manage your admin profile. Coming soon.
        </p>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminNavbar user={user} onLogout={handleLogout} pageTitle={pageTitle} />
      <div className="flex flex-1">
        <AdminSidebar activeKey={activeSection} onSelect={setActiveSection} unreadCount={unreadCount} />
        <main className="min-w-0 flex-1 px-4 py-12 pl-14 sm:px-6 lg:pl-8">
          <div className="mx-auto max-w-5xl">{renderContent()}</div>
        </main>
      </div>

      {/* Vehicle detail modal */}
      {(detailVehicle !== null || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
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
                        Make / Model
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.make} {detailVehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Year</p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        License plate
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.licensePlate}
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

                  {((detailVehicle.images?.length ?? 0) > 0 || (detailVehicle.documents?.length ?? 0) > 0) && (
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
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.classList.remove("hidden");
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
                            )}
                            <div className="hidden h-40 w-full bg-amber-100">
                              <div className="flex h-full w-full items-center justify-center text-amber-700">
                                Document unavailable
                              </div>
                            </div>
                            <div className="px-3 py-2 text-xs font-medium text-amber-700">
                              Vehicle document
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!detailVehicle.isVerified && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <p className="mb-2 text-sm text-slate-600">
                        After reviewing the vehicle documents above, you can
                        verify this vehicle.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleVerifyVehicle(detailVehicle.id)}
                        disabled={verifyLoading === detailVehicle.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="h-4 w-4"
                        />
                        {verifyLoading === detailVehicle.id
                          ? "Verifying..."
                          : "Verify vehicle"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500">Could not load vehicle.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
