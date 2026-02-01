import {
  faCar,
  faChartBar,
  faCheckCircle,
  faEnvelope,
  faEye,
  faShield,
  faUser,
  faUserTag,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../component/admin/AdminNavbar.jsx";
import AdminSidebar from "../../component/admin/AdminSidebar.jsx";
import { adminAPI, removeAuthToken } from "../../utils/api.js";

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicleOwnerFilter, setVehicleOwnerFilter] = useState("");
  const [allOwners, setAllOwners] = useState([]);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(null);

  const adminPageTitles = {
    dashboard: "Dashboard",
    users: "User Management",
    vehicles: "Vehicle Management",
    reports: "Reports",
    settings: "Settings",
    profile: "Profile",
  };
  const pageTitle = adminPageTitles[activeSection] ?? "Dashboard";

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    if (activeSection !== "vehicles") return;
    setVehiclesLoading(true);
    const params = vehicleOwnerFilter ? { ownerId: vehicleOwnerFilter } : {};
    adminAPI
      .getAllVehicles(params)
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setVehicles(data);
        if (!vehicleOwnerFilter) {
          const seen = new Set();
          const owners = data
            .map((v) => v.owner)
            .filter((o) => o?.id && !seen.has(o.id) && seen.add(o.id));
          setAllOwners(owners);
        }
      })
      .catch(() => setVehicles([]))
      .finally(() => setVehiclesLoading(false));
  }, [activeSection, vehicleOwnerFilter]);

  const openVehicleDetail = (vehicle) => {
    setDetailVehicle(null);
    setDetailLoading(true);
    adminAPI
      .getVehicleById(vehicle.id)
      .then((res) => setDetailVehicle(res.data))
      .catch(() => setDetailVehicle(null))
      .finally(() => setDetailLoading(false));
  };

  const closeVehicleDetail = () => {
    setDetailVehicle(null);
  };

  const handleVerifyVehicle = (vehicleId) => {
    setVerifyLoading(vehicleId);
    adminAPI
      .updateVehicleVerify(vehicleId, true)
      .then((res) => {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === vehicleId ? { ...v, isVerified: true } : v,
          ),
        );
        if (detailVehicle?.id === vehicleId) {
          setDetailVehicle((prev) =>
            prev ? { ...prev, isVerified: true } : null,
          );
        }
      })
      .finally(() => setVerifyLoading(null));
  };

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <>
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Users
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="h-6 w-6 text-red-600"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Vehicles
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <FontAwesomeIcon
                    icon={faCar}
                    className="h-6 w-6 text-orange-600"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Rentals
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <FontAwesomeIcon
                    icon={faChartBar}
                    className="h-6 w-6 text-blue-600"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Pending Actions
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <FontAwesomeIcon
                    icon={faShield}
                    className="h-6 w-6 text-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
                {user.firstName?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {fullName}
                </h2>
                <p className="text-slate-500">Administrator Profile</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                <FontAwesomeIcon
                  icon={faUser}
                  className="h-5 w-5 text-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Full Name
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {fullName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="h-5 w-5 text-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 md:col-span-2">
                <FontAwesomeIcon
                  icon={faUserTag}
                  className="h-5 w-5 text-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-slate-500">Role</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeSection === "vehicles") {
      const ownerLabel = (o) =>
        [o?.firstName, o?.lastName].filter(Boolean).join(" ") || o?.email || "—";
      return (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="vehicle-owner-filter" className="text-sm font-medium text-slate-700">
              Filter by owner:
            </label>
            <select
              id="vehicle-owner-filter"
              value={vehicleOwnerFilter}
              onChange={(e) => setVehicleOwnerFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              <option value="">All owners</option>
              {allOwners.map((o) => (
                <option key={o.id} value={o.id}>
                  {ownerLabel(o)} {o?.email ? `(${o.email})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {vehiclesLoading ? (
              <div className="p-12 text-center text-slate-500">
                Loading vehicles...
              </div>
            ) : vehicles.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No vehicles found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Brand / Model
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Year
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                        Verified
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {vehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">
                          {v.brand} {v.model}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {ownerLabel(v.owner)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {v.manufactureYear}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {v.vehicleType || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {v.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="h-4 w-4"
                              />
                              Yes
                            </span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => openVehicleDetail(v)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      );
    }

    if (activeSection === "users") {
      return <p className="text-slate-600">Coming soon.</p>;
    }

    if (activeSection === "reports" || activeSection === "settings") {
      return <p className="text-slate-600">Coming soon.</p>;
    }

    if (activeSection === "profile") {
      return (
        <p className="text-slate-600">
          Manage your admin profile. Coming soon.
        </p>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AdminNavbar user={user} onLogout={handleLogout} pageTitle={pageTitle} />
      <div className="flex flex-1">
        <AdminSidebar activeKey={activeSection} onSelect={setActiveSection} />
        <main className="min-w-0 flex-1 px-4 py-12 pl-14 sm:px-6 lg:pl-8">
          <div className="mx-auto max-w-5xl">{renderContent()}</div>
        </main>
      </div>

      {/* Vehicle detail modal */}
      {(detailVehicle !== null || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="text-xl font-bold text-slate-900">
                Vehicle details
              </h2>
              <button
                type="button"
                onClick={closeVehicleDetail}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <p className="text-slate-500">Loading...</p>
              ) : detailVehicle ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Make / Model
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.make} {detailVehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Year</p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        License plate
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.licensePlate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Status
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Verified
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.isVerified ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-slate-500">No</span>
                        )}
                      </p>
                    </div>
                    {detailVehicle.color && (
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Color
                        </p>
                        <p className="font-semibold text-slate-900">
                          {detailVehicle.color}
                        </p>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-slate-500">
                        Price per day (NRP)
                      </p>
                      <p className="font-semibold text-slate-900">
                        NRP {detailVehicle.pricePerDay}
                      </p>
                    </div>
                    {detailVehicle.description && (
                      <div className="sm:col-span-2">
                        <p className="text-sm font-medium text-slate-500">
                          Description
                        </p>
                        <p className="text-slate-700">
                          {detailVehicle.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {((detailVehicle.images?.length ?? 0) > 0 || (detailVehicle.documents?.length ?? 0) > 0) && (
                    <div className="mt-6">
                      <p className="mb-2 text-sm font-medium text-slate-700">
                        Images & documents
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {detailVehicle.images?.map((img) => (
                          <div
                            key={img.id}
                            className="rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-50"
                          >
                            <img
                              src={img.imageUrl}
                              alt="Vehicle"
                              className="h-40 w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                const fallback = e.target.nextElementSibling;
                                if (fallback) fallback.classList.remove("hidden");
                              }}
                            />
                            <div className="hidden h-40 w-full bg-slate-200">
                              <div className="flex h-full w-full items-center justify-center text-slate-500">
                                Image unavailable
                              </div>
                            </div>
                            <div className="px-3 py-2 text-xs text-slate-600">
                              Vehicle photo
                            </div>
                          </div>
                        ))}
                        {detailVehicle.documents?.map((doc) => (
                          <div
                            key={doc.id}
                            className="rounded-xl border-2 border-amber-400 overflow-hidden bg-amber-50/50"
                          >
                            {doc.documentUrl?.toLowerCase?.().endsWith(".pdf") ? (
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-40 w-full items-center justify-center bg-amber-100 text-amber-800 hover:bg-amber-200"
                              >
                                View PDF document
                              </a>
                            ) : (
                              <img
                                src={doc.documentUrl}
                                alt="Vehicle document"
                                className="h-40 w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = "none";
                                  const fallback = e.target.nextElementSibling;
                                  if (fallback) fallback.classList.remove("hidden");
                                }}
                              />
                            )}
                            <div className="hidden h-40 w-full bg-amber-100">
                              <div className="flex h-full w-full items-center justify-center text-amber-700">
                                Document unavailable
                              </div>
                            </div>
                            <div className="px-3 py-2 text-xs font-medium text-amber-700">
                              Vehicle document
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!detailVehicle.isVerified && (
                    <div className="mt-6 border-t border-slate-200 pt-6">
                      <p className="mb-2 text-sm text-slate-600">
                        After reviewing the vehicle documents above, you can
                        verify this vehicle.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleVerifyVehicle(detailVehicle.id)}
                        disabled={verifyLoading === detailVehicle.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
                      >
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="h-4 w-4"
                        />
                        {verifyLoading === detailVehicle.id
                          ? "Verifying..."
                          : "Verify vehicle"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-slate-500">Could not load vehicle.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
