import {
  faEnvelope,
  faUser,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, removeAuthToken } from "../utils/api.js";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = getAuthToken();
    if (!token) {
      navigate("/");
      return;
    }

    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem("user");
        removeAuthToken();
        navigate("/");
      }
    } else {
      // No user data, redirect to home
      navigate("/");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const roleDisplayName = {
    admin: "Administrator",
    renter: "Renter",
    owner: "Vehicle Owner",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white">
            {roleDisplayName[user.role] || user.role} Dashboard
          </h1>
          <p className="mt-2 text-white/60">
            Welcome back, {user.firstName || "User"}!
          </p>
        </div>

        {/* User Info Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-2xl font-bold text-orange-400">
              {user.firstName?.[0]?.toUpperCase() ||
                user.email[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-white/60">Profile Information</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                <FontAwesomeIcon
                  icon={faUser}
                  className="h-5 w-5 text-orange-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">Full Name</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {fullName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="h-5 w-5 text-orange-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">
                  Email Address
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                <FontAwesomeIcon
                  icon={faUserTag}
                  className="h-5 w-5 text-orange-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">Role</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {roleDisplayName[user.role] || user.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content Placeholder */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white">Quick Actions</h3>
          <p className="mt-2 text-white/60">
            Dashboard content specific to{" "}
            {roleDisplayName[user.role] || user.role} will be added here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
