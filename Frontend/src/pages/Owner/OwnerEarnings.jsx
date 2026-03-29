import {
  faArrowDown,
  faArrowTrendDown,
  faArrowTrendUp,
  faArrowUp,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
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
      <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-8 py-16 text-center text-[#555555]">
        Loading earnings…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-8 py-16 text-center text-[#555555]">
        Could not load earnings. Try again later.
      </div>
    );
  }

  const mom = data.monthOverMonthChangePct ?? 0;
  const momUp = mom >= 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Earnings summary</h1>
        <p className="mt-1 text-sm text-[#555555]">
          Revenue from paid rentals across your fleet
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#555555]">
            This month
          </p>
          <p className="mt-2 text-2xl font-semibold text-black">
            {fmtMoney(data.thisMonthEarnings, data.currency)}
          </p>
          <p
            className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              momUp ? "text-emerald-700" : "text-red-700"
            }`}
          >
            <FontAwesomeIcon icon={momUp ? faArrowTrendUp : faArrowTrendDown} />
            {pctFmt(mom)} vs last month
          </p>
        </div>
        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#555555]">
            Last month
          </p>
          <p className="mt-2 text-2xl font-semibold text-black">
            {fmtMoney(data.lastMonthEarnings, data.currency)}
          </p>
          <p className="mt-2 text-xs text-[#555555]">Completed paid bookings</p>
        </div>
        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#555555]">
            Total earnings
          </p>
          <p className="mt-2 text-2xl font-semibold text-black">
            {fmtMoney(data.totalEarnings, data.currency)}
          </p>
          <p className="mt-2 text-xs text-[#555555]">All-time paid revenue</p>
        </div>
        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-[#555555]">
            Pending payments
          </p>
          <p className="mt-2 text-2xl font-semibold text-black">
            {fmtMoney(data.pendingPaymentsTotal, data.currency)}
          </p>
          <p className="mt-2 text-xs text-[#555555]">
            Pay on pickup &amp; unpaid
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-black">
                Top vehicles
              </h2>
              <p className="text-sm text-[#555555]">By paid rental revenue</p>
            </div>
            {data.topVehicles?.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#4DFFBC]/40 px-2 py-0.5 text-xs font-medium text-[#555555]">
                <FontAwesomeIcon icon={faArrowUp} className="text-emerald-700" />
                Fleet mix
              </span>
            )}
          </div>
          {!data.topVehicles?.length ? (
            <p className="text-sm text-[#555555]">
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
                      <span className="font-medium text-black">{v.label}</span>
                      <span className="text-[#555555]">
                        {fmtMoney(v.amount, data.currency)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#898989]/30">
                      <div
                        className="h-full rounded-full bg-[#FF4D4D]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#898989] bg-[#D9D9D9] p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-black">Highlights</h2>
            <p className="text-sm text-[#555555]">
              Quick snapshot of your payout picture
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 rounded-lg border border-[#898989]/60 bg-black/5 px-3 py-2">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="mt-0.5 text-emerald-700"
              />
              <span className="text-[#555555]">
                <span className="font-medium text-black">Paid</span> amounts use
                the time the payment was completed (card, Khalti, or marked paid
                at pickup).
              </span>
            </li>
            <li className="flex items-start gap-3 rounded-lg border border-[#898989]/60 bg-black/5 px-3 py-2">
              <FontAwesomeIcon
                icon={faArrowDown}
                className="mt-0.5 text-[#555555]"
              />
              <span className="text-[#555555]">
                <span className="font-medium text-black">Pending</span> is what
                renters still owe on confirmed bookings (e.g. pay on pickup).
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OwnerEarnings;
