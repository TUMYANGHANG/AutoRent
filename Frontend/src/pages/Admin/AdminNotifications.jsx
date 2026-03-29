import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black">
          Recent notifications
        </h2>
        {notifications.some((n) => !n.isRead) && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="cursor-pointer rounded-lg border border-[#898989] bg-[#D9D9D9] px-3 py-1.5 text-sm font-medium text-[#555555] hover:bg-[#898989] hover:text-white"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] shadow-sm overflow-hidden">
        {notificationsLoading ? (
          <div className="p-12 text-center text-[#555555]">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-[#555555]">
            No notifications yet.
          </div>
        ) : (
          <ul className="divide-y divide-[#E2D4C4]">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-4 px-4 py-4 ${!n.isRead ? "bg-[#FF4D4D]/10" : ""}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4DFFBC]">
                  <FontAwesomeIcon
                    icon={faBell}
                    className="h-5 w-5 text-[#898989]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-black">{n.title}</p>
                  {n.message && (
                    <p className="mt-0.5 text-sm text-[#555555]">{n.message}</p>
                  )}
                  <p className="mt-1 text-xs text-[#555555]">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => onMarkRead(n.id)}
                    className="cursor-pointer rounded-lg border border-[#898989] bg-[#D9D9D9] px-2 py-1 text-xs font-medium text-[#555555] hover:bg-[#898989] hover:text-white"
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
