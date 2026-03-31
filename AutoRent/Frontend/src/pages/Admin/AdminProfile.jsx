import {
  faCheckCircle,
  faEnvelope,
  faShield,
  faUser,
  faUsers,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import {
  PageHeader,
} from "../../component/dashboard/DashboardPrimitives.jsx";
import { adminAPI } from "../../utils/api.js";

const AdminProfile = ({ user }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    activeRentals: 0,
  });

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  useEffect(() => {
    adminAPI
      .getStats()
      .then((res) => {
        const data = res?.data ?? {};
        setDashboardStats({
          totalUsers: data.totalUsers ?? 0,
          totalVehicles: data.totalVehicles ?? 0,
          activeRentals: data.activeRentals ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        subtitle="Administrator identity and live platform snapshot."
      />

      <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-md">
        <div className="mb-8 flex flex-wrap items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-2xl font-bold text-white shadow-lg">
            {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {fullName}
            </h2>
            <p className="text-sm text-slate-600">Administrator</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <FontAwesomeIcon icon={faUser} className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full name
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {fullName}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </p>
              <p className="mt-1 break-all text-lg font-semibold text-slate-900">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <FontAwesomeIcon icon={faUserTag} className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                Administrator
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <FontAwesomeIcon icon={faShield} className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Account status
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {user.isEmailVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                    Verified
                  </span>
                ) : (
                  <span className="text-rose-600">Unverified</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 md:col-span-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <FontAwesomeIcon icon={faUsers} className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Platform overview
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Managing{" "}
                <span className="font-semibold text-slate-900">
                  {dashboardStats.totalUsers}
                </span>{" "}
                users ·{" "}
                <span className="font-semibold text-slate-900">
                  {dashboardStats.totalVehicles}
                </span>{" "}
                vehicles ·{" "}
                <span className="font-semibold text-slate-900">
                  {dashboardStats.activeRentals}
                </span>{" "}
                active rentals
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
