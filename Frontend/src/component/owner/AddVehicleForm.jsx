import { faFileAlt, faImage, faLocationDot, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { vehicleAPI } from "../../utils/api.js";
import PickupLocationMap from "./PickupLocationMap.jsx";

const INITIAL_FORM = {
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
  pickupAddress: "",
  pickupLatitude: "",
  pickupLongitude: "",
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5;

const ACCEPTED_DOC_TYPES = "application/pdf,image/jpeg,image/png,image/webp";
const MAX_DOCUMENTS = 10;
const MAX_DOC_SIZE_MB = 10;

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Coupe", "Van", "Pickup", "Other"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "Other"];
const TRANSMISSIONS = ["Manual", "Automatic", "Semi-Auto"];

const AddVehicleForm = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    setImageFiles((prev) => [...prev, ...valid].slice(0, MAX_IMAGES));
    setError("");
    e.target.value = "";
  };

  const removeImageFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= MAX_DOC_SIZE_MB * 1024 * 1024);
    setDocumentFiles((prev) => [...prev, ...valid].slice(0, MAX_DOCUMENTS));
    setError("");
    e.target.value = "";
  };

  const removeDocumentFile = (index) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
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
    if (documentFiles.length === 0) {
      setError("At least one vehicle document image is required for admin verification.");
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const uploadRes = await vehicleAPI.uploadImages(imageFiles);
        imageUrls = uploadRes.data?.urls ?? [];
      }
      const docRes = await vehicleAPI.uploadDocuments(documentFiles);
      const documentUrls = docRes.data?.urls ?? [];

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
        pickupAddress: form.pickupAddress?.trim() || undefined,
        pickupLatitude: form.pickupLatitude?.trim() || undefined,
        pickupLongitude: form.pickupLongitude?.trim() || undefined,
        imageUrls,
        documentUrls,
      };

      const res = await vehicleAPI.addVehicle(payload);
      setSuccess(true);
      setForm(INITIAL_FORM);
      setImageFiles([]);
      setDocumentFiles([]);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setError(err.message || "Failed to add vehicle.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-green-800">
          Vehicle added successfully!
        </p>
        <p className="mt-2 text-green-700">
          You can add another vehicle or go back to your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Add another vehicle
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Add New Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="brand" className="mb-1.5 block text-sm font-medium text-slate-700">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              id="brand"
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
            <label htmlFor="model" className="mb-1.5 block text-sm font-medium text-slate-700">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              id="model"
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
            <label htmlFor="vehicleType" className="mb-1.5 block text-sm font-medium text-slate-700">
              Vehicle type
            </label>
            <select
              id="vehicleType"
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
            <label htmlFor="manufactureYear" className="mb-1.5 block text-sm font-medium text-slate-700">
              Manufacture year <span className="text-red-500">*</span>
            </label>
            <input
              id="manufactureYear"
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
            <label htmlFor="color" className="mb-1.5 block text-sm font-medium text-slate-700">
              Color
            </label>
            <input
              id="color"
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
            <label htmlFor="fuelType" className="mb-1.5 block text-sm font-medium text-slate-700">
              Fuel type
            </label>
            <select
              id="fuelType"
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
            <label htmlFor="transmission" className="mb-1.5 block text-sm font-medium text-slate-700">
              Transmission
            </label>
            <select
              id="transmission"
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
              <label htmlFor="seatingCapacity" className="mb-1.5 block text-sm font-medium text-slate-700">
                Seating capacity
              </label>
              <input
                id="seatingCapacity"
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
              <label htmlFor="airbags" className="mb-1.5 block text-sm font-medium text-slate-700">
                Airbags
              </label>
              <input
                id="airbags"
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
            <label htmlFor="pricePerDay" className="mb-1.5 block text-sm font-medium text-slate-700">
              Price per day (NRP) <span className="text-red-500">*</span>
            </label>
            <input
              id="pricePerDay"
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
            <label htmlFor="securityDeposit" className="mb-1.5 block text-sm font-medium text-slate-700">
              Security deposit (NRP)
            </label>
            <input
              id="securityDeposit"
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
            <label htmlFor="lateFeePerHour" className="mb-1.5 block text-sm font-medium text-slate-700">
              Late fee per hour (NRP)
            </label>
            <input
              id="lateFeePerHour"
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
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the vehicle..."
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">
              <FontAwesomeIcon
                icon={faLocationDot}
                className="mr-2 h-4 w-4 text-orange-500"
              />
              Pickup location (optional – helps renters find nearby vehicles)
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <PickupLocationMap
              value={
                form.pickupLatitude && form.pickupLongitude
                  ? {
                      latitude: Number(form.pickupLatitude),
                      longitude: Number(form.pickupLongitude),
                    }
                  : null
              }
              onChange={({ latitude, longitude }) => {
                setForm((prev) => ({
                  ...prev,
                  pickupLatitude: String(latitude),
                  pickupLongitude: String(longitude),
                }));
              }}
            />
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="pickupAddress"
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Address or place name
                </label>
                <input
                  id="pickupAddress"
                  name="pickupAddress"
                  type="text"
                  value={form.pickupAddress}
                  onChange={handleChange}
                  placeholder="e.g. Thamel, Kathmandu"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="pickupLatitude"
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    Latitude
                  </label>
                  <input
                    id="pickupLatitude"
                    name="pickupLatitude"
                    type="text"
                    value={form.pickupLatitude}
                    onChange={handleChange}
                    placeholder="Click map"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="pickupLongitude"
                    className="mb-1 block text-xs font-medium text-slate-600"
                  >
                    Longitude
                  </label>
                  <input
                    id="pickupLongitude"
                    name="pickupLongitude"
                    type="text"
                    value={form.pickupLongitude}
                    onChange={handleChange}
                    placeholder="Click map"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                These coordinates are used to show your vehicle on the map and
                to help renters find nearby vehicles.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              <FontAwesomeIcon icon={faImage} className="mr-2 h-4 w-4 text-slate-500" />
              Vehicle images (optional, max {MAX_IMAGES}, {MAX_FILE_SIZE_MB}MB each)
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              Choose files
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                onChange={handleImageFilesChange}
                className="hidden"
              />
            </label>
          </div>
          {imageFiles.length > 0 && (
            <div className="space-y-2">
              {imageFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
                  <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  <button type="button" onClick={() => removeImageFile(index)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600" aria-label="Remove">
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              <FontAwesomeIcon icon={faFileAlt} className="mr-2 h-4 w-4 text-slate-500" />
              Vehicle document images <span className="text-red-500">*</span> (mandatory for admin verification, max {MAX_DOCUMENTS}, {MAX_DOC_SIZE_MB}MB each – PDF or images)
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
              Choose files
              <input
                type="file"
                accept={ACCEPTED_DOC_TYPES}
                multiple
                onChange={handleDocumentFilesChange}
                className="hidden"
              />
            </label>
          </div>
          {documentFiles.length === 0 && (
            <p className="text-sm text-amber-700">At least one document image is required.</p>
          )}
          {documentFiles.length > 0 && (
            <div className="space-y-2">
              {documentFiles.map((file, index) => (
                <div
                  key={`doc-${file.name}-${index}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">{file.name}</span>
                  <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  <button type="button" onClick={() => removeDocumentFile(index)} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600" aria-label="Remove document">
                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add vehicle"}
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

export default AddVehicleForm;
