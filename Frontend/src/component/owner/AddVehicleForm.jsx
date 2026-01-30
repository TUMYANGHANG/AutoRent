import { faImage, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { vehicleAPI } from "../../utils/api.js";

const INITIAL_FORM = {
  make: "",
  model: "",
  year: "",
  licensePlate: "",
  dailyRate: "",
  color: "",
  description: "",
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_IMAGES = 10;
const MAX_FILE_SIZE_MB = 5;

const AddVehicleForm = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFiles, setImageFiles] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const year = form.year ? Number(form.year) : null;
    const dailyRate = form.dailyRate ? Number(form.dailyRate) : null;

    if (!form.make?.trim()) {
      setError("Make is required.");
      return;
    }
    if (!form.model?.trim()) {
      setError("Model is required.");
      return;
    }
    if (!year || year < 1900 || year > new Date().getFullYear() + 1) {
      setError("Please enter a valid year.");
      return;
    }
    if (!form.licensePlate?.trim()) {
      setError("License plate is required.");
      return;
    }
    if (!dailyRate || dailyRate <= 0) {
      setError("Daily rate must be a positive number.");
      return;
    }

    setLoading(true);
    try {
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const uploadRes = await vehicleAPI.uploadImages(imageFiles);
        imageUrls = uploadRes.data?.urls ?? [];
      }

      const payload = {
        make: form.make.trim(),
        model: form.model.trim(),
        year,
        licensePlate: form.licensePlate.trim(),
        dailyRate,
        color: form.color?.trim() || undefined,
        description: form.description?.trim() || undefined,
        imageUrls,
      };

      const res = await vehicleAPI.addVehicle(payload);
      setSuccess(true);
      setForm(INITIAL_FORM);
      setImageFiles([]);
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
            onClick={() => {
              setSuccess(false);
            }}
            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
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
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">Add New Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="make" className="mb-1.5 block text-sm font-medium text-slate-700">
              Make <span className="text-red-500">*</span>
            </label>
            <input
              id="make"
              name="make"
              type="text"
              value={form.make}
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
            <label htmlFor="year" className="mb-1.5 block text-sm font-medium text-slate-700">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              id="year"
              name="year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={handleChange}
              placeholder="e.g. 2022"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div>
            <label htmlFor="licensePlate" className="mb-1.5 block text-sm font-medium text-slate-700">
              License plate <span className="text-red-500">*</span>
            </label>
            <input
              id="licensePlate"
              name="licensePlate"
              type="text"
              value={form.licensePlate}
              onChange={handleChange}
              placeholder="e.g. ABC-1234"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              maxLength={20}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="dailyRate" className="mb-1.5 block text-sm font-medium text-slate-700">
              Daily rate ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="dailyRate"
              name="dailyRate"
              type="number"
              min="0"
              step="0.01"
              value={form.dailyRate}
              onChange={handleChange}
              placeholder="e.g. 45.00"
              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
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
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {file.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImageFile(index)}
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove"
                  >
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
