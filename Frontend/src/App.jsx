import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import FAQ from "./component/FAQ.jsx";
import Footer from "./component/Footer.jsx";
import ForgotPasswordModal from "./component/ForgotPasswordModal.jsx";
import LoginModal from "./component/LoginModal.jsx";
import Navbar from "./component/navbar.jsx";
import SignUpModal from "./component/SignUpModal.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Favorites from "./pages/Favorites.jsx";
import GaragesMap from "./pages/GaragesMap.jsx";
import Home from "./pages/Home.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import RentVehicle from "./pages/RentVehicle.jsx";
import Services from "./pages/Services.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import VehicleBook from "./pages/VehicleBook.jsx";
import VehicleDetail from "./pages/VehicleDetail.jsx";
import { getAuthToken, removeAuthToken } from "./utils/api.js";

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(null); // 'login', 'signup', 'forgotPassword', or null
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDashboard = location.pathname === "/dashboard";

  // Re-check auth on mount and whenever route changes (so dashboard logout updates global navbar)
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, [location.pathname]);

  // Open login modal when navigating with state.openLogin (e.g. from Favorites when not signed in)
  useEffect(() => {
    if (location.state?.openLogin) {
      setOpenModal("login");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.openLogin, location.pathname, navigate]);

  const handleLoginSuccess = (response) => {
    setIsAuthenticated(true);
    setOpenModal(null);
    // Redirect owner and admin directly to their dashboard (skip home/landing)
    const role = response?.user?.role;
    if (role === "owner" || role === "admin") {
      navigate("/dashboard");
    }
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
        <Route path="/vehicles" element={<RentVehicle />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/garages-map" element={<GaragesMap />} />
        <Route path="/vehicles/:id" element={<VehicleDetail />} />
        <Route path="/vehicles/:id/book" element={<VehicleBook />} />
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
