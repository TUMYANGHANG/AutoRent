import {
  faCheckCircle,
  faEye,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { PageHeader } from "../../component/dashboard/DashboardPrimitives.jsx";
import { adminAPI } from "../../utils/api.js";

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicleOwnerFilter, setVehicleOwnerFilter] = useState("");
  const [allOwners, setAllOwners] = useState([]);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(null);

  useEffect(() => {
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
  }, [vehicleOwnerFilter]);

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
      .then(() => {
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

  const ownerLabel = (o) =>
    [o?.firstName, o?.lastName].filter(Boolean).join(" ") || o?.email || "—";

  return (
    <>
      <PageHeader
        eyebrow="Fleet"
        title="Vehicle management"
        subtitle="Review listings, verify vehicles, and open full detail when needed."
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label
          htmlFor="vehicle-owner-filter"
          className="text-sm font-medium text-slate-600"
        >
          Filter by owner:
        </label>
        <select
          id="vehicle-owner-filter"
          value={vehicleOwnerFilter}
          onChange={(e) => setVehicleOwnerFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="">All owners</option>
          {allOwners.map((o) => (
            <option key={o.id} value={o.id}>
              {ownerLabel(o)} {o?.email ? `(${o.email})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="dash-panel overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-md">
        {vehiclesLoading ? (
          <div className="p-12 text-center text-slate-600">
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-slate-600">
            No vehicles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-slate-200 bg-slate-100/90">
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
              <tbody className="divide-y divide-slate-100">
                {vehicles.map((v) => (
                  <tr key={v.id} className="transition hover:bg-teal-50/40">
                    <td className="px-4 py-3 text-sm text-black">
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
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="h-4 w-4"
                          />
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openVehicleDetail(v)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:border-teal-300 hover:bg-teal-50"
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

      {(detailVehicle !== null || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="dash-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-md">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4">
              <h2 className="text-xl font-bold text-black">Vehicle details</h2>
              <button
                type="button"
                onClick={closeVehicleDetail}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {detailLoading ? (
                <p className="text-[#555555]">Loading...</p>
              ) : detailVehicle ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        Brand / Model
                      </p>
                      <p className="font-semibold text-black">
                        {detailVehicle.brand} {detailVehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">Year</p>
                      <p className="font-semibold text-black">
                        {detailVehicle.manufactureYear}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        License number
                      </p>
                      <p className="font-semibold text-black">
                        {detailVehicle.licenseNumber ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        Status
                      </p>
                      <p className="font-semibold text-black">
                        {detailVehicle.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        Verified
                      </p>
                      <p className="font-semibold text-black">
                        {detailVehicle.isVerified ? (
                          <span className="text-emerald-600">Yes</span>
                        ) : (
                          <span className="text-[#555555]">No</span>
                        )}
                      </p>
                    </div>
                    {detailVehicle.color && (
                      <div>
                        <p className="text-sm font-medium text-[#555555]">
                          Color
                        </p>
                        <p className="font-semibold text-black">
                          {detailVehicle.color}
                        </p>
                      </div>
                    )}
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-[#555555]">
                        Price per day (NRP)
                      </p>
                      <p className="font-semibold text-black">
                        NRP {detailVehicle.pricePerDay}
                      </p>
                    </div>
                    {detailVehicle.description && (
                      <div className="sm:col-span-2">
                        <p className="text-sm font-medium text-[#555555]">
                          Description
                        </p>
                        <p className="text-[#555555]">
                          {detailVehicle.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {((detailVehicle.images?.length ?? 0) > 0 ||
                    (detailVehicle.documents?.length ?? 0) > 0) && (
                    <div className="mt-6">
                      <p className="mb-2 text-sm font-medium text-[#555555]">
                        Images & documents
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {detailVehicle.images?.map((img) => (
                          <div
                            key={img.id}
                            className="overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50"
                          >
                            <img
                              src={img.imageUrl}
                              alt="Vehicle"
                              className="h-40 w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                const fallback = e.target.nextElementSibling;
                                if (fallback)
                                  fallback.classList.remove("hidden");
                              }}
                            />
                            <div className="hidden h-40 w-full bg-slate-100">
                              <div className="flex h-full w-full items-center justify-center text-[#555555]">
                                Image unavailable
                              </div>
                            </div>
                            <div className="px-3 py-2 text-xs text-[#555555]">
                              Vehicle photo
                            </div>
                          </div>
                        ))}
                        {detailVehicle.documents?.map((doc) => (
                          <div
                            key={doc.id}
                            className="overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-100/80"
                          >
                            {doc.documentUrl
                              ?.toLowerCase?.()
                              .endsWith(".pdf") ? (
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                                  if (fallback)
                                    fallback.classList.remove("hidden");
                                }}
                              />
                            )}
                            <div className="hidden h-40 w-full bg-slate-100">
                              <div className="flex h-full w-full items-center justify-center text-[#555555]">
                                Document unavailable
                              </div>
                            </div>
                            <div className="px-3 py-2 text-xs font-medium text-[#555555]">
                              Vehicle document
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!detailVehicle.isVerified && (
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <p className="mb-2 text-sm text-[#555555]">
                        After reviewing the vehicle documents above, you can
                        verify this vehicle.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleVerifyVehicle(detailVehicle.id)}
                        disabled={verifyLoading === detailVehicle.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-teal-500 hover:to-emerald-500 disabled:opacity-60"
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
                <p className="text-[#555555]">Could not load vehicle.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminVehicles;
