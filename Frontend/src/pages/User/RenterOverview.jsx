import {
  faCalendarCheck,
  faCar,
  faClock,
  faHistory,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const RenterOverview = ({ user, bookings, requests, onNavigate }) => {
  return (
    <>
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/vehicles"
          className="group flex cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/30 hover:bg-amber-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 transition group-hover:bg-amber-500/30">
              <FontAwesomeIcon
                icon={faSearch}
                className="h-8 w-8 text-amber-400"
              />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">Browse Vehicles</h3>
              <p className="mt-1 text-white/70">
                Search and find the perfect vehicle for your needs
              </p>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => onNavigate("bookings")}
          className="group w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-sky-500/30 hover:bg-sky-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/20 transition group-hover:bg-sky-500/30">
              <FontAwesomeIcon
                icon={faCalendarCheck}
                className="h-8 w-8 text-sky-400"
              />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">My Bookings</h3>
              <p className="mt-1 text-white/70">
                View and manage your current and past bookings
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("pending-requests")}
          className="group w-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-left transition-all duration-300 hover:scale-[1.02] hover:border-amber-500/30 hover:bg-amber-500/10"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 transition group-hover:bg-amber-500/30">
              <FontAwesomeIcon
                icon={faClock}
                className="h-8 w-8 text-amber-400"
              />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-white">
                My Pending Requests
              </h3>
              <p className="mt-1 text-white/70">
                View and manage your pending booking requests
              </p>
            </div>
          </div>
        </button>
      </div>
    </>
  );
};

export default RenterOverview;
