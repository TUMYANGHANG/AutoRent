import {
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { authAPI, setAuthToken } from "../utils/api.js";

const LoginModal = ({
  isOpen,
  onClose,
  onSwitchToSignUp,
  onSwitchToForgotPassword,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);

      // Store the token
      if (response.token) {
        setAuthToken(response.token);
      }

      // Store user data if provided
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Call success callback with response so parent can redirect by role
      if (onLoginSuccess) {
        onLoginSuccess(response);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-white/60">
            Sign in to your AutoRent account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error message */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Email field */}
          <div>
            <label
              htmlFor="login-email"
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
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-white/40 focus:border-orange-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="login-password"
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
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
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

          {/* Forgot password link */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToForgotPassword();
              }}
              className="text-sm font-medium text-orange-400 transition hover:text-orange-300"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-xl bg-orange-500 py-3 text-base font-bold text-black shadow-[0_8px_30px_rgba(249,115,22,0.35)] transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Switch to Sign Up */}
        <div className="mt-6 text-center text-sm text-white/60">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSwitchToSignUp();
            }}
            className="font-semibold text-orange-400 transition hover:text-orange-300"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
