import {
  faCalendarCheck,
  faCar,
  faClock,
  faEnvelope,
  faHistory,
  faSearch,
  faUser,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const RenterDashboard = ({ user }) => {
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-white">
            Renter Dashboard
          </h1>
          <p className="mt-2 text-white/60">
            Welcome back, {user.firstName || "User"}! Find and book your perfect
            vehicle.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  Active Rentals
                </p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
                <FontAwesomeIcon
                  icon={faCar}
                  className="h-6 w-6 text-orange-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  Upcoming Bookings
                </p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="h-6 w-6 text-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/20 to-green-500/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  Total Rentals
                </p>
                <p className="mt-2 text-3xl font-bold text-white">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <FontAwesomeIcon
                  icon={faHistory}
                  className="h-6 w-6 text-green-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <button className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-orange-500/50 hover:bg-orange-500/10">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500/30">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="h-8 w-8 text-orange-400"
                />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">
                  Browse Vehicles
                </h3>
                <p className="mt-1 text-white/60">
                  Search and find the perfect vehicle for your needs
                </p>
              </div>
            </div>
          </button>

          <button className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:bg-blue-500/10">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500/30">
                <FontAwesomeIcon
                  icon={faClock}
                  className="h-8 w-8 text-blue-400"
                />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-white">My Bookings</h3>
                <p className="mt-1 text-white/60">
                  View and manage your current and past bookings
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* User Info Card */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/20 text-2xl font-bold text-orange-400">
              {user.firstName?.[0]?.toUpperCase() ||
                user.email[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-white/60">Profile Information</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                <FontAwesomeIcon
                  icon={faUser}
                  className="h-5 w-5 text-orange-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">Full Name</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {fullName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="h-5 w-5 text-orange-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">
                  Email Address
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4 md:col-span-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/20">
                <FontAwesomeIcon
                  icon={faUserTag}
                  className="h-5 w-5 text-orange-400"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">Role</p>
                <p className="mt-1 text-lg font-semibold text-white">Renter</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RenterDashboard;
