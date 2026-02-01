import {
  faGauge,
  faRightFromBracket,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const PlaceholderLogo = () => {
  const dataUrl = useMemo(() => {
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
        <rect width="120" height="80" rx="18" fill="#f8fafc"/>
        <path d="M27 48c0-9 7-16 16-16h2c9 0 16 7 16 16" fill="none" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
        <path d="M30 48h29" fill="none" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
        <circle cx="33" cy="52" r="5.5" fill="#dc2626"/>
        <circle cx="55" cy="52" r="5.5" fill="#dc2626"/>
      </svg>`,
    );
    return `data:image/svg+xml,${svg}`;
  }, []);

  return (
    <img
      src={dataUrl}
      alt="AutoRent logo"
      className="h-11 w-11 rounded-2xl"
      loading="eager"
      decoding="async"
    />
  );
};

const AdminNavbar = ({ user, onLogout, pageTitle }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : "Admin";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative flex h-20 items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                <PlaceholderLogo />
              </div>
              <div className="leading-none">
                <div className="text-xs font-semibold tracking-[0.25em] text-red-600 transition-colors duration-300 group-hover:text-red-700">
                  AUTO
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-slate-900">
                  RENT
                </div>
              </div>
            </Link>

            {/* Center: current page title */}
            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-slate-800 sm:text-xl">
              {pageTitle || "Dashboard"}
            </h1>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <span className="hidden text-sm font-medium text-slate-600 sm:inline-block">
                {displayName}
              </span>
              <div
                className="relative"
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition-all duration-300 hover:bg-slate-200 hover:text-slate-900 hover:ring-slate-300"
                  aria-label="Profile"
                  aria-expanded={profileOpen}
                >
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="h-6 w-6 transition-all duration-300 group-hover:scale-125"
                  />
                </button>

                <div
                  className={`absolute right-0 top-full mt-1 w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg transition z-50 ${
                    profileOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-1 opacity-0"
                  }`}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <FontAwesomeIcon icon={faGauge} className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className="h-4 w-4"
                    />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
