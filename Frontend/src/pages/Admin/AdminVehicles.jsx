import {
  faCheckCircle,
  faEye,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
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
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label
          htmlFor="vehicle-owner-filter"
          className="text-sm font-medium text-[#555555]"
        >
          Filter by owner:
        </label>
        <select
          id="vehicle-owner-filter"
          value={vehicleOwnerFilter}
          onChange={(e) => setVehicleOwnerFilter(e.target.value)}
          className="rounded-lg border border-[#898989] bg-[#FFF7E6] px-3 py-2 text-sm text-black shadow-sm focus:border-[#FF4D4D] focus:outline-none focus:ring-1 focus:ring-[#FF4D4D]"
        >
          <option value="">All owners</option>
          {allOwners.map((o) => (
            <option key={o.id} value={o.id}>
              {ownerLabel(o)} {o?.email ? `(${o.email})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] shadow-sm overflow-hidden">
        {vehiclesLoading ? (
          <div className="p-12 text-center text-[#555555]">
            Loading vehicles...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-[#555555]">
            No vehicles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-[#E2D4C4] bg-[#E2D4C4]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#555555]">
                    Brand / Model
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#555555]">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#555555]">
                    Year
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#555555]">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#555555]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#555555]">
                    Verified
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[#555555]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D4C4]">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-[#FFF7E6]">
                    <td className="px-4 py-3 text-sm text-black">
                      {v.brand} {v.model}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#555555]">
                      {ownerLabel(v.owner)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#555555]">
                      {v.manufactureYear}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#555555]">
                      {v.vehicleType || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#D9D9D9] px-2.5 py-0.5 text-xs font-medium text-[#555555]">
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {v.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[#4DFFBC]">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="h-4 w-4"
                          />
                          Yes
                        </span>
                      ) : (
                        <span className="text-[#555555]">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openVehicleDetail(v)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#898989] bg-[#D9D9D9] px-3 py-1.5 text-sm font-medium text-[#555555] hover:bg-[#898989] hover:text-white"
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#898989] bg-[#FFF7E6] px-6 py-4">
              <h2 className="text-xl font-bold text-black">Vehicle details</h2>
              <button
                type="button"
                onClick={closeVehicleDetail}
                className="rounded-lg p-2 text-[#555555] hover:bg-[#898989] hover:text-white"
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
                        Make / Model
                      </p>
                      <p className="font-semibold text-black">
                        {detailVehicle.make} {detailVehicle.model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">Year</p>
                      <p className="font-semibold text-black">
                        {detailVehicle.year}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        License plate
                      </p>
                      <p className="font-semibold text-black">
                        {detailVehicle.licensePlate}
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
                          <span className="text-[#4DFFBC]">Yes</span>
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
                            className="rounded-xl border-2 border-[#E2D4C4] overflow-hidden bg-[#FFF7E6]"
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
                            <div className="hidden h-40 w-full bg-[#D9D9D9]">
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
                            className="rounded-xl border-2 border-[#898989] overflow-hidden bg-[#E2D4C4]/50"
                          >
                            {doc.documentUrl
                              ?.toLowerCase?.()
                              .endsWith(".pdf") ? (
                              <a
                                href={doc.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-40 w-full items-center justify-center bg-[#D9D9D9] text-[#555555] hover:bg-[#898989] hover:text-white"
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
                            <div className="hidden h-40 w-full bg-[#D9D9D9]">
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
                    <div className="mt-6 border-t border-[#E2D4C4] pt-6">
                      <p className="mb-2 text-sm text-[#555555]">
                        After reviewing the vehicle documents above, you can
                        verify this vehicle.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleVerifyVehicle(detailVehicle.id)}
                        disabled={verifyLoading === detailVehicle.id}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#4DFFBC] px-4 py-2.5 text-sm font-semibold text-[#555555] shadow-sm hover:opacity-90 disabled:opacity-60"
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
