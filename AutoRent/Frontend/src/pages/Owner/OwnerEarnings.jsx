import {
  faArrowDown,
  faArrowTrendDown,
  faArrowTrendUp,
  faCalendarDays,
  faCircleCheck,
  faClock,
  faCoins,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import {
  ChartCard,
  KpiCard,
  PageHeader,
} from "../../component/dashboard/DashboardPrimitives.jsx";
import { bookingsAPI } from "../../utils/api.js";

const fmtMoney = (n, currency = "NPR") => {
  const v = Number(n ?? 0);
  return `${currency} ${v.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const pctFmt = (p) => {
  const v = Number(p ?? 0);
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
};

const OwnerEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    bookingsAPI
      .getOwnerEarningsReport()
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader
          eyebrow="Finance"
          title="Earnings"
          subtitle="Revenue from paid rentals across your fleet."
        />
        <div className="dash-panel rounded-2xl px-8 py-16 text-center text-slate-500">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
          <p className="mt-4 text-sm">Loading earnings…</p>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader
          eyebrow="Finance"
          title="Earnings"
          subtitle="Revenue from paid rentals across your fleet."
        />
        <div className="dash-panel rounded-2xl px-8 py-16 text-center text-slate-600">
          Could not load earnings. Try again later.
        </div>
      </>
    );
  }

  const mom = data.monthOverMonthChangePct ?? 0;
  const momUp = mom >= 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Finance"
        title="Earnings summary"
        subtitle="Revenue from paid rentals across your fleet."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-all duration-300 hover:border-teal-300/40 hover:shadow-[0_16px_48px_rgba(15,23,42,0.12)]">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 opacity-[0.15] blur-2xl transition-opacity group-hover:opacity-25" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                This month
              </p>
              <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                {fmtMoney(data.thisMonthEarnings, data.currency)}
              </p>
              <p
                className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                  momUp ? "text-emerald-700" : "text-red-700"
                }`}
              >
                <FontAwesomeIcon
                  icon={momUp ? faArrowTrendUp : faArrowTrendDown}
                />
                {pctFmt(mom)} vs last month
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-slate-900/15">
              <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5" />
            </div>
          </div>
        </div>
        <KpiCard
          label="Last month"
          value={fmtMoney(data.lastMonthEarnings, data.currency)}
          accent="sky"
          icon={<FontAwesomeIcon icon={faHourglassHalf} className="h-5 w-5" />}
        />
        <KpiCard
          label="Total earnings"
          value={fmtMoney(data.totalEarnings, data.currency)}
          accent="violet"
          icon={<FontAwesomeIcon icon={faCoins} className="h-5 w-5" />}
        />
        <KpiCard
          label="Pending payments"
          value={fmtMoney(data.pendingPaymentsTotal, data.currency)}
          accent="rose"
          icon={<FontAwesomeIcon icon={faClock} className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Top vehicles"
          subtitle="By paid rental revenue"
        >
          {!data.topVehicles?.length ? (
            <p className="text-sm text-slate-500">
              No paid bookings yet — your top earners will show here.
            </p>
          ) : (
            <ul className="space-y-4">
              {data.topVehicles.map((v) => {
                const pct =
                  data.topVehiclesMaxAmount > 0
                    ? (v.amount / data.topVehiclesMaxAmount) * 100
                    : 0;
                return (
                  <li key={v.vehicleId}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-slate-900">
                        {v.label}
                      </span>
                      <span className="tabular-nums text-slate-600">
                        {fmtMoney(v.amount, data.currency)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ChartCard>

        <ChartCard
          title="Highlights"
          subtitle="Quick snapshot of your payout picture"
        >
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="mt-0.5 text-emerald-600"
              />
              <span className="text-slate-600">
                <span className="font-medium text-slate-900">Paid</span>{" "}
                amounts use the time the payment was completed (card, Khalti, or
                marked paid at pickup).
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
              <FontAwesomeIcon
                icon={faArrowDown}
                className="mt-0.5 text-slate-500"
              />
              <span className="text-slate-600">
                <span className="font-medium text-slate-900">Pending</span> is
                what renters still owe on confirmed bookings (e.g. pay on pickup).
              </span>
            </li>
          </ul>
        </ChartCard>
      </div>
    </div>
  );
};

export default OwnerEarnings;
