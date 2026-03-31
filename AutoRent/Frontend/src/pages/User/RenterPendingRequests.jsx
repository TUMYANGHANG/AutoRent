import {
  faClock,
  faMapMarkerAlt,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const RenterPendingRequests = ({
  user,
  requests,
  requestsLoading,
  onShowDetails,
  onCancelRequest,
  onNavigate,
}) => {
  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div id="my-pending-requests" className="mb-8 scroll-mt-8">
      <h2 className="mb-4 text-2xl font-bold text-white">
        My Pending Requests
      </h2>
      {!user.isProfileVerified ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
          <FontAwesomeIcon
            icon={faClock}
            className="mx-auto h-12 w-12 text-amber-400/70"
          />
          <p className="mt-4 text-amber-200/90">
            Complete and verify your profile to view pending requests.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="mt-4 inline-block rounded-xl bg-amber-500 px-6 py-2 font-semibold text-black transition hover:bg-amber-400"
          >
            Go to Profile
          </button>
        </div>
      ) : requestsLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center text-white/60">
          Loading...
        </div>
      ) : pendingRequests.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <FontAwesomeIcon
            icon={faClock}
            className="mx-auto h-12 w-12 text-white/30"
          />
          <p className="mt-4 text-white/70">No pending requests</p>
          <Link
            to="/vehicles"
            className="mt-4 inline-block rounded-xl bg-orange-500 px-6 py-2 font-semibold text-black transition hover:bg-orange-400"
          >
            Browse vehicles
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6"
            >
              <button
                type="button"
                onClick={(e) => onShowDetails(r, e)}
                className="min-w-0 flex-1 cursor-pointer text-left"
              >
                <p className="font-semibold text-white">
                  {r.vehicle?.brand} {r.vehicle?.model}
                </p>
                <p className="mt-1 text-sm text-white/60">
                  {r.startDate} – {r.returnDate}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-white/70">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="h-4 w-4 text-orange-400"
                  />
                  {r.pickupPlace}
                </p>
              </button>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400">
                  Pending owner approval
                </span>
                <button
                  type="button"
                  onClick={() => onCancelRequest(r.id)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                  Cancel request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RenterPendingRequests;
