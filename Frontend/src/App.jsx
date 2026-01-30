import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import FAQ from "./component/FAQ.jsx";
import Footer from "./component/Footer.jsx";
import ForgotPasswordModal from "./component/ForgotPasswordModal.jsx";
import LoginModal from "./component/LoginModal.jsx";
import Navbar from "./component/navbar.jsx";
import SignUpModal from "./component/SignUpModal.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import Services from "./pages/Services.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import { getAuthToken, removeAuthToken } from "./utils/api.js";

const AppContent = () => {
  const location = useLocation();
  const [openModal, setOpenModal] = useState(null); // 'login', 'signup', 'forgotPassword', or null
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDashboard = location.pathname === "/dashboard";

  // Check authentication status on mount
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setOpenModal(null);
  };

  const handleLogout = () => {
    // Clear token and user data
    removeAuthToken();
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    // Redirect to home
    window.location.href = "/";
  };

  return (
    <>
      {!isDashboard && (
        <Navbar
          isAuthenticated={isAuthenticated}
          onOpenLogin={() => setOpenModal("login")}
          onOpenSignUp={() => setOpenModal("signup")}
          onLogout={handleLogout}
        />
      )}

      <LoginModal
        isOpen={openModal === "login"}
        onClose={() => setOpenModal(null)}
        onSwitchToSignUp={() => setOpenModal("signup")}
        onSwitchToForgotPassword={() => setOpenModal("forgotPassword")}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignUpModal
        isOpen={openModal === "signup"}
        onClose={() => setOpenModal(null)}
        onSwitchToLogin={() => setOpenModal("login")}
      />

      <ForgotPasswordModal
        isOpen={openModal === "forgotPassword"}
        onClose={() => setOpenModal(null)}
        onSwitchToLogin={() => setOpenModal("login")}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

      {!isDashboard && <Footer />}
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
