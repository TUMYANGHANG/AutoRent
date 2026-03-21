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
      <div className="w-full border-b border-[#898989] bg-[#D9D9D9] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative flex h-20 items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#D9D9D9]"
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                <PlaceholderLogo />
              </div>
              <div className="leading-none">
                <div className="text-xs font-semibold tracking-[0.25em] text-[#FF4D4D] transition-colors duration-300 group-hover:text-[#FF4D4D]">
                  AUTO
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-[#898989] transition-colors duration-300 group-hover:text-black">
                  RENT
                </div>
              </div>
            </Link>

            <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-[#898989] sm:text-xl">
              {pageTitle || "Dashboard"}
            </h1>

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <span className="hidden text-sm font-medium text-[#555555] sm:inline-block">
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
                  className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#D9D9D9] text-[#555555] ring-1 ring-[#898989] transition-all duration-300 hover:bg-[#898989] hover:text-white hover:ring-[#898989]"
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
                      className="h-6 w-6 transition-all duration-300 group-hover:scale-125"
                    />
                  )}
                </button>

                <div
                  className={`absolute right-0 top-full mt-1 w-48 rounded-2xl border border-[#898989] bg-[#D9D9D9] p-2 shadow-lg transition z-50 ${
                    profileOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-1 opacity-0"
                  }`}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#555555] transition hover:bg-[#898989] hover:text-white"
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
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#555555] transition hover:bg-[#898989] hover:text-white"
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
                  className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#D9D9D9] text-[#555555] ring-1 ring-[#898989] transition-all duration-300 hover:bg-[#898989] hover:text-white hover:ring-[#898989]"
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                >
                  <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF4D4D] px-1.5 text-[10px] font-semibold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <div
                  className={`absolute right-0 top-full mt-1 w-80 max-w-xs rounded-2xl border border-[#898989] bg-[#D9D9D9] p-2 shadow-xl transition z-50 ${
                    notificationsOpen
                      ? "visible translate-y-0 opacity-100"
                      : "invisible translate-y-1 opacity-0"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between px-1 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#555555]">
                      Notifications
                    </p>
                    {unreadCount > 0 && onMarkAllNotificationsRead && (
                      <button
                        type="button"
                        onClick={onMarkAllNotificationsRead}
                        className="text-[11px] font-medium text-[#FF4D4D] hover:text-[#e63f3f]"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto rounded-xl bg-[#D9D9D9]">
                    {notificationsLoading ? (
                      <div className="px-4 py-6 text-center text-xs text-[#555555]">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-[#555555]">
                        No notifications yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-[#898989]">
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
                                !n.isRead ? "bg-[#FF4D4D]/10" : "bg-transparent"
                              }`}
                            >
                              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4DFFBC]">
                                <FontAwesomeIcon
                                  icon={faBell}
                                  className="h-4 w-4 text-[#898989]"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-black">
                                  {n.title}
                                </p>
                                {n.message && (
                                  <p className="mt-0.5 line-clamp-2 text-xs text-[#555555]">
                                    {n.message}
                                  </p>
                                )}
                                <p className="mt-1 text-[11px] text-[#555555]">
                                  {formatDate(n.createdAt)}
                                </p>
                              </div>
                              {!n.isRead && onMarkNotificationRead && (
                                <button
                                  type="button"
                                  onClick={() => onMarkNotificationRead(n.id)}
                                  className="self-center rounded-lg border border-[#898989] bg-[#D9D9D9] px-2 py-1 text-[11px] font-medium text-[#555555] hover:bg-[#898989] hover:text-white"
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
