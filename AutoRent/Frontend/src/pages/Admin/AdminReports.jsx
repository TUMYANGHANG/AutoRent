import {
  faCar,
  faChartBar,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { PageHeader } from "../../component/dashboard/DashboardPrimitives.jsx";
import { adminAPI } from "../../utils/api.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    setReportLoading(true);
    adminAPI
      .getReportStats()
      .then((res) => setReportData(res?.data ?? null))
      .catch(() => setReportData(null))
      .finally(() => setReportLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      adminAPI
        .getReportStats()
        .then((res) => setReportData(res?.data ?? null))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (reportLoading) {
    return (
      <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 p-16 text-center backdrop-blur-md">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-slate-600">Loading reports…</p>
      </div>
    );
  }
  if (!reportData) {
    return (
      <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 p-16 text-center backdrop-blur-md">
        <p className="text-sm font-medium text-slate-600">
          Unable to load report data.
        </p>
      </div>
    );
  }

  const userDoughnutData = {
    labels: ["Renters", "Owners"],
    datasets: [
      {
        data: [reportData.totalRenters, reportData.totalOwners],
        backgroundColor: ["#0d9488", "#6366f1"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 3,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { padding: 12, usePointStyle: true, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = total ? ((ctx.raw / total) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
          },
        },
      },
    },
  };

  const typeColors = [
    "#0d9488",
    "#6366f1",
    "#f59e0b",
    "#3b82f6",
    "#a855f7",
    "#ec4899",
    "#14b8a6",
    "#eab308",
    "#64748b",
    "#94a3b8",
  ];

  const vehicleTypeBarData = {
    labels: reportData.vehiclesByType.map((v) => v.type),
    datasets: [
      {
        label: "Vehicles",
        data: reportData.vehiclesByType.map((v) => v.count),
        backgroundColor: reportData.vehiclesByType.map(
          (_, i) => typeColors[i % typeColors.length],
        ),
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} vehicles` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: "#64748b" },
        grid: { color: "rgba(148, 163, 184, 0.25)" },
      },
      x: { ticks: { color: "#64748b" }, grid: { display: false } },
    },
  };

  const weeklyLineData = {
    labels: reportData.weeklyRentals.map((w) => w.label),
    datasets: [
      {
        label: "Bookings",
        data: reportData.weeklyRentals.map((w) => w.count),
        borderColor: "#0d9488",
        backgroundColor: "rgba(13, 148, 136, 0.12)",
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "#0d9488",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} bookings` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: "#64748b" },
        grid: { color: "rgba(148, 163, 184, 0.25)" },
      },
      x: { ticks: { color: "#64748b" }, grid: { display: false } },
    },
  };

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        subtitle="Platform-wide metrics and trends. Refreshes every 30 seconds."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="dash-panel flex flex-col items-center rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-center backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg">
            <FontAwesomeIcon icon={faUsers} className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total renters
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {reportData.totalRenters}
          </p>
        </div>
        <div className="dash-panel flex flex-col items-center rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-center backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
            <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total owners
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {reportData.totalOwners}
          </p>
        </div>
        <div className="dash-panel flex flex-col items-center rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-center backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
            <FontAwesomeIcon icon={faCar} className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total vehicles
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {reportData.totalVehicles}
          </p>
        </div>
        <div className="dash-panel flex flex-col items-center rounded-2xl border border-slate-200/70 bg-white/90 p-5 text-center backdrop-blur-sm">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg">
            <FontAwesomeIcon icon={faChartBar} className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bookings (8 wks)
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {reportData.weeklyRentals.reduce((s, w) => s + w.count, 0)}
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Renters vs owners
          </h3>
          <div className="mx-auto" style={{ maxWidth: 200, height: 200 }}>
            <Doughnut data={userDoughnutData} options={doughnutOptions} />
          </div>
        </div>
        <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Vehicles by type
          </h3>
          <div style={{ height: 200 }}>
            <Bar data={vehicleTypeBarData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Weekly vehicle rentals (last 8 weeks)
        </h3>
        <div style={{ height: 220 }}>
          <Line data={weeklyLineData} options={lineOptions} />
        </div>
      </div>
    </>
  );
};

export default AdminReports;
