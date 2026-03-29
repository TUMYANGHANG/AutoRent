import {
  faCar,
  faChartLine,
  faDollarSign,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { bookingsAPI } from "../../utils/api.js";

const OwnerOverview = ({ user, userDetails, vehicles, unreadCount, onNavigate }) => {
  const [ownerStats, setOwnerStats] = useState({
    activeRentals: 0,
    totalEarnings: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  useEffect(() => {
    setStatsLoading(true);
    bookingsAPI
      .getOwnerStats()
      .then((data) =>
        setOwnerStats({
          activeRentals: data?.activeRentals ?? 0,
          totalEarnings: data?.totalEarnings ?? 0,
        }),
      )
      .catch(() => setOwnerStats({ activeRentals: 0, totalEarnings: 0 }))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      bookingsAPI
        .getOwnerStats()
        .then((data) =>
          setOwnerStats({
            activeRentals: data?.activeRentals ?? 0,
            totalEarnings: data?.totalEarnings ?? 0,
          }),
        )
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="mb-8 rounded-xl border border-[#898989] bg-gradient-to-r from-[#898989] via-[#898989] to-[#898989] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D9D9D9]">
              Owner overview
            </p>
            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              Welcome back, {user.firstName || "Owner"}
            </h1>
            <p className="mt-1 text-sm text-[#D9D9D9]">
              Monitor your fleet, rentals and earnings from a single, classic
              dashboard.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-wide text-[#D9D9D9]">
                Vehicles listed
              </p>
              <p className="mt-1 text-xl font-semibold">{vehicles.length}</p>
            </div>
            <div className="hidden rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-right sm:block">
              <p className="text-[11px] uppercase tracking-wide text-[#D9D9D9]">
                Unread alerts
              </p>
              <p className="mt-1 text-xl font-semibold">{unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-[#555555]">
                Vehicles listed
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {vehicles.length}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4D4D] text-white">
              <FontAwesomeIcon icon={faCar} className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-[#555555]">
                Active rentals
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {statsLoading ? "..." : ownerStats.activeRentals}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4DFFBC] text-[#555555]">
              <FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-[#555555]">
                Total earnings
              </p>
              <p className="mt-2 text-2xl font-semibold text-black">
                {statsLoading
                  ? "..."
                  : `NRP ${(ownerStats.totalEarnings ?? 0).toLocaleString()}`}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4D4D] text-white">
              <FontAwesomeIcon icon={faDollarSign} className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-black">
                  Add a new vehicle
                </h2>
                <p className="mt-1 text-sm text-[#555555]">
                  List another car or bike to grow your earning potential.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("add-vehicle")}
                className="inline-flex items-center gap-2 rounded-lg bg-[#FF4D4D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e63f3f]"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                Add vehicle
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-black">
                  Manage your fleet
                </h2>
                <p className="mt-1 text-sm text-[#555555]">
                  View availability, verification and status for all of your
                  vehicles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("vehicles")}
                className="inline-flex items-center gap-2 rounded-lg border border-[#898989] bg-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#555555] transition hover:bg-[#898989] hover:text-white"
              >
                <FontAwesomeIcon icon={faCar} className="h-4 w-4" />
                View vehicles
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col rounded-xl border border-[#898989] bg-[#D9D9D9] px-6 py-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            {userDetails?.profilePicture ? (
              <img
                src={userDetails.profilePicture}
                alt={fullName}
                className="h-12 w-12 rounded-full object-cover border-2 border-[#4DFFBC]"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4DFFBC] text-lg font-bold text-[#555555]">
                {user.firstName?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#555555]">
                Account owner
              </p>
              <p className="text-sm font-semibold text-black">{fullName}</p>
              <p className="text-xs text-[#555555]">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#555555]">Role</span>
              <span className="font-medium text-black">Vehicle Owner</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#555555]">Vehicles listed</span>
              <span className="font-medium text-black">{vehicles.length}</span>
            </div>
            <div className="mt-4 border-top border-[#898989] pt-3 text-xs text-[#555555]">
              Use the sidebar to switch between rentals, earnings and profile
              details.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerOverview;
