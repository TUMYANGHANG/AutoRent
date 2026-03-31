import {
  faBell,
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
        <path d="M27 48c0-9 7-16 16-16h2c9 0 16 7 16 16" fill="none" stroke="#FF4D4D" stroke-width="6" stroke-linecap="round"/>
        <path d="M30 48h29" fill="none" stroke="#FF4D4D" stroke-width="6" stroke-linecap="round"/>
        <circle cx="33" cy="52" r="5.5" fill="#FF4D4D"/>
        <circle cx="55" cy="52" r="5.5" fill="#FF4D4D"/>
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

const AdminNavbar = ({
  user,
  profilePicture,
  onLogout,
  pageTitle,
  unreadCount = 0,
  notifications = [],
  notificationsLoading = false,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const displayName =
    user?.firstName || user?.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : "Admin";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative flex h-20 items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                <PlaceholderLogo />
              </div>
              <div className="leading-none">
                <div className="text-xs font-semibold tracking-[0.25em] text-teal-600 transition-colors duration-300">
                  AUTO
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-gray-950">
                  RENT
                </div>
              </div>
            </Link>

            <h1 className="pointer-events-none absolute left-1/2 top-1/2 max-w-[42%] -translate-x-1/2 -translate-y-1/2 truncate text-center text-base font-semibold text-gray-900 sm:max-w-[50%] sm:text-xl">
              {pageTitle || "Dashboard"}
            </h1>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <span className="hidden text-sm font-medium text-gray-600 sm:inline-block">
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
                  className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 transition-all duration-300 hover:bg-gray-200 hover:ring-gray-300"
                  aria-label="Profile"
                  aria-expanded={profileOpen}
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={displayName}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="h-6 w-6 text-gray-600 transition-all duration-300 group-hover:scale-125"
                    />
                  )}
                </button>

                <div
                  className={`absolute right-0 top-full mt-1 w-48 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl transition z-50 ${
                    profileOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-1 opacity-0"
                  }`}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
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
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className="h-4 w-4"
                    />
                    Logout
                  </button>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((v) => !v)}
                  className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 ring-1 ring-gray-200 transition-all duration-300 hover:bg-gray-200 hover:ring-gray-300"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                >
                  <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E85D5D] px-1.5 text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <div
                  className={`absolute right-0 top-full mt-1 w-80 max-w-xs rounded-2xl border border-gray-200 bg-white p-2 shadow-xl transition z-50 ${
                    notificationsOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-1 opacity-0"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between px-1 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Notifications
                    </p>
                    {unreadCount > 0 && onMarkAllNotificationsRead && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] font-medium text-teal-600 hover:text-teal-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto rounded-xl bg-gray-50">
                    {notificationsLoading ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-500">
                        No notifications yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {notifications.map((n) => {
                          const formatDate = (d) => {
                            if (!d) return "—";
                            return new Date(d).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          };
                          return (
                            <li
                              key={n.id}
                              className={`flex gap-3 px-3 py-2.5 ${
                                !n.isRead ? "bg-teal-50/90" : "bg-transparent"
                              }`}
                            >
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 shadow-sm">
                                <FontAwesomeIcon
                                  icon={faBell}
                                  className="h-4 w-4 text-teal-600"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {n.title}
                                </p>
                                {n.message && (
                                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">
                                    {n.message}
                                  </p>
                                )}
                                <p className="mt-1 text-[11px] text-gray-400">
                                  {formatDate(n.createdAt)}
                                </p>
                              </div>
                              {!n.isRead && onMarkNotificationRead && (
                                <button
                                  type="button"
                                  onClick={() => onMarkNotificationRead(n.id)}
                                  className="self-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                                >
                                  Mark
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
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
