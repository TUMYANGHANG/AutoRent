import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken, removeAuthToken } from "../utils/api.js";
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
