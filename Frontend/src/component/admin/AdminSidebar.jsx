import {
  faBars,
  faBell,
  faCar,
  faChartLine,
  faCog,
  faGauge,
  faUser,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: faGauge },
  { key: "notifications", label: "Notifications", icon: faBell },
  { key: "users", label: "User Management", icon: faUsers },
  { key: "vehicles", label: "Vehicle Management", icon: faCar },
  { key: "reports", label: "Reports", icon: faChartLine },
  { key: "settings", label: "Settings", icon: faCog },
  { key: "profile", label: "Profile", icon: faUser },
];

const AdminSidebar = ({ activeKey = "dashboard", onSelect, unreadCount = 0 }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:justify-end">
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          aria-label="Close menu"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelect?.(item.key);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-red-500/15 text-red-600 ring-1 ring-red-500/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.key === "notifications" && unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-24 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
        aria-label="Open menu"
      >
        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="w-0 shrink-0 lg:w-64">
        <aside
          className={`fixed left-0 top-20 z-50 h-[calc(100vh-5rem)] w-64 border-r border-slate-200 bg-white shadow-lg transition-transform duration-300 lg:relative lg:left-0 lg:top-0 lg:h-full lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
};

export default AdminSidebar;
export { navItems as adminNavItems };
