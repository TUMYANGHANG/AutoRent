import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../component/admin/AdminNavbar.jsx";
import AdminSidebar, {
  ADMIN_SIDEBAR_COLLAPSED_PX,
  ADMIN_SIDEBAR_EXPANDED_PX,
} from "../../component/admin/AdminSidebar.jsx";
import { notificationsAPI, removeAuthToken } from "../../utils/api.js";
import { disconnectSocket, getSocket } from "../../utils/socket.js";
import AdminNotifications from "./AdminNotifications.jsx";
import AdminOverview from "./AdminOverview.jsx";
import AdminProfile from "./AdminProfile.jsx";
import AdminReports from "./AdminReports.jsx";
import AdminUsers from "./AdminUsers.jsx";
import AdminVehicles from "./AdminVehicles.jsx";

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

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

  const handleLogout = () => {
    disconnectSocket();
    removeAuthToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    notificationsAPI
      .getUnreadCount()
      .then((n) => setUnreadCount(n))
      .catch(() => setUnreadCount(0));
  }, [activeSection]);

  useEffect(() => {
    setNotificationsLoading(true);
    notificationsAPI
      .getNotifications()
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setNotificationsLoading(false));
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
        return <AdminOverview />;
      case "notifications":
        return (
          <AdminNotifications
            notifications={notifications}
            notificationsLoading={notificationsLoading}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onMarkRead={handleMarkNotificationRead}
          />
        );
      case "users":
        return <AdminUsers currentUser={user} />;
      case "vehicles":
        return <AdminVehicles />;
      case "reports":
        return <AdminReports />;
      case "profile":
        return <AdminProfile user={user} />;
      case "settings":
        return (
          <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-8">
            <p className="text-[#555555]">Coming soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AdminNavbar
        user={user}
        onLogout={handleLogout}
        pageTitle={pageTitle}
        unreadCount={unreadCount}
        notifications={notifications}
        notificationsLoading={notificationsLoading}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onMarkNotificationRead={handleMarkNotificationRead}
      />
      <div className="flex flex-1">
        <AdminSidebar
          activeKey={activeSection}
          onSelect={setActiveSection}
          onLogout={handleLogout}
          onExpandChange={setSidebarExpanded}
        />
        <main
          className="min-w-0 flex-1 bg-white px-4 py-12 sm:px-6"
          style={{
            marginLeft: sidebarExpanded
              ? ADMIN_SIDEBAR_EXPANDED_PX
              : ADMIN_SIDEBAR_COLLAPSED_PX,
            transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <div className="mx-auto max-w-5xl">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
