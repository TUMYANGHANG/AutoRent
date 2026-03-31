import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PageHeader } from "../../component/dashboard/DashboardPrimitives.jsx";

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminNotifications = ({
  notifications,
  notificationsLoading,
  onMarkAllRead,
  onMarkRead,
}) => {
  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="Notifications"
        subtitle="System and booking alerts for your admin account."
      >
        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/80"
          >
            Mark all as read
          </button>
        )}
      </PageHeader>

      <div className="dash-panel overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-md">
        {notificationsLoading ? (
          <div className="p-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading notifications…
            </p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-sm font-medium text-slate-600">
            No notifications yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition ${
                  !n.isRead ? "bg-teal-50/50" : "bg-transparent"
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                  <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  {n.message && (
                    <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default AdminNotifications;
