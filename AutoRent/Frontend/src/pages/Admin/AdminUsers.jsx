import {
  faBan,
  faCheckCircle,
  faEnvelope,
  faEye,
  faIdCard,
  faImage,
  faPhone,
  faTrashCan,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { PageHeader } from "../../component/dashboard/DashboardPrimitives.jsx";
import { adminAPI } from "../../utils/api.js";

const AdminUsers = ({ currentUser }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [profileDetailUser, setProfileDetailUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [verifyProfileLoading, setVerifyProfileLoading] = useState(null);
  const [rejectProfileLoading, setRejectProfileLoading] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(null);

  useEffect(() => {
    setAllUsersLoading(true);
    const role =
      userRoleFilter === "renter" || userRoleFilter === "owner"
        ? userRoleFilter
        : undefined;
    adminAPI
      .getAllUsers(role)
      .then((list) => setAllUsers(Array.isArray(list) ? list : []))
      .catch(() => setAllUsers([]))
      .finally(() => setAllUsersLoading(false));
  }, [userRoleFilter]);

  useEffect(() => {
    const role =
      userRoleFilter === "renter" || userRoleFilter === "owner"
        ? userRoleFilter
        : undefined;
    const interval = setInterval(() => {
      adminAPI
        .getAllUsers(role)
        .then((list) => setAllUsers(Array.isArray(list) ? list : []))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [userRoleFilter]);

  const handleVerifyProfile = (userId) => {
    setVerifyProfileLoading(userId);
    adminAPI
      .verifyProfile(userId, true)
      .then(() => {
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, isProfileVerified: true } : u,
          ),
        );
        if (profileDetailUser?.id === userId) {
          setProfileDetailUser((p) =>
            p ? { ...p, isProfileVerified: true } : null,
          );
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
          prev.map((u) =>
            u.id === userId ? { ...u, isProfileVerified: false } : u,
          ),
        );
        if (profileDetailUser?.id === userId) {
          setProfileDetailUser((p) =>
            p ? { ...p, isProfileVerified: false } : null,
          );
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

  const fullName = (u) =>
    [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || "—";

  const initial = (u) =>
    (
      u?.firstName?.[0] ||
      u?.lastName?.[0] ||
      u?.email?.[0] ||
      "?"
    ).toUpperCase();

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="User management"
        subtitle="Filter by role, verify renter profiles, and manage accounts."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label
          htmlFor="user-role-filter"
          className="text-sm font-medium text-slate-600"
        >
          Filter by role:
        </label>
        <select
          id="user-role-filter"
          value={userRoleFilter}
          onChange={(e) => setUserRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="">All (Owner & Renter)</option>
          <option value="owner">Owner</option>
          <option value="renter">Renter</option>
        </select>
      </div>

      {allUsersLoading ? (
        <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm p-12 text-center text-slate-600 shadow-sm">
          Loading users...
        </div>
      ) : allUsers.length === 0 ? (
        <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm p-12 text-center text-slate-600 shadow-sm">
          No users found.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allUsers.map((u) => (
            <div
              key={u.id}
              className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-lg font-bold text-white shadow-md">
                  {initial(u)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-black truncate">
                    {fullName(u)}
                  </p>
                  <p className="text-sm text-slate-600 truncate">{u.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === "owner"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-teal-100 text-teal-800"
                      }`}
                    >
                      {u.role}
                    </span>
                    {u.role === "renter" && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.isProfileVerified
                            ? "bg-teal-100 text-teal-800"
                            : "bg-slate-100 text-slate-600"
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
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-teal-300 hover:bg-teal-50"
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
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md hover:from-teal-500 hover:to-emerald-500 disabled:opacity-60"
                    >
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="h-4 w-4"
                      />
                      {verifyProfileLoading === u.id
                        ? "Verifying..."
                        : "Verify"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectProfile(u.id)}
                      disabled={rejectProfileLoading === u.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                      title="Reject (e.g. wrong license)"
                    >
                      <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
                      {rejectProfileLoading === u.id
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(u)}
                  disabled={
                    deleteUserLoading === u.id || u.id === currentUser?.id
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    u.id === currentUser?.id
                      ? "Cannot delete yourself"
                      : "Delete user"
                  }
                >
                  <FontAwesomeIcon icon={faTrashCan} className="h-4 w-4" />
                  {deleteUserLoading === u.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {profileDetailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4">
              <h2 className="text-xl font-bold text-black">
                {profileDetailUser.role === "renter" ? "Renter" : "Owner"}{" "}
                profile
              </h2>
              <button
                type="button"
                onClick={() => setProfileDetailUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-4">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="mt-0.5 h-5 w-5 text-teal-600"
                  />
                  <div>
                    <p className="text-sm text-slate-600">Name</p>
                    <p className="font-semibold text-black">
                      {fullName(profileDetailUser)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-4">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="mt-0.5 h-5 w-5 text-teal-600"
                  />
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-semibold text-black">
                      {profileDetailUser.email}
                    </p>
                  </div>
                </div>
                {profileDetailUser.phoneNumber && (
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-4 sm:col-span-2">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mt-0.5 h-5 w-5 text-teal-600"
                    />
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <p className="font-semibold text-black">
                        {profileDetailUser.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}
                {profileDetailUser.address && (
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-4 sm:col-span-2">
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-semibold text-black">
                        {profileDetailUser.address}
                        {profileDetailUser.city
                          ? `, ${profileDetailUser.city}`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}
                {(profileDetailUser.licenseNumber ||
                  profileDetailUser.licenseExpiry) && (
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/90 p-4 sm:col-span-2">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="mt-0.5 h-5 w-5 text-teal-600"
                    />
                    <div>
                      <p className="text-sm text-slate-600">License</p>
                      <p className="font-semibold text-black">
                        {profileDetailUser.licenseNumber || "—"}
                        {profileDetailUser.licenseExpiry && (
                          <span className="text-slate-600 font-normal">
                            {" "}
                            (exp:{" "}
                            {new Date(
                              profileDetailUser.licenseExpiry,
                            ).toLocaleDateString()}
                            )
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {profileDetailUser.licenseImage && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-600 flex items-center gap-2">
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
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {profileDetailUser.role === "renter" &&
                  !profileDetailUser.isProfileVerified && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyProfile(profileDetailUser.id)
                        }
                        disabled={verifyProfileLoading === profileDetailUser.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-teal-500 hover:to-emerald-500 disabled:opacity-60"
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="h-4 w-4"
                        />
                        {verifyProfileLoading === profileDetailUser.id
                          ? "Verifying..."
                          : "Verify profile"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleRejectProfile(profileDetailUser.id)
                        }
                        disabled={rejectProfileLoading === profileDetailUser.id}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                      >
                        <FontAwesomeIcon icon={faBan} className="h-4 w-4" />
                        {rejectProfileLoading === profileDetailUser.id
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </>
                  )}
                {profileDetailUser.role === "renter" &&
                  profileDetailUser.isProfileVerified && (
                    <p className="text-sm text-slate-600">
                      Verified. Verify/Reject will appear again after the renter
                      edits their profile.
                    </p>
                  )}
                {profileDetailUser.id !== currentUser?.id && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDetailUser(null);
                      setDeleteConfirmUser(profileDetailUser);
                    }}
                    disabled={deleteUserLoading === profileDetailUser.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
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

      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm p-6 shadow-xl">
            <h3 className="text-lg font-bold text-black">Delete user?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently delete{" "}
              <strong>{fullName(deleteConfirmUser)}</strong> (
              {deleteConfirmUser.email}) and all related data. This cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser.id)}
                disabled={deleteUserLoading === deleteConfirmUser.id}
                className="rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-rose-500 hover:to-rose-400 disabled:opacity-60"
              >
                {deleteUserLoading === deleteConfirmUser.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUsers;
