import {
  faCheckCircle,
  faEnvelope,
  faEye,
  faEyeSlash,
  faKey,
  faLock,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { authAPI } from "../utils/api.js";

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow states: 'email' -> 'otp' -> 'password' -> 'success'
  const [step, setStep] = useState("email");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authAPI.sendOTP(email);
      // On success, move to OTP step
      setStep("otp");
      setSuccess(`OTP has been sent to ${email}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.verifyOTP(email, otp);
      // On success, move to password step
      setStep("password");
      setSuccess("OTP verified successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword(email, otp, newPassword);
      // On success, show success message
      setStep("success");
      setSuccess("Password has been reset successfully!");
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
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
        onClick={handleClose}
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
            {step === "email" && "Forgot Password"}
            {step === "otp" && "Enter OTP"}
            {step === "password" && "Reset Password"}
            {step === "success" && "Password Reset"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {step === "email" &&
              "Enter your email to receive a password reset code"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
            {step === "password" && "Enter your new password"}
            {step === "success" && "Your password has been reset successfully"}
          </p>
        </div>

        {/* Success Step */}
        {step === "success" ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-4">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="h-12 w-12 text-green-400"
                />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">
                Password Reset Successful!
              </p>
              <p className="mt-2 text-sm text-white/60">
                You can now sign in with your new password
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleClose();
                onSwitchToLogin();
              }}
              className="w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-black shadow-[0_8px_30px_rgba(249,115,22,0.35)] transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-black"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <>
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

            {/* Step 1: Email Input */}
            {step === "email" && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label
                    htmlFor="forgot-email"
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
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl bg-orange-500 py-3 text-base font-bold text-black shadow-[0_8px_30px_rgba(249,115,22,0.35)] transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div>
                  <label
                    htmlFor="forgot-otp"
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
                      id="forgot-otp"
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
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
                      onClick={handleSendOTP}
                      className="font-medium text-orange-400 hover:text-orange-300"
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
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label
                    htmlFor="forgot-new-password"
                    className="mb-2 block text-sm font-medium text-white/80"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                    />
                    <input
                      id="forgot-new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 8 characters"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white/60"
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEyeSlash : faEye}
                        className="h-5 w-5"
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="forgot-confirm-password"
                    className="mb-2 block text-sm font-medium text-white/80"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40"
                    />
                    <input
                      id="forgot-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your new password"
                      className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-xl bg-orange-500 py-3 text-base font-bold text-black shadow-[0_8px_30px_rgba(249,115,22,0.35)] transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center text-sm text-white/60">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onSwitchToLogin();
                }}
                className="font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
