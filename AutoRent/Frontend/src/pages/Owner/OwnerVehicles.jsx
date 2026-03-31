import {
  faCheckCircle,
  faEye,
  faPenToSquare,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useState } from "react";
import EditVehicleForm from "../../component/owner/EditVehicleForm.jsx";
import { PageHeader } from "../../component/dashboard/DashboardPrimitives.jsx";
import { vehicleAPI } from "../../utils/api.js";

const OwnerVehicles = ({ onNavigateAddVehicle }) => {
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState(null);
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    try {
      const res = await vehicleAPI.getMyVehicles();
      setVehicles(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchVehicles();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  const openVehicleDetail = (vehicle) => {
    setDetailVehicle(null);
    setDetailLoading(true);
    vehicleAPI
      .getVehicleById(vehicle.id)
      .then((res) => setDetailVehicle(res.data))
      .catch(() => setDetailVehicle(null))
      .finally(() => setDetailLoading(false));
  };

  const closeVehicleDetail = () => {
    setDetailVehicle(null);
  };

  const handleVehicleUpdated = () => {
    setEditingVehicleId(null);
    fetchVehicles();
  };

  const handleDeleteVehicle = async (vehicle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vehicle.brand} ${vehicle.model}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(vehicle.id);
    try {
      await vehicleAPI.deleteVehicle(vehicle.id);
      if (detailVehicle?.id === vehicle.id) closeVehicleDetail();
      setEditingVehicleId((id) => (id === vehicle.id ? null : id));
      fetchVehicles();
    } catch (err) {
      alert(err?.message ?? "Failed to delete vehicle.");
    } finally {
      setDeletingId(null);
    }
  };

  if (editingVehicleId) {
    return (
      <EditVehicleForm
        vehicle={vehicles.find((v) => v.id === editingVehicleId)}
        onSuccess={handleVehicleUpdated}
        onCancel={() => setEditingVehicleId(null)}
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Fleet"
        title="My vehicles"
        subtitle="Manage listings, edit details, and track verification status."
      />
      {vehiclesLoading ? (
        <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm p-8 text-center text-slate-500">
          Loading vehicles...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm p-8 text-center">
          <p className="text-slate-600">You have no vehicles yet.</p>
          <button
            type="button"
            onClick={onNavigateAddVehicle}
            className="mt-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-teal-500 hover:to-emerald-500"
          >
            Add your first vehicle
          </button>
        </div>
      ) : (
        <div className="dash-panel rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-slate-200 bg-amber-50/90">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Brand / Model
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
                  <tr key={v.id} className="hover:bg-[#FFEFE0]">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {v.brand} {v.model}
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
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openVehicleDetail(v)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                          View details
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingVehicleId(v.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="h-4 w-4"
                          />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(v)}
                          disabled={deletingId === v.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          aria-label="Delete vehicle"
                        >
                          <FontAwesomeIcon
                            icon={faTrashCan}
                            className="h-4 w-4"
                          />
                          {deletingId === v.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(detailVehicle !== null || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
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
                        Brand / Model
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.brand} {detailVehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Year</p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.manufactureYear}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Vehicle type
                      </p>
                      <p className="font-semibold text-slate-900">
                        {detailVehicle.vehicleType || "—"}
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

                  {((detailVehicle.images?.length ?? 0) > 0 ||
                    (detailVehicle.documents?.length ?? 0) > 0) && (
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
                                if (fallback)
                                  fallback.classList.remove("hidden");
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
                            {doc.documentUrl
                              ?.toLowerCase?.()
                              .endsWith(".pdf") ? (
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-40 w-full items-center justify-center bg-amber-100 text-amber-800 hover:bg-amber-200"
                              >
                                View PDF document
                              </a>
                            ) : (
                              <>
                                <img
                                  src={doc.documentUrl}
                                  alt="Vehicle document"
                                  className="h-40 w-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = "none";
                                    const fallback =
                                      e.target.nextElementSibling;
                                    if (fallback)
                                      fallback.classList.remove("hidden");
                                  }}
                                />
                                <div className="hidden h-40 w-full bg-amber-100">
                                  <div className="flex h-full w-full items-center justify-center text-amber-700">
                                    Document unavailable
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="px-3 py-2 text-xs font-medium text-amber-700">
                              Vehicle document
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        closeVehicleDetail();
                        setEditingVehicleId(detailVehicle.id);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className="h-4 w-4"
                      />
                      Edit vehicle
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(detailVehicle)}
                      disabled={deletingId === detailVehicle.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <FontAwesomeIcon
                        icon={faTrashCan}
                        className="h-4 w-4"
                      />
                      {deletingId === detailVehicle.id
                        ? "Deleting..."
                        : "Delete vehicle"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-slate-500">Could not load vehicle.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerVehicles;
