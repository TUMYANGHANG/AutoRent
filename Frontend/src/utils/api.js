const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses (like HTML error pages)
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      if (response.status === 401 || response.status === 403) {
        throw new Error("Access token required");
      }
      throw new Error(text || "An error occurred");
    }

    if (!response.ok) {
      // Handle 401/403 - redirect to login
      if (response.status === 401 || response.status === 403) {
        throw new Error("Access token required");
      }
      // Handle validation errors with detailed messages
      if (data.errors && Array.isArray(data.errors)) {
        throw new Error(data.errors.join(", "));
      }
      throw new Error(data.message || data.error || "An error occurred");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register new user
  register: async (firstName, lastName, email, password, role = "renter") => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    });
  },

  // Verify email with OTP
  verifyEmail: async (email, otp) => {
    return apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  // Resend OTP
  resendOTP: async (email) => {
    return apiRequest("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Login
  login: async (email, password) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Send OTP for forgot password
  sendOTP: async (email) => {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    return apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
  },

  // Reset password
  resetPassword: async (email, otp, newPassword) => {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },
};


// Vehicle API (owner only)
export const vehicleAPI = {
  addVehicle: async (vehicleData) => {
    return apiRequest("/vehicles", {
      method: "POST",
      body: JSON.stringify(vehicleData),
    });
  },

  /** Upload image files to Cloudinary via backend. Returns { urls: string[] }. */
  uploadImages: async (files) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Access token required");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    const url = `${API_BASE_URL}/upload/images`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) throw new Error(data.errors.join(", "));
      throw new Error(data.message || "Upload failed");
    }
    return data;
  },

  /** Upload document files (PDF/images) via backend. Returns { urls: string[] }. */
  uploadDocuments: async (files) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Access token required");
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("documents", files[i]);
    }
    const url = `${API_BASE_URL}/upload/documents`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) throw new Error(data.errors.join(", "));
      throw new Error(data.message || "Upload failed");
    }
    return data;
  },

  getMyVehicles: async () => {
    return apiRequest("/vehicles", { method: "GET" });
  },

  getVehicleById: async (vehicleId) => {
    return apiRequest(`/vehicles/${vehicleId}`, { method: "GET" });
  },

  addVehicleImages: async (vehicleId, imageUrls) => {
    return apiRequest(`/vehicles/${vehicleId}/images`, {
      method: "POST",
      body: JSON.stringify({ imageUrls }),
    });
  },

  updateVehicle: async (vehicleId, data) => {
    return apiRequest(`/vehicles/${vehicleId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteVehicle: async (vehicleId) => {
    return apiRequest(`/vehicles/${vehicleId}`, { method: "DELETE" });
  },
};

// Public / Renter API (no auth required for browse)
export const renterAPI = {
  /** Get all vehicles available for rent (verified + available) */
  getVehiclesForRent: async () => {
    return apiRequest("/vehicles/browse", { method: "GET" });
  },

  /** Get a single vehicle by ID for rent (verified + available) */
  getVehicleById: async (vehicleId) => {
    return apiRequest(`/vehicles/browse/${vehicleId}`, { method: "GET" });
  },
};

// Favorites API (auth required)
export const favoritesAPI = {
  getIds: async () => {
    const res = await apiRequest("/favorites/ids", { method: "GET" });
    return res?.data ?? [];
  },

  getFavorites: async () => {
    const res = await apiRequest("/favorites", { method: "GET" });
    return res?.data ?? [];
  },

  add: async (vehicleId) => {
    return apiRequest("/favorites", {
      method: "POST",
      body: JSON.stringify({ vehicleId }),
    });
  },

  remove: async (vehicleId) => {
    return apiRequest(`/favorites/${vehicleId}`, { method: "DELETE" });
  },
};

// Notifications API (auth required – admin and owner use same endpoints)
export const notificationsAPI = {
  getNotifications: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `/notifications?${qs}` : "/notifications";
    const res = await apiRequest(url, { method: "GET" });
    return res?.data ?? [];
  },

  getUnreadCount: async () => {
    const res = await apiRequest("/notifications/unread-count", { method: "GET" });
    return res?.data?.count ?? 0;
  },

  markAsRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },

  markAllAsRead: async () => {
    return apiRequest("/notifications/read-all", { method: "PATCH" });
  },
};

// Admin API (admin only)
export const adminAPI = {
  getStats: async () => {
    return apiRequest("/admin/stats", { method: "GET" });
  },

  getAllVehicles: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `/admin/vehicles?${qs}` : "/admin/vehicles";
    return apiRequest(url, { method: "GET" });
  },

  getVehicleById: async (vehicleId) => {
    return apiRequest(`/admin/vehicles/${vehicleId}`, { method: "GET" });
  },

  updateVehicleVerify: async (vehicleId, isVerified) => {
    return apiRequest(`/admin/vehicles/${vehicleId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    });
  },
};

// User Details API (auth required)
export const userDetailsAPI = {
  getUserDetails: async (userId) => {
    return apiRequest(`/user-details/${userId}`, { method: "GET" });
  },

  createUserDetails: async (userId, detailsData) => {
    return apiRequest("/user-details", {
      method: "POST",
      body: JSON.stringify({ userId, ...detailsData }),
    });
  },

  updateUserDetails: async (userId, detailsData) => {
    return apiRequest(`/user-details/${userId}`, {
      method: "PUT",
      body: JSON.stringify(detailsData),
    });
  },

  // Verify license (Admin only)
  verifyLicense: async (userId, isVerified) => {
    return apiRequest(`/user-details/${userId}/verify-license`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    });
  },
};

// Token management
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("token");
};

