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
      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-12 text-center text-[#555555]">
        Loading reports...
      </div>
    );
  }
  if (!reportData) {
    return (
      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-12 text-center text-[#555555]">
        Unable to load report data.
      </div>
    );
  }

  const userDoughnutData = {
    labels: ["Renters", "Owners"],
    datasets: [
      {
        data: [reportData.totalRenters, reportData.totalOwners],
        backgroundColor: ["#FF4D4D", "#4DFFBC"],
        borderColor: ["#FFF7E6", "#FFF7E6"],
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
    "#FF4D4D",
    "#4DFFBC",
    "#FFB84D",
    "#4D9FFF",
    "#B84DFF",
    "#FF4DA6",
    "#4DFFE0",
    "#FFE04D",
    "#898989",
    "#D9D9D9",
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
        borderRadius: 6,
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
        ticks: { precision: 0, color: "#555555" },
        grid: { color: "#E2D4C4" },
      },
      x: { ticks: { color: "#555555" }, grid: { display: false } },
    },
  };

  const weeklyLineData = {
    labels: reportData.weeklyRentals.map((w) => w.label),
    datasets: [
      {
        label: "Bookings",
        data: reportData.weeklyRentals.map((w) => w.count),
        borderColor: "#FF4D4D",
        backgroundColor: "rgba(255,77,77,0.15)",
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "#FF4D4D",
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
        ticks: { precision: 0, color: "#555555" },
        grid: { color: "#E2D4C4" },
      },
      x: { ticks: { color: "#555555" }, grid: { display: false } },
    },
  };

  return (
    <>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 shadow-sm flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF4D4D]/15 mb-2">
            <FontAwesomeIcon
              icon={faUsers}
              className="h-4 w-4 text-[#FF4D4D]"
            />
          </div>
          <p className="text-xs font-medium text-[#555555]">Total Renters</p>
          <p className="mt-0.5 text-2xl font-bold text-black">
            {reportData.totalRenters}
          </p>
        </div>
        <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 shadow-sm flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4DFFBC]/30 mb-2">
            <FontAwesomeIcon
              icon={faUser}
              className="h-4 w-4 text-[#555555]"
            />
          </div>
          <p className="text-xs font-medium text-[#555555]">Total Owners</p>
          <p className="mt-0.5 text-2xl font-bold text-black">
            {reportData.totalOwners}
          </p>
        </div>
        <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 shadow-sm flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFB84D]/20 mb-2">
            <FontAwesomeIcon
              icon={faCar}
              className="h-4 w-4 text-[#898989]"
            />
          </div>
          <p className="text-xs font-medium text-[#555555]">Total Vehicles</p>
          <p className="mt-0.5 text-2xl font-bold text-black">
            {reportData.totalVehicles}
          </p>
        </div>
        <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 shadow-sm flex flex-col items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF4D4D]/10 mb-2">
            <FontAwesomeIcon
              icon={faChartBar}
              className="h-4 w-4 text-[#FF4D4D]"
            />
          </div>
          <p className="text-xs font-medium text-[#555555]">
            Bookings (8 wks)
          </p>
          <p className="mt-0.5 text-2xl font-bold text-black">
            {reportData.weeklyRentals.reduce((s, w) => s + w.count, 0)}
          </p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-black">
            Renters vs Owners
          </h3>
          <div className="mx-auto" style={{ maxWidth: 200, height: 200 }}>
            <Doughnut data={userDoughnutData} options={doughnutOptions} />
          </div>
        </div>
        <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-black">
            Vehicles by Type
          </h3>
          <div style={{ height: 200 }}>
            <Bar data={vehicleTypeBarData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-black">
          Weekly Vehicle Rentals (last 8 weeks)
        </h3>
        <div style={{ height: 220 }}>
          <Line data={weeklyLineData} options={lineOptions} />
        </div>
      </div>
    </>
  );
};

export default AdminReports;
