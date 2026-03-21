import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, getAuthToken, removeAuthToken, userDetailsAPI } from "../utils/api.js";
import { disconnectSocket } from "../utils/socket.js";
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import OwnerDashboard from "./Owner/OwnerDashboard.jsx";
import RenterDashboard from "./User/RenterDashboard.jsx";

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

    const applyUser = (u) => {
      setUser(u);
      if (u) localStorage.setItem("user", JSON.stringify(u));
    };

    // Prefer fresh user from API (includes isProfileVerified)
    authAPI
      .me()
      .then(async (freshUser) => {
        if (!freshUser) {
          throw new Error("No user");
        }

        // For renters, also fetch profile details so we can attach profilePicture
        if (freshUser.role === "renter") {
          try {
            const detailsRes = await userDetailsAPI.getUserDetails(
              freshUser.id,
            );
            const details = detailsRes?.data ?? detailsRes ?? null;
            if (details?.profilePicture) {
              freshUser = { ...freshUser, profilePicture: details.profilePicture };
            }
          } catch {
            // ignore – renter may not have details yet
          }
        }

        applyUser(freshUser);
      })
      .catch(() => {
        // Fallback to localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            applyUser(JSON.parse(userData));
          } catch {
            disconnectSocket();
            localStorage.removeItem("user");
            removeAuthToken();
            navigate("/");
          }
        } else {
          navigate("/");
        }
      });
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Render role-specific dashboard
  switch (user.role) {
    case "renter":
      return <RenterDashboard user={user} />;
    case "owner":
      return <OwnerDashboard user={user} />;
    case "admin":
      return <AdminDashboard user={user} />;
    default:
      // Fallback to renter dashboard for unknown roles
      return <RenterDashboard user={user} />;
  }
};

export default Dashboard;
