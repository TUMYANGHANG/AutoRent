import {
  faCar,
  faChartLine,
  faDollarSign,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import {
  GlassPanel,
  KpiCard,
} from "../../component/dashboard/DashboardPrimitives.jsx";
import { bookingsAPI } from "../../utils/api.js";

const OwnerOverview = ({
  user,
  userDetails,
  vehicles,
  unreadCount,
  onNavigate,
}) => {
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

  const loadingVal = statsLoading ? "…" : null;

  return (
    <>
      <div className="dash-kpi-grid mb-10 overflow-hidden rounded-3xl border border-teal-200/40 bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 p-8 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-100/90">
              Owner workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back, {user.firstName || "Owner"}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-teal-50/95">
              Track your fleet, rentals, and earnings in one place — built for
              real operations.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100/90">
                Vehicles listed
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                {vehicles.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-100/90">
                Unread alerts
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-white">
                {unreadCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-kpi-grid mb-10 grid gap-5 md:grid-cols-3">
        <KpiCard
          label="Vehicles listed"
          value={loadingVal ?? vehicles.length}
          accent="teal"
          icon={<FontAwesomeIcon icon={faCar} className="h-5 w-5" />}
        />
        <KpiCard
          label="Active rentals"
          value={loadingVal ?? ownerStats.activeRentals}
          accent="sky"
          icon={<FontAwesomeIcon icon={faChartLine} className="h-5 w-5" />}
        />
        <KpiCard
          label="Total earnings"
          value={
            loadingVal ??
            `NPR ${(ownerStats.totalEarnings ?? 0).toLocaleString()}`
          }
          accent="rose"
          icon={<FontAwesomeIcon icon={faDollarSign} className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
        <div className="space-y-5 lg:col-span-2">
          <GlassPanel className="dash-panel--lift flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Add a new vehicle
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                List another vehicle to reach more renters.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("add-vehicle")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:from-teal-500 hover:to-emerald-500"
            >
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              Add vehicle
            </button>
          </GlassPanel>

          <GlassPanel className="dash-panel--lift flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Manage your fleet
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Availability, verification, and status for every listing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("vehicles")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/50"
            >
              <FontAwesomeIcon icon={faCar} className="h-4 w-4" />
              View vehicles
            </button>
          </GlassPanel>
        </div>

        <GlassPanel className="flex h-full flex-col">
          <div className="mb-5 flex items-center gap-3">
            {userDetails?.profilePicture ? (
              <img
                src={userDetails.profilePicture}
                alt={fullName}
                className="h-14 w-14 rounded-2xl border-2 border-teal-200 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-lg font-bold text-white shadow-md">
                {user.firstName?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Account
              </p>
              <p className="truncate text-sm font-semibold text-slate-900">
                {fullName}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Role</span>
              <span className="font-medium text-slate-900">Vehicle owner</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Vehicles listed</span>
              <span className="font-medium text-slate-900">
                {vehicles.length}
              </span>
            </div>
            <p className="pt-3 text-xs leading-relaxed text-slate-500">
              Use the sidebar for rentals, earnings, chat, and profile.
            </p>
          </div>
        </GlassPanel>
      </div>
    </>
  );
};

export default OwnerOverview;
