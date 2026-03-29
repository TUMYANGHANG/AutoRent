import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddVehicleForm from "../../component/owner/AddVehicleForm.jsx";
import OwnerNavbar from "../../component/owner/OwnerNavbar.jsx";
import OwnerSidebar from "../../component/owner/OwnerSidebar.jsx";
import {
  getAuthToken,
  notificationsAPI,
  removeAuthToken,
  userDetailsAPI,
  vehicleAPI,
} from "../../utils/api.js";
import { disconnectSocket, getSocket } from "../../utils/socket.js";
import OwnerChat from "./OwnerChat.jsx";
import OwnerEarnings from "./OwnerEarnings.jsx";
import OwnerOverview from "./OwnerOverview.jsx";
import OwnerProfile from "./OwnerProfile.jsx";
import OwnerRentals from "./OwnerRentals.jsx";
import OwnerVehicles from "./OwnerVehicles.jsx";

const OwnerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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

  const handleLogout = () => {
    disconnectSocket();
    removeAuthToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await vehicleAPI.getMyVehicles();
      setVehicles(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setVehicles([]);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
    } catch (err) {
      console.error("Failed to refresh profile:", err);
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

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <OwnerOverview
            user={user}
            userDetails={userDetails}
            vehicles={vehicles}
            unreadCount={unreadCount}
            onNavigate={setActiveSection}
          />
        );
      case "profile":
        return (
          <OwnerProfile
            user={user}
            userDetails={userDetails}
            loadingDetails={loadingDetails}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "add-vehicle":
        return (
          <AddVehicleForm
            onCancel={() => setActiveSection("dashboard")}
            onSuccess={() => {
              setActiveSection("vehicles");
              fetchVehicles();
            }}
          />
        );
      case "rentals":
        return <OwnerRentals />;
      case "earnings":
        return <OwnerEarnings />;
      case "vehicles":
        return (
          <OwnerVehicles
            onNavigateAddVehicle={() => setActiveSection("add-vehicle")}
          />
        );
      case "chat":
        return <OwnerChat user={user} />;
      default:
        return null;
    }
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
          onExpandChange={setSidebarExpanded}
        />
        <main
          className="min-w-0 flex-1 px-4 py-12 sm:px-6"
          style={{
            marginLeft: sidebarExpanded ? 272 : 32,
            transition: "margin-left 0.28s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="mx-auto max-w-5xl">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
