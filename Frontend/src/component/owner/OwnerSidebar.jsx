import {
  faBars,
  faBell,
  faCar,
  faChartLine,
  faDollarSign,
  faGauge,
  faPlus,
  faRightFromBracket,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: faGauge },
  { key: "notifications", label: "Notifications", icon: faBell },
  { key: "vehicles", label: "My Vehicles", icon: faCar },
  { key: "add-vehicle", label: "Add Vehicle", icon: faPlus },
  { key: "rentals", label: "Rentals", icon: faChartLine },
  { key: "earnings", label: "Earnings", icon: faDollarSign },
  { key: "profile", label: "Profile", icon: faUser },
];

const OwnerSidebar = ({ activeKey = "dashboard", onSelect, unreadCount = 0, onLogout }) => {
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
                  ? "bg-orange-500/15 text-orange-600 ring-1 ring-orange-500/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="h-5 w-5 shrink-0"
              />
              <span className="flex-1">{item.label}</span>
              {item.key === "notifications" && unreadCount > 0 && (
                <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      {onLogout && (
        <div className="border-t border-slate-200 px-3 py-4">
          <button
            type="button"
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-24 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 lg:hidden"
        aria-label="Open menu"
      >
        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      </button>

      {/* Backdrop when mobile sidebar is open */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: in-flow on desktop (no overlap), overlay on mobile */}
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

export default OwnerSidebar;
export { navItems };
