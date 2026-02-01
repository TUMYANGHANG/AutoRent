import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { vehicleAPI } from "../../utils/api.js";

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Coupe", "Van", "Pickup", "Other"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "Other"];
const TRANSMISSIONS = ["Manual", "Automatic", "Semi-Auto"];

const EditVehicleForm = ({ vehicle, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    vehicleType: "",
    manufactureYear: "",
    color: "",
    fuelType: "",
    transmission: "",
    seatingCapacity: "",
    airbags: "",
    pricePerDay: "",
    securityDeposit: "",
    lateFeePerHour: "",
    description: "",
    status: "available",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (vehicle) {
      setForm({
        brand: vehicle.brand ?? "",
        model: vehicle.model ?? "",
        vehicleType: vehicle.vehicleType ?? "",
        manufactureYear: vehicle.manufactureYear ?? "",
        color: vehicle.color ?? "",
        fuelType: vehicle.fuelType ?? "",
        transmission: vehicle.transmission ?? "",
        seatingCapacity: vehicle.seatingCapacity ?? "",
        airbags: vehicle.airbags ?? "",
        pricePerDay: vehicle.pricePerDay ?? "",
        securityDeposit: vehicle.securityDeposit ?? "",
        lateFeePerHour: vehicle.lateFeePerHour ?? "",
        description: vehicle.description ?? "",
        status: vehicle.status ?? "available",
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const manufactureYear = form.manufactureYear ? Number(form.manufactureYear) : null;
    const pricePerDay = form.pricePerDay ? Number(form.pricePerDay) : null;
    const seatingCapacity = form.seatingCapacity === "" ? undefined : Number(form.seatingCapacity);
    const airbags = form.airbags === "" ? undefined : Number(form.airbags);
    const securityDeposit = form.securityDeposit === "" ? undefined : Number(form.securityDeposit);
    const lateFeePerHour = form.lateFeePerHour === "" ? undefined : Number(form.lateFeePerHour);

    if (!form.brand?.trim()) {
      setError("Brand is required.");
      return;
    }
    if (!form.model?.trim()) {
      setError("Model is required.");
      return;
    }
    if (!manufactureYear || manufactureYear < 1900 || manufactureYear > new Date().getFullYear() + 1) {
      setError("Please enter a valid manufacture year.");
      return;
    }
    if (!pricePerDay || pricePerDay <= 0) {
      setError("Price per day must be a positive number.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        brand: form.brand.trim(),
        model: form.model.trim(),
        vehicleType: form.vehicleType?.trim() || undefined,
        manufactureYear,
        color: form.color?.trim() || undefined,
        fuelType: form.fuelType?.trim() || undefined,
        transmission: form.transmission?.trim() || undefined,
        seatingCapacity: seatingCapacity ?? undefined,
        airbags: airbags ?? undefined,
        pricePerDay,
        securityDeposit: securityDeposit ?? undefined,
        lateFeePerHour: lateFeePerHour ?? undefined,
        description: form.description?.trim() || undefined,
        status: form.status,
      };

      const res = await vehicleAPI.updateVehicle(vehicle.id, payload);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.message || "Failed to update vehicle.");
    } finally {
      setLoading(false);
    }
  };

  if (!vehicle) return null;

  const isVerified = vehicle.isVerified === true;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">Edit Vehicle</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
            isVerified ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}
          title={isVerified ? "Verified by admin (read-only)" : "Pending admin verification"}
        >
          <FontAwesomeIcon icon={isVerified ? faCheckCircle : faTimesCircle} className="h-4 w-4" />
          {isVerified ? "Verified" : "Pending verification"}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-brand" className="mb-1.5 block text-sm font-medium text-slate-700">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-brand"
              name="brand"
              type="text"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="edit-model" className="mb-1.5 block text-sm font-medium text-slate-700">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-model"
              name="model"
              type="text"
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. Camry"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              maxLength={100}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-vehicleType" className="mb-1.5 block text-sm font-medium text-slate-700">
              Vehicle type
            </label>
            <select
              id="edit-vehicleType"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Select</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-manufactureYear" className="mb-1.5 block text-sm font-medium text-slate-700">
              Manufacture year <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-manufactureYear"
              name="manufactureYear"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={form.manufactureYear}
              onChange={handleChange}
              placeholder="e.g. 2022"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-color" className="mb-1.5 block text-sm font-medium text-slate-700">
              Color
            </label>
            <input
              id="edit-color"
              name="color"
              type="text"
              value={form.color}
              onChange={handleChange}
              placeholder="e.g. Silver"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              maxLength={50}
            />
          </div>
          <div>
            <label htmlFor="edit-fuelType" className="mb-1.5 block text-sm font-medium text-slate-700">
              Fuel type
            </label>
            <select
              id="edit-fuelType"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Select</option>
              {FUEL_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-transmission" className="mb-1.5 block text-sm font-medium text-slate-700">
              Transmission
            </label>
            <select
              id="edit-transmission"
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="">Select</option>
              {TRANSMISSIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-seatingCapacity" className="mb-1.5 block text-sm font-medium text-slate-700">
                Seating capacity
              </label>
              <input
                id="edit-seatingCapacity"
                name="seatingCapacity"
                type="number"
                min="0"
                value={form.seatingCapacity}
                onChange={handleChange}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="edit-airbags" className="mb-1.5 block text-sm font-medium text-slate-700">
                Airbags
              </label>
              <input
                id="edit-airbags"
                name="airbags"
                type="number"
                min="0"
                value={form.airbags}
                onChange={handleChange}
                placeholder="e.g. 6"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <label htmlFor="edit-pricePerDay" className="mb-1.5 block text-sm font-medium text-slate-700">
              Price per day (NRP) <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-pricePerDay"
              name="pricePerDay"
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerDay}
              onChange={handleChange}
              placeholder="e.g. 45.00"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="edit-securityDeposit" className="mb-1.5 block text-sm font-medium text-slate-700">
              Security deposit (NRP)
            </label>
            <input
              id="edit-securityDeposit"
              name="securityDeposit"
              type="number"
              min="0"
              step="0.01"
              value={form.securityDeposit}
              onChange={handleChange}
              placeholder="e.g. 200"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="edit-lateFeePerHour" className="mb-1.5 block text-sm font-medium text-slate-700">
              Late fee per hour (NRP)
            </label>
            <input
              id="edit-lateFeePerHour"
              name="lateFeePerHour"
              type="number"
              min="0"
              step="0.01"
              value={form.lateFeePerHour}
              onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="edit-status" className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="edit-status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="edit-description" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="edit-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the vehicle..."
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update vehicle"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditVehicleForm;
