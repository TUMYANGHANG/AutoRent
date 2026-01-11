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
    const data = await response.json();

    if (!response.ok) {
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

// User Details API
export const userDetailsAPI = {
  // Get user details by user ID
  getUserDetails: async (userId) => {
    return apiRequest(`/user-details/${userId}`, {
      method: "GET",
    });
  },

  // Create user details
  createUserDetails: async (userId, detailsData) => {
    return apiRequest("/user-details", {
      method: "POST",
      body: JSON.stringify({
        userId,
        phoneNumber: detailsData.phoneNumber,
        dateOfBirth: detailsData.dateOfBirth,
        profilePicture: detailsData.profilePicture,
        address: detailsData.address,
        city: detailsData.city,
        licenseNumber: detailsData.licenseNumber,
        licenseExpiry: detailsData.licenseExpiry,
        licenseImage: detailsData.licenseImage,
      }),
    });
  },

  // Update user details
  updateUserDetails: async (userId, detailsData) => {
    return apiRequest(`/user-details/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        phoneNumber: detailsData.phoneNumber,
        dateOfBirth: detailsData.dateOfBirth,
        profilePicture: detailsData.profilePicture,
        address: detailsData.address,
        city: detailsData.city,
        licenseNumber: detailsData.licenseNumber,
        licenseExpiry: detailsData.licenseExpiry,
        licenseImage: detailsData.licenseImage,
      }),
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

