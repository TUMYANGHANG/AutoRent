import {
  faArrowRight,
  faBolt,
  faCalendarCheck,
  faCar,
  faCarSide,
  faCircleCheck,
  faClock,
  faFingerprint,
  faShieldHalved,
  faStar,
  faUserPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { PageHeader } from "../../component/dashboard/DashboardPrimitives.jsx";
import { adminAPI } from "../../utils/api.js";

const fmtWhen = (v) => {
  if (v == null) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(v);
  }
};

const fmtDateOnly = (v) => {
  if (v == null) return "—";
  try {
    return new Date(v).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(v);
  }
};

const statusClass = (s) => {
  const x = String(s || "").toLowerCase();
  if (x === "confirmed")
    return "border-sky-200/80 bg-sky-50 text-sky-800 ring-1 ring-sky-200/50";
  if (x === "in_progress")
    return "border-amber-200/80 bg-amber-50 text-amber-950 ring-1 ring-amber-200/50";
  if (x === "completed")
    return "border-emerald-200/80 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/50";
  if (x === "cancelled")
    return "border-red-200/80 bg-red-50 text-red-800 ring-1 ring-red-200/50";
  if (x === "pending")
    return "border-slate-200/80 bg-slate-100 text-slate-800 ring-1 ring-slate-200/50";
  return "border-slate-200/80 bg-slate-50 text-slate-700 ring-1 ring-slate-200/40";
};

/** Glass panel with gradient header orb */
function ActivitySection({
  title,
  subtitle,
  icon,
  gradient,
  delayClass = "",
  children,
}) {
  return (
    <section
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-[0_8px_40px_rgba(15,23,42,0.06)] backdrop-blur-md transition-all duration-300 hover:border-teal-200/50 hover:shadow-[0_16px_48px_rgba(15,23,42,0.09)] dash-animate-in ${delayClass}`}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-[0.12] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.18]`}
      />
      <div
        className={`relative flex items-start gap-3 border-b border-slate-100/90 bg-gradient-to-r from-white/90 to-slate-50/40 px-4 py-3.5 sm:px-5`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-900/15`}
        >
          <FontAwesomeIcon icon={icon} className="h-5 w-5 opacity-95" />
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-snug text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="relative p-4 sm:p-5">{children}</div>
    </section>
  );
}

function EmptyHint({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-slate-50/50 py-10 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FontAwesomeIcon icon={icon} className="h-5 w-5" />
      </div>
      <p className="max-w-[220px] text-sm text-slate-500">{text}</p>
    </div>
  );
}

const AdminRecentActivity = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminAPI
      .getActivityFeed()
      .then((res) => setData(res?.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      adminAPI
        .getActivityFeed()
        .then((res) => setData(res?.data ?? null))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="min-w-0">
        <div className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-600">
            Admin
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Recent activity
          </h2>
        </div>
        <div className="dash-panel flex flex-col items-center justify-center rounded-2xl px-8 py-20">
          <div className="relative">
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon icon={faBolt} className="h-5 w-5 text-teal-600/40" />
            </div>
          </div>
          <p className="mt-5 text-sm font-medium text-slate-600">
            Syncing activity feed…
          </p>
          <p className="mt-1 text-xs text-slate-400">Almost there</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-w-0">
        <PageHeader
          eyebrow="Admin"
          title="Recent activity"
          subtitle="Latest signups, listings, bookings, and fleet availability."
        />
        <div className="dash-panel rounded-2xl px-8 py-16 text-center">
          <p className="text-sm font-medium text-slate-600">
            Could not load activity.
          </p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-emerald-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const nu = data.recentUsers?.length ?? 0;
  const nv = data.recentVehicles?.length ?? 0;
  const nb = data.recentBookings?.length ?? 0;
  const avTotal = data.availableVehicles?.total ?? 0;

  const rowBase =
    "flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-100/90 bg-gradient-to-br from-white to-slate-50/40 px-3.5 py-3 transition duration-200 hover:border-teal-200/70 hover:from-white hover:to-teal-50/30 hover:shadow-md sm:px-4";

  return (
    <div className="min-w-0 pb-8">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 px-5 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-teal-500/25 blur-[80px]" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-indigo-500/20 blur-[70px]" />
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2740%27%20height=%2740%27%3E%3Cpath%20d=%27M0%2040h40M40%200v40%27%20stroke=%27rgba(255,255,255,0.04)%27%20fill=%27none%27/%3E%3C/svg%3E')] opacity-60" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-100/95 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live feed
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem]">
              Recent activity
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300/95">
              New renters & owners, fresh listings with owners, booking flows, and
              what is still on the lot — refreshed every{" "}
              <span className="font-semibold text-white">30 seconds</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 backdrop-blur-sm">
              <FontAwesomeIcon icon={faStar} className="text-amber-300" />
              Platform pulse
            </span>
          </div>
        </div>

        {/* Stat strip */}
        <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            {
              label: "New users (sample)",
              value: nu,
              icon: faUsers,
              grad: "from-teal-400 to-cyan-500",
            },
            {
              label: "New listings",
              value: nv,
              icon: faCarSide,
              grad: "from-amber-400 to-orange-500",
            },
            {
              label: "Booking rows",
              value: nb,
              icon: faCalendarCheck,
              grad: "from-violet-400 to-fuchsia-500",
            },
            {
              label: "Available fleet",
              value: avTotal,
              icon: faShieldHalved,
              grad: "from-emerald-400 to-teal-500",
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-sm sm:px-4"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${s.grad} text-white shadow-lg`}
              >
                <FontAwesomeIcon icon={s.icon} className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {s.label}
                </p>
                <p className="text-xl font-bold tabular-nums tracking-tight text-white">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <ActivitySection
          title="New registrations"
          subtitle="Latest accounts — renters & owners (admins hidden)"
          icon={faUserPlus}
          gradient="from-teal-500 to-emerald-600"
          delayClass="dash-animate-in-delay-1"
        >
          {nu === 0 ? (
            <EmptyHint
              icon={faUsers}
              text="No signups to show yet. They will appear here in real time."
            />
          ) : (
            <ul className="space-y-2">
              {data.recentUsers.map((u, idx) => (
                <li
                  key={u.id}
                  className={rowBase}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-emerald-50 text-teal-700 ring-1 ring-teal-200/50">
                      <FontAwesomeIcon icon={faFingerprint} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="truncate text-xs text-slate-500">{u.email}</p>
                      <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        {u.role}
                      </span>
                    </div>
                  </div>
                  <time className="shrink-0 text-[11px] tabular-nums text-slate-400">
                    {fmtWhen(u.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </ActivitySection>

        <ActivitySection
          title="Fresh listings"
          subtitle="New vehicles on the platform + owner"
          icon={faCar}
          gradient="from-amber-500 to-orange-600"
          delayClass="dash-animate-in-delay-2"
        >
          {nv === 0 ? (
            <EmptyHint
              icon={faCar}
              text="No vehicles listed yet. Owners’ new cars will land here."
            />
          ) : (
            <ul className="space-y-2">
              {data.recentVehicles.map((v) => (
                <li key={v.id} className={rowBase}>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{v.label}</p>
                    <p className="mt-0.5 text-xs text-slate-600">
                      <span className="text-slate-400">Owner · </span>
                      {v.ownerName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        {v.status}
                      </span>
                      {v.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                          <FontAwesomeIcon icon={faCircleCheck} className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="rounded-md border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                          Pending verify
                        </span>
                      )}
                    </div>
                  </div>
                  <time className="shrink-0 text-[11px] text-slate-400">
                    {fmtWhen(v.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </ActivitySection>
      </div>

      <div className="mt-5 lg:mt-6">
        <ActivitySection
          title="Booking flow"
          subtitle="Vehicle ↔ renter — most recently created bookings"
          icon={faCalendarCheck}
          gradient="from-violet-500 to-indigo-600"
          delayClass="dash-animate-in-delay-3"
        >
          {nb === 0 ? (
            <EmptyHint
              icon={faCalendarCheck}
              text="No bookings yet. Approvals will show renter and vehicle here."
            />
          ) : (
            <ul className="space-y-2">
              {data.recentBookings.map((b) => (
                <li
                  key={b.id}
                  className={`${rowBase} border-l-[3px] border-l-violet-400/90`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{b.vehicleLabel}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusClass(b.status)}`}
                      >
                        {String(b.status || "").replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="text-slate-400">Renter · </span>
                      <span className="font-semibold text-slate-900">{b.renterName}</span>
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100/80 px-2 py-0.5 text-slate-600">
                        {fmtDateOnly(b.startDate)}
                        <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5 opacity-50" />
                        {fmtDateOnly(b.returnDate)}
                      </span>
                      <span className="text-slate-400">· logged {fmtWhen(b.createdAt)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ActivitySection>
      </div>

      <div className="mt-5 lg:mt-6">
        <ActivitySection
          title="Available inventory"
          subtitle={`${avTotal} vehicle${avTotal === 1 ? "" : "s"} marked available — sample below`}
          icon={faShieldHalved}
          gradient="from-emerald-500 to-teal-600"
        >
          {avTotal === 0 ? (
            <EmptyHint
              icon={faCar}
              text="Nothing listed as available. Check rented or maintenance statuses in Vehicle Management."
            />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {data.availableVehicles.items.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/50 to-white px-4 py-3 transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                      <FontAwesomeIcon icon={faCar} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{v.label}</p>
                      <p className="truncate text-xs text-slate-600">{v.ownerName}</p>
                    </div>
                  </div>
                  {v.isVerified ? (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                      OK
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">
                      Review
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ActivitySection>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3 text-xs text-slate-500 backdrop-blur-sm">
        <FontAwesomeIcon icon={faUserPlus} className="text-teal-600" />
        <span className="font-medium">Signups</span>
        <FontAwesomeIcon icon={faArrowRight} className="opacity-30" />
        <FontAwesomeIcon icon={faCar} className="text-amber-500" />
        <span className="font-medium">Listings</span>
        <FontAwesomeIcon icon={faArrowRight} className="opacity-30" />
        <FontAwesomeIcon icon={faClock} className="text-violet-500" />
        <span className="font-medium">Bookings</span>
        <FontAwesomeIcon icon={faArrowRight} className="opacity-30" />
        <FontAwesomeIcon icon={faShieldHalved} className="text-emerald-600" />
        <span className="font-medium">Availability</span>
      </div>
    </div>
  );
};

export default AdminRecentActivity;
