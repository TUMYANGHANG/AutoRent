import {
  faBars,
  faCar,
  faChartLine,
  faComments,
  faDollarSign,
  faGauge,
  faPlus,
  faRightFromBracket,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: faGauge },
  { key: "vehicles", label: "My Vehicles", icon: faCar },
  { key: "add-vehicle", label: "Add Vehicle", icon: faPlus },
  { key: "rentals", label: "Rentals", icon: faChartLine },
  { key: "earnings", label: "Earnings", icon: faDollarSign },
  { key: "chat", label: "Chat", icon: faComments },
  { key: "profile", label: "Profile", icon: faUser },
];

/** Collapsed rail width — match AdminSidebar */
export const OWNER_SIDEBAR_COLLAPSED_PX = 72;
/** Expanded width on hover — match AdminSidebar */
export const OWNER_SIDEBAR_EXPANDED_PX = 288;

const navBtnClass = (isActive) =>
  `flex w-full items-center gap-3 rounded-xl py-3 pl-2 pr-3 text-left transition-colors duration-200 ${
    isActive
      ? "bg-[#1A3232] text-[#F0FAFA] shadow-inner"
      : "text-[#B8D4D4] hover:bg-white/5 hover:text-white"
  }`;

const labelClass = (showLabelsAlways) =>
  showLabelsAlways
    ? "min-w-0 flex-1 truncate text-sm font-medium text-inherit"
    : "min-w-0 flex-1 truncate text-sm font-medium text-inherit max-w-0 opacity-0 transition-all duration-300 group-hover:max-w-[220px] group-hover:opacity-100";

const OwnerSidebar = ({
  activeKey = "dashboard",
  onSelect,
  onLogout,
  onExpandChange,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (!mq.matches) onExpandChange?.(false);
    };
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [onExpandChange]);

  const renderSidebarContent = (showLabelsAlways) => (
    <div className="flex h-full flex-col border-r border-teal-900/30 bg-[#081C1C] bg-gradient-to-b from-[#0a2525] to-[#061414]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 lg:justify-end lg:border-b-0 lg:py-3">
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#B8D4D4] transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2 lg:px-2 lg:py-3">
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
              className={navBtnClass(isActive)}
            >
              <span className="flex w-10 shrink-0 justify-center">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="h-5 w-5 shrink-0 opacity-90"
                />
              </span>
              <span className={labelClass(showLabelsAlways)}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {onLogout && (
        <div className="border-t border-white/10 px-2 py-3">
          <button
            type="button"
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl py-3 pl-2 pr-3 text-left text-[#F0A8A8] transition hover:bg-white/5"
          >
            <span className="flex w-10 shrink-0 justify-center">
              <FontAwesomeIcon
                icon={faRightFromBracket}
                className="h-5 w-5 shrink-0"
              />
            </span>
            <span className={labelClass(showLabelsAlways)}>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-24 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#081C1C] text-[#E8F4F4] shadow-lg transition hover:bg-[#1A3232] lg:hidden"
        aria-label="Open menu"
      >
        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className="group fixed left-0 top-20 z-50 hidden h-[calc(100vh-5rem)] w-[72px] flex-col overflow-hidden border-r border-white/10 bg-[#081C1C] shadow-2xl transition-[width] duration-300 ease-out hover:w-72 lg:flex"
        onMouseEnter={() => onExpandChange?.(true)}
        onMouseLeave={() => onExpandChange?.(false)}
      >
        {renderSidebarContent(false)}
      </aside>

      <aside
        className={`fixed left-0 top-20 z-50 h-[calc(100vh-5rem)] w-[min(100vw,288px)] max-w-[288px] border-r border-white/10 bg-[#081C1C] shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent(true)}
      </aside>
    </>
  );
};

export default OwnerSidebar;
export { navItems as ownerNavItems };
