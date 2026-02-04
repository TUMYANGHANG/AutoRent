import {
  faCalendar,
  faCalendarCheck,
  faCar,
  faCheckCircle,
  faClock,
  faEdit,
  faEnvelope,
  faHistory,
  faHome,
  faIdCard,
  faImage,
  faMapMarkerAlt,
  faPhone,
  faRightFromBracket,
  faSearch,
  faUser,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RenterProfileForm from "../../component/renter/RenterProfileForm.jsx";
import { getAuthToken, removeAuthToken, userDetailsAPI } from "../../utils/api.js";

const RenterDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleProfileUpdate = async () => {
    try {
      const res = await userDetailsAPI.getUserDetails(user.id);
      setUserDetails(res?.data || null);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
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
              Welcome back, {user.firstName || "User"}! Find and book your perfect
              vehicle.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 self-start">
            <Link
              to="/"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500/20 px-5 py-3 font-semibold text-amber-400 ring-1 ring-amber-500/40 transition hover:bg-amber-500/30 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <FontAwesomeIcon icon={faHome} className="h-5 w-5" />
              Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 font-semibold text-white/90 ring-1 ring-white/20 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-200/80">
                  Active Rentals
                </p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/25">
                <FontAwesomeIcon
                  icon={faCar}
                  className="h-6 w-6 text-amber-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sky-200/80">
                  Upcoming Bookings
                </p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/25">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="h-6 w-6 text-sky-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-200/80">
                  Total Rentals
                </p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
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

        {/* Quick Actions */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
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

          <Link
            to="/dashboard"
            className="group flex cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition-all duration-300 hover:scale-[1.02] hover:border-sky-500/30 hover:bg-sky-500/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20 transition group-hover:bg-sky-500/30">
                <FontAwesomeIcon
                  icon={faClock}
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
          </Link>
        </div>

        {/* User Info Card */}
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
                <div className="py-8 text-center text-white/60">Loading profile...</div>
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
                      <p className="text-sm font-medium text-white/70">Full Name</p>
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
                        <p className="text-sm font-medium text-white/70">Phone Number</p>
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
                        <p className="text-sm font-medium text-white/70">Date of Birth</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {new Date(userDetails.dateOfBirth).toLocaleDateString()}
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
                        <p className="text-sm font-medium text-white/70">Address</p>
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
                        <p className="text-sm font-medium text-white/70">City</p>
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
                        <p className="text-sm font-medium text-white/70">License Number</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {userDetails.licenseNumber}
                        </p>
                        {userDetails.isLicenseVerified && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                            <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
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
                        <p className="text-sm font-medium text-white/70">License Expiry</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {new Date(userDetails.licenseExpiry).toLocaleDateString()}
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
                        <p className="text-sm font-medium text-white/70">License Image</p>
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
                      <p className="text-sm font-medium text-white/70">Role</p>
                      <p className="mt-1 text-lg font-semibold text-white">Renter</p>
                    </div>
                  </div>

                  {!userDetails && (
                    <div className="md:col-span-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-center">
                      <p className="text-amber-200/80 text-sm">
                        Complete your profile to get started. Click "Edit Profile" to add your information.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenterDashboard;
