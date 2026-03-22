const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
    signal: controller.signal,
  };

  // Add auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

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
      const message = data?.message || data?.error;
      if (response.status === 401 || response.status === 403) {
        throw new Error(message || "Access token required");
      }
      if (data.errors && Array.isArray(data.errors)) {
        throw new Error(data.errors.join(", "));
      }
      throw new Error(message || "An error occurred");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    if (error.message === "Failed to fetch") {
      throw new Error("Unable to reach the server. Please check your connection.");
    }
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

  // Get current user (auth required; includes isProfileVerified)
  me: async () => {
    const res = await apiRequest("/auth/me", { method: "GET" });
    return res?.user ?? null;
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
  /** Get all vehicles available for rent (verified + available). Pass { lat, lng, radiusKm, nearby: true } for nearby sort. */
  getVehiclesForRent: async (params = {}) => {
    const qs = new URLSearchParams();
    if (params.lat != null) qs.set("lat", params.lat);
    if (params.lng != null) qs.set("lng", params.lng);
    if (params.radiusKm != null) qs.set("radiusKm", params.radiusKm);
    if (params.nearby === true) qs.set("nearby", "true");
    const url = qs.toString() ? `/vehicles/browse?${qs.toString()}` : "/vehicles/browse";
    return apiRequest(url, { method: "GET" });
  },

  /** Get a single vehicle by ID for rent (verified + available) */
  getVehicleById: async (vehicleId) => {
    return apiRequest(`/vehicles/browse/${vehicleId}`, { method: "GET" });
  },
};

// Garages API (map + crowd locating)
export const garagesAPI = {
  /**
   * Get garages for current map viewport using bbox = "west,south,east,north".
   * Returns { success, data } shape from backend.
   */
  getForMap: async (bbox) => {
    const encoded = encodeURIComponent(bbox);
    return apiRequest(`/garages/map?bbox=${encoded}`, { method: "GET" });
  },

  /**
   * Create a new garage (renter crowd locating).
   * Requires auth token for renter.
   */
  create: async (garageData) => {
    return apiRequest("/garages", {
      method: "POST",
      body: JSON.stringify(garageData),
    });
  },
};

// Booking requests API (renter submits request, owner approves/rejects)
export const bookingRequestsAPI = {
  create: async (data) => {
    return apiRequest("/booking-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getMyRequests: async () => {
    const res = await apiRequest("/booking-requests", { method: "GET" });
    return res?.data ?? [];
  },

  getForOwner: async () => {
    const res = await apiRequest("/booking-requests/owner", { method: "GET" });
    return res?.data ?? [];
  },

  getById: async (requestId) => {
    const res = await apiRequest(`/booking-requests/${requestId}`, { method: "GET" });
    return res?.data ?? null;
  },

  approve: async (requestId) => {
    return apiRequest(`/booking-requests/${requestId}/approve`, { method: "PATCH" });
  },

  reject: async (requestId, rejectionReason) => {
    return apiRequest(`/booking-requests/${requestId}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ rejectionReason: rejectionReason || null }),
    });
  },

  cancel: async (requestId) => {
    return apiRequest(`/booking-requests/${requestId}/cancel`, { method: "PATCH" });
  },
};

// Vehicle reviews API
export const reviewsAPI = {
  /** Get reviews and rating stats for a vehicle (public). */
  getForVehicle: async (vehicleId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const url = qs
      ? `/vehicles/${vehicleId}/reviews?${qs}`
      : `/vehicles/${vehicleId}/reviews`;
    const res = await apiRequest(url, { method: "GET" });
    return res?.data ?? { reviews: [], averageRating: null, reviewCount: 0 };
  },

  /** Get current user's review and eligibility (auth required). */
  getMyReview: async (vehicleId) => {
    const res = await apiRequest(`/vehicles/${vehicleId}/reviews/me`, {
      method: "GET",
    });
    return res?.data ?? null;
  },

  /** Create or update review (auth required). */
  create: async (vehicleId, { rating, comment, bookingId }) => {
    const res = await apiRequest(`/vehicles/${vehicleId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment, bookingId }),
    });
    return res?.data ?? null;
  },
};

// Bookings API (confirmed bookings only; created when owner approves a request)
export const bookingsAPI = {
  getById: async (bookingId) => {
    const res = await apiRequest(`/bookings/${bookingId}`, { method: "GET" });
    return res?.data ?? null;
  },

  getMyBookings: async () => {
    const res = await apiRequest("/bookings", { method: "GET" });
    return res?.data ?? [];
  },

  /** Get owner dashboard stats (active rentals, total earnings). Owner only. */
  getOwnerStats: async () => {
    const res = await apiRequest("/bookings/stats", { method: "GET" });
    return res?.data ?? { activeRentals: 0, totalEarnings: 0 };
  },

  cancel: async (bookingId) => {
    return apiRequest(`/bookings/${bookingId}/cancel`, {
      method: "PATCH",
    });
  },
};

// Khalti payment API
export const khaltiAPI = {
  /** Initiate Khalti payment for a booking. Returns { paymentUrl, pidx }. */
  initiate: async (bookingId) => {
    const returnUrl = `${window.location.origin}/payment/return`;
    const websiteUrl = window.location.origin;
    const res = await apiRequest("/payments/khalti/initiate", {
      method: "POST",
      body: JSON.stringify({
        bookingId,
        returnUrl,
        websiteUrl,
      }),
    });
    return res;
  },

  /** Verify Khalti payment after redirect. Pass pidx and purchaseOrderId from URL. */
  verify: async (pidx, purchaseOrderId) => {
    const res = await apiRequest("/payments/khalti/verify", {
      method: "POST",
      body: JSON.stringify({ pidx, purchaseOrderId }),
    });
    return res;
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

// Chat API (auth required)
export const chatAPI = {
  /** Get list of owners (for renters) */
  getOwners: async () => {
    const res = await apiRequest("/chat/owners", { method: "GET" });
    return res?.data ?? [];
  },

  /** Get list of renters (for owners) */
  getRenters: async () => {
    const res = await apiRequest("/chat/renters", { method: "GET" });
    return res?.data ?? [];
  },

  /**
   * Ensure a conversation exists with targetUserId (owner for renter, renter for owner)
   * Body: { targetUserId }
   */
  ensureConversation: async ({ targetUserId }) => {
    const res = await apiRequest("/chat/conversations", {
      method: "POST",
      body: JSON.stringify({ targetUserId: targetUserId || undefined }),
    });
    return res?.data ?? null;
  },

  /** Get messages for a conversation */
  getMessages: async (conversationId, limit = 50) => {
    const res = await apiRequest(
      `/chat/conversations/${conversationId}/messages?limit=${limit}`,
      { method: "GET" },
    );
    return res?.data ?? { conversation: null, messages: [] };
  },

  /** Send message over HTTP (fallback / testing without sockets) */
  sendMessageHttp: async (conversationId, text) => {
    const res = await apiRequest(`/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    return res?.data ?? null;
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

  getAllUsers: async (role) => {
    const url = role ? `/admin/users?role=${encodeURIComponent(role)}` : "/admin/users";
    const res = await apiRequest(url, { method: "GET" });
    return res?.data ?? [];
  },

  getPendingProfileVerification: async () => {
    const res = await apiRequest("/admin/users/pending-verification", {
      method: "GET",
    });
    return res?.data ?? [];
  },

  verifyProfile: async (userId, isVerified) => {
    return apiRequest(`/admin/users/${userId}/verify-profile`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    });
  },

  deleteUser: async (userId) => {
    return apiRequest(`/admin/users/${userId}`, { method: "DELETE" });
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

