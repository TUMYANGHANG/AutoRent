import {
  faCar,
  faChartBar,
  faShield,
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
import {
  ChartCard,
  KpiCard,
  PageHeader,
} from "../../component/dashboard/DashboardPrimitives.jsx";
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

const AdminOverview = ({ onNavigateToActivity }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalVehicles: 0,
    totalUsers: 0,
    activeRentals: 0,
    pendingActions: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    setStatsLoading(true);
    adminAPI
      .getStats()
      .then((res) => {
        const data = res?.data ?? {};
        setDashboardStats({
          totalVehicles: data.totalVehicles ?? 0,
          totalUsers: data.totalUsers ?? 0,
          activeRentals: data.activeRentals ?? 0,
          pendingActions: data.pendingActions ?? 0,
        });
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    adminAPI
      .getReportStats()
      .then((res) => setReportData(res?.data ?? null))
      .catch(() => setReportData(null));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      adminAPI
        .getStats()
        .then((res) => {
          const data = res?.data ?? {};
          setDashboardStats((prev) => ({
            ...prev,
            totalVehicles: data.totalVehicles ?? prev.totalVehicles,
            totalUsers: data.totalUsers ?? prev.totalUsers,
            activeRentals: data.activeRentals ?? prev.activeRentals,
            pendingActions: data.pendingActions ?? prev.pendingActions,
          }));
        })
        .catch(() => {});
      adminAPI
        .getReportStats()
        .then((res) => setReportData(res?.data ?? null))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const dash = statsLoading ? "—" : null;

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Overview"
        subtitle="Platform health, users, vehicles, and rental activity at a glance."
      />

      <div className="dash-kpi-grid mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total users"
          value={dash ?? dashboardStats.totalUsers}
          accent="teal"
          icon={<FontAwesomeIcon icon={faUsers} className="h-5 w-5" />}
        />
        <KpiCard
          label="Total vehicles"
          value={dash ?? dashboardStats.totalVehicles}
          accent="sky"
          icon={<FontAwesomeIcon icon={faCar} className="h-5 w-5" />}
        />
        <KpiCard
          label="Active rentals"
          value={dash ?? dashboardStats.activeRentals}
          accent="rose"
          icon={<FontAwesomeIcon icon={faChartBar} className="h-5 w-5" />}
        />
        <KpiCard
          label="Pending actions"
          value={dash ?? dashboardStats.pendingActions}
          accent="violet"
          icon={<FontAwesomeIcon icon={faShield} className="h-5 w-5" />}
        />
      </div>

      {onNavigateToActivity && (
        <div className="dash-panel mb-10 flex flex-col gap-4 rounded-2xl border border-teal-200/50 bg-gradient-to-br from-teal-50/80 via-white/90 to-slate-50/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-600">
              Live feed
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              See new renters, new vehicles with owner names, who booked what, and
              which cars are still available.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToActivity}
            className="shrink-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-emerald-500"
          >
            Open recent activity
          </button>
        </div>
      )}

      {reportData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Users breakdown" subtitle="Renters vs owners">
            <div className="flex flex-wrap items-center gap-6">
              <div style={{ width: 140, height: 140 }}>
                <Doughnut
                  data={{
                    labels: ["Renters", "Owners"],
                    datasets: [
                      {
                        data: [reportData.totalRenters, reportData.totalOwners],
                        backgroundColor: ["#0d9488", "#6366f1"],
                        borderColor: ["#ffffff", "#ffffff"],
                        borderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${ctx.label}: ${ctx.raw}`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="min-w-[140px] space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-teal-600" />
                  <span className="text-slate-600">Renters</span>
                  <span className="ml-auto font-semibold text-slate-900">
                    {reportData.totalRenters}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-indigo-500" />
                  <span className="text-slate-600">Owners</span>
                  <span className="ml-auto font-semibold text-slate-900">
                    {reportData.totalOwners}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-t border-slate-200 pt-2">
                  <span className="text-slate-600">Total</span>
                  <span className="ml-auto font-bold text-slate-900">
                    {reportData.totalRenters + reportData.totalOwners}
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Vehicles by type" subtitle="Fleet composition">
            <div style={{ height: 160 }}>
              <Bar
                data={{
                  labels: reportData.vehiclesByType.map((v) => v.type),
                  datasets: [
                    {
                      label: "Vehicles",
                      data: reportData.vehiclesByType.map((v) => v.count),
                      backgroundColor: [
                        "#0d9488",
                        "#6366f1",
                        "#f59e0b",
                        "#3b82f6",
                        "#a855f7",
                        "#ec4899",
                        "#64748b",
                      ],
                      borderRadius: 6,
                      maxBarThickness: 40,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                        color: "#64748b",
                        font: { size: 11 },
                      },
                      grid: { color: "rgba(148, 163, 184, 0.25)" },
                    },
                    x: {
                      ticks: { color: "#64748b", font: { size: 10 } },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </ChartCard>

          <ChartCard title="Weekly rentals" subtitle="Last 8 weeks">
            <div style={{ height: 160 }}>
              <Line
                data={{
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
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                        color: "#64748b",
                        font: { size: 11 },
                      },
                      grid: { color: "rgba(148, 163, 184, 0.25)" },
                    },
                    x: {
                      ticks: { color: "#64748b", font: { size: 10 } },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </ChartCard>

          <ChartCard title="Activity summary" subtitle="Rentals vs pending">
            <div className="flex flex-wrap items-center gap-6">
              <div style={{ width: 140, height: 140 }}>
                <Doughnut
                  data={{
                    labels: ["Active Rentals", "Pending Actions"],
                    datasets: [
                      {
                        data: [
                          dashboardStats.activeRentals,
                          dashboardStats.pendingActions,
                        ],
                        backgroundColor: ["#10b981", "#f59e0b"],
                        borderColor: ["#ffffff", "#ffffff"],
                        borderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${ctx.label}: ${ctx.raw}`,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="min-w-[140px] space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Active rentals</span>
                  <span className="ml-auto font-semibold text-slate-900">
                    {dashboardStats.activeRentals}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                  <span className="text-slate-600">Pending actions</span>
                  <span className="ml-auto font-semibold text-slate-900">
                    {dashboardStats.pendingActions}
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      )}
    </>
  );
};

export default AdminOverview;
