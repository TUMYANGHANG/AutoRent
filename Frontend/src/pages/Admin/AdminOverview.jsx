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

const AdminOverview = () => {
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

  return (
    <>
      <div className="mb-8 grid gap-6 md:grid-cols-4 lg:items-stretch">
        <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between flex-1">
            <div>
              <p className="text-sm font-medium text-[#555555]">Total Users</p>
              <p className="mt-2 text-3xl font-bold text-black">
                {statsLoading ? "—" : dashboardStats.totalUsers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4D4D]/15">
              <FontAwesomeIcon
                icon={faUsers}
                className="h-6 w-6 text-[#FF4D4D]"
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between flex-1">
            <div>
              <p className="text-sm font-medium text-[#555555]">
                Total Vehicles
              </p>
              <p className="mt-2 text-3xl font-bold text-black">
                {statsLoading ? "—" : dashboardStats.totalVehicles}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4DFFBC]/30">
              <FontAwesomeIcon
                icon={faCar}
                className="h-6 w-6 text-[#898989]"
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between flex-1">
            <div>
              <p className="text-sm font-medium text-[#555555]">
                Active Rentals
              </p>
              <p className="mt-2 text-3xl font-bold text-black">
                {statsLoading ? "—" : dashboardStats.activeRentals}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4DFFBC]/30">
              <FontAwesomeIcon
                icon={faChartBar}
                className="h-6 w-6 text-[#898989]"
              />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between flex-1">
            <div>
              <p className="text-sm font-medium text-[#555555]">
                Pending Actions
              </p>
              <p className="mt-2 text-3xl font-bold text-black">
                {statsLoading ? "—" : dashboardStats.pendingActions}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF4D4D]/15">
              <FontAwesomeIcon
                icon={faShield}
                className="h-6 w-6 text-[#FF4D4D]"
              />
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-black">
              Users Breakdown
            </h3>
            <div className="flex items-center gap-6">
              <div style={{ width: 140, height: 140 }}>
                <Doughnut
                  data={{
                    labels: ["Renters", "Owners"],
                    datasets: [
                      {
                        data: [
                          reportData.totalRenters,
                          reportData.totalOwners,
                        ],
                        backgroundColor: ["#FF4D4D", "#4DFFBC"],
                        borderColor: ["#FFF7E6", "#FFF7E6"],
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
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-[#FF4D4D]" />
                  <span className="text-[#555555]">Renters</span>
                  <span className="ml-auto font-semibold text-black">
                    {reportData.totalRenters}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-[#4DFFBC]" />
                  <span className="text-[#555555]">Owners</span>
                  <span className="ml-auto font-semibold text-black">
                    {reportData.totalOwners}
                  </span>
                </div>
                <div className="border-t border-[#E2D4C4] pt-2 flex items-center gap-2">
                  <span className="text-[#555555]">Total</span>
                  <span className="ml-auto font-bold text-black">
                    {reportData.totalRenters + reportData.totalOwners}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-black">
              Vehicles by Type
            </h3>
            <div style={{ height: 140 }}>
              <Bar
                data={{
                  labels: reportData.vehiclesByType.map((v) => v.type),
                  datasets: [
                    {
                      label: "Vehicles",
                      data: reportData.vehiclesByType.map((v) => v.count),
                      backgroundColor: [
                        "#FF4D4D",
                        "#4DFFBC",
                        "#FFB84D",
                        "#4D9FFF",
                        "#B84DFF",
                        "#FF4DA6",
                        "#898989",
                      ],
                      borderRadius: 4,
                      maxBarThickness: 36,
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
                      ticks: { precision: 0, color: "#555", font: { size: 10 } },
                      grid: { color: "#E2D4C4" },
                    },
                    x: {
                      ticks: { color: "#555", font: { size: 10 } },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-black">
              Weekly Rentals (8 weeks)
            </h3>
            <div style={{ height: 140 }}>
              <Line
                data={{
                  labels: reportData.weeklyRentals.map((w) => w.label),
                  datasets: [
                    {
                      label: "Bookings",
                      data: reportData.weeklyRentals.map((w) => w.count),
                      borderColor: "#FF4D4D",
                      backgroundColor: "rgba(255,77,77,0.12)",
                      tension: 0.35,
                      fill: true,
                      pointBackgroundColor: "#FF4D4D",
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
                      ticks: { precision: 0, color: "#555", font: { size: 10 } },
                      grid: { color: "#E2D4C4" },
                    },
                    x: {
                      ticks: { color: "#555", font: { size: 10 } },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-black">
              Activity Summary
            </h3>
            <div className="flex items-center gap-6">
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
                        backgroundColor: ["#4DFFBC", "#FFB84D"],
                        borderColor: ["#FFF7E6", "#FFF7E6"],
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
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-[#4DFFBC]" />
                  <span className="text-[#555555]">Active Rentals</span>
                  <span className="ml-auto font-semibold text-black">
                    {dashboardStats.activeRentals}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-[#FFB84D]" />
                  <span className="text-[#555555]">Pending Actions</span>
                  <span className="ml-auto font-semibold text-black">
                    {dashboardStats.pendingActions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminOverview;
