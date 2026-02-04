import {
  faCalendar,
  faCamera,
  faCheckCircle,
  faEnvelope,
  faIdCard,
  faImage,
  faMapMarkerAlt,
  faPhone,
  faSave,
  faTimes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { userDetailsAPI } from "../../utils/api.js";

const RenterProfileForm = ({ user, userDetails, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
    city: "",
    licenseNumber: "",
    licenseExpiry: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [licenseImageFile, setLicenseImageFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [licenseImagePreview, setLicenseImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userDetails) {
      setForm({
        phoneNumber: userDetails.phoneNumber || "",
        dateOfBirth: userDetails.dateOfBirth || "",
        address: userDetails.address || "",
        city: userDetails.city || "",
        licenseNumber: userDetails.licenseNumber || "",
        licenseExpiry: userDetails.licenseExpiry || "",
      });
      if (userDetails.profilePicture) {
        setProfilePicturePreview(userDetails.profilePicture);
      }
      if (userDetails.licenseImage) {
        setLicenseImagePreview(userDetails.licenseImage);
      }
    }
  }, [userDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Profile picture must be an image");
      return;
    }
    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicturePreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
    e.target.value = "";
  };

  const handleLicenseImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("License image must be less than 10MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("License image must be an image");
      return;
    }
    setLicenseImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLicenseImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError("");
    e.target.value = "";
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5002/api"}/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      let errorMessage = "Failed to upload image";
      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch {
        const text = await response.text();
        if (text.includes("<!DOCTYPE")) {
          errorMessage = "Server returned an error page. Please check your API URL and server status.";
        }
      }
      throw new Error(errorMessage);
    }
    const data = await response.json();
    return data?.data?.url || data?.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      let profilePictureUrl = userDetails?.profilePicture || null;
      let licenseImageUrl = userDetails?.licenseImage || null;

      if (profilePictureFile) {
        profilePictureUrl = await uploadImage(profilePictureFile);
      }
      if (licenseImageFile) {
        licenseImageUrl = await uploadImage(licenseImageFile);
      }

      const detailsData = {
        phoneNumber: form.phoneNumber.trim() || null,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        licenseNumber: form.licenseNumber.trim() || null,
        licenseExpiry: form.licenseExpiry || null,
        profilePicture: profilePictureUrl,
        licenseImage: licenseImageUrl,
      };

      if (userDetails) {
        await userDetailsAPI.updateUserDetails(user.id, detailsData);
      } else {
        await userDetailsAPI.createUserDetails(user.id, detailsData);
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1000);
    } catch (err) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-400">
          Profile saved successfully!
        </div>
      )}

      {/* Profile Picture */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white/90">
          Profile Picture
        </label>
        <div className="flex items-center gap-4">
          {profilePicturePreview && (
            <img
              src={profilePicturePreview}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover border-2 border-white/20"
            />
          )}
          <label className="cursor-pointer rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10">
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            {profilePicturePreview ? "Change" : "Upload"}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-white/90">
          <FontAwesomeIcon icon={faPhone} className="mr-2 text-amber-400" />
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={form.phoneNumber}
          onChange={handleChange}
          placeholder="+1234567890"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dateOfBirth" className="mb-2 block text-sm font-medium text-white/90">
          <FontAwesomeIcon icon={faCalendar} className="mr-2 text-amber-400" />
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
          max={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="mb-2 block text-sm font-medium text-white/90">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-amber-400" />
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Street address"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="mb-2 block text-sm font-medium text-white/90">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-amber-400" />
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City name"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* License Number */}
      <div>
        <label htmlFor="licenseNumber" className="mb-2 block text-sm font-medium text-white/90">
          <FontAwesomeIcon icon={faIdCard} className="mr-2 text-amber-400" />
          License Number
        </label>
        <input
          type="text"
          id="licenseNumber"
          name="licenseNumber"
          value={form.licenseNumber}
          onChange={handleChange}
          placeholder="Driver's license number"
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/50 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* License Expiry */}
      <div>
        <label htmlFor="licenseExpiry" className="mb-2 block text-sm font-medium text-white/90">
          <FontAwesomeIcon icon={faCalendar} className="mr-2 text-amber-400" />
          License Expiry Date
        </label>
        <input
          type="date"
          id="licenseExpiry"
          name="licenseExpiry"
          value={form.licenseExpiry}
          onChange={handleChange}
          min={new Date().toISOString().split("T")[0]}
          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* License Image */}
      <div>
        <label className="mb-2 block text-sm font-medium text-white/90">
          <FontAwesomeIcon icon={faImage} className="mr-2 text-amber-400" />
          License Image
        </label>
        <div className="space-y-2">
          {licenseImagePreview && (
            <img
              src={licenseImagePreview}
              alt="License"
              className="max-h-48 rounded-lg border border-white/20 object-contain"
            />
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10">
            <FontAwesomeIcon icon={faImage} />
            {licenseImagePreview ? "Change License Image" : "Upload License Image"}
            <input
              type="file"
              accept="image/*"
              onChange={handleLicenseImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* License Verification Status */}
      {userDetails?.isLicenseVerified && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-400">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span className="text-sm font-medium">License verified by admin</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:opacity-60"
        >
          <FontAwesomeIcon icon={faSave} />
          {loading ? "Saving..." : "Save Profile"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 font-semibold text-white/90 transition hover:bg-white/10 disabled:opacity-60"
          >
            <FontAwesomeIcon icon={faTimes} />
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default RenterProfileForm;
