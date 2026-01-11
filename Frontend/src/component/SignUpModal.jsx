import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faKey,
  faLock,
  faTimes,
  faUser,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { authAPI } from "../utils/api.js";

const SignUpModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState("register"); // 'register' or 'verify'
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "renter", // Default role
  });
  const [otp, setOtp] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.role
      );

      if (response.success) {
        // Store registered email for verification
        setRegisteredEmail(formData.email);
        // Move to OTP verification step
        setStep("verify");
        setSuccess(
          "Registration successful! Please verify your email with the OTP sent to your inbox."
        );
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.verifyEmail(registeredEmail, otp);

      if (response.success) {
        setSuccess("Email verified successfully!");
        // Close modal and optionally reload
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await authAPI.resendOTP(registeredEmail);

      if (response.success) {
        setSuccess("OTP has been resent to your email");
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("register");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "renter",
    });
    setOtp("");
    setRegisteredEmail("");
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-black/95 to-black/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">
            {step === "register" ? "Create Account" : "Verify Your Email"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {step === "register"
              ? "Join AutoRent and start renting today"
              : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {/* Success/Error messages */}
        {success && (
          <div className="mb-5 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Registration Form */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-5">
            {/* First Name field */}
            <div>
              <label
                htmlFor="signup-firstname"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                First Name
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                />
                <input
                  id="signup-firstname"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>
            </div>

            {/* Last Name field */}
            <div>
              <label
                htmlFor="signup-lastname"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Last Name
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                />
                <input
                  id="signup-lastname"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>
            </div>

            {/* Role field */}
            <div>
              <label
                htmlFor="signup-role"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                I want to
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUserTag}
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                />
                <select
                  id="signup-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                >
                  <option value="renter" className="bg-black text-white">
                    Rent a Vehicle
                  </option>
                  <option value="owner" className="bg-black text-white">
                    List My Vehicle
                  </option>
                </select>
              </div>
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor="signup-email"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Email Address
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="signup-password"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                />
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/60"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Confirm Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/60"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer rounded-xl bg-orange-500 py-3 text-base font-bold text-black shadow-[0_8px_30px_rgba(249,115,22,0.35)] transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        )}

        {/* OTP Verification Form */}
        {step === "verify" && (
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <div>
              <label
                htmlFor="signup-otp"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                6-Digit OTP Code
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faKey}
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                />
                <input
                  id="signup-otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                  }}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-center text-2xl font-bold tracking-widest text-white placeholder:text-white/20 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                />
              </div>
              <p className="mt-2 text-xs text-white/50">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="font-medium text-orange-400 hover:text-orange-300 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full cursor-pointer rounded-xl bg-orange-500 py-3 text-base font-bold text-black shadow-[0_8px_30px_rgba(249,115,22,0.35)] transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        )}

        {/* Switch to Login */}
        <div className="mt-6 text-center text-sm text-white/60">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="font-semibold text-orange-400 transition hover:text-orange-300"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
