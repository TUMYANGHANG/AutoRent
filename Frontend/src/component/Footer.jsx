import {
  faArrowUp,
  faChevronRight,
  faCommentDots,
  faEnvelope,
  faEnvelope as faEnvelopeCircle,
  faMapMarkerAlt,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", message: "" });
    setShowContactForm(false);
  };

  const shortcutsLeft = ["Home", "Services", "Shop", "FAQ"];

  const shortcutsRight = ["Privacy Policy", "Terms of Service"];

  return (
    <footer className="relative bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Office Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Office
              <span className="mt-2 block h-0.5 w-12 bg-orange-500"></span>
            </h3>
            <ul className="space-y-3">
              <li className="group flex cursor-pointer items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="h-3 w-3 text-orange-500 transition-colors duration-300 group-hover:text-white"
                  />
                </div>
                <span className="text-sm text-gray-300 transition-colors duration-300 group-hover:text-orange-400">
                  Dulhari, Itahari
                </span>
              </li>
              <li className="group flex cursor-pointer items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="h-3 w-3 text-orange-500 transition-colors duration-300 group-hover:text-white"
                  />
                </div>
                <span className="text-sm text-gray-300 transition-colors duration-300 group-hover:text-orange-400">
                  9815045184
                </span>
              </li>
              <li className="group flex cursor-pointer items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-3 w-3 text-orange-500 transition-colors duration-300 group-hover:text-white"
                  />
                </div>
                <span className="text-sm text-gray-300 transition-colors duration-300 group-hover:text-orange-400">
                  support@autorent.com
                </span>
              </li>
            </ul>
          </div>

          {/* Shortcuts Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Shortcuts
              <span className="mt-2 block h-0.5 w-12 bg-orange-500"></span>
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="space-y-2">
                {shortcutsLeft.map((link) => {
                  const href =
                    link === "Home"
                      ? "/"
                      : link === "Services"
                      ? "/services"
                      : link === "FAQ"
                      ? "/faq"
                      : link === "Contact"
                      ? "/contact"
                      : `#${link.toLowerCase().replace(/\s+/g, "-")}`;
                  const isRoute =
                    link === "Home" ||
                    link === "Services" ||
                    link === "FAQ" ||
                    link === "Contact";

                  return isRoute ? (
                    <Link
                      key={link}
                      to={href}
                      className="group flex cursor-pointer items-center gap-2 text-sm text-gray-300 transition-all duration-300 hover:translate-x-1 hover:text-orange-500"
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="h-3 w-3 text-gray-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-500"
                      />
                      {link}
                    </Link>
                  ) : (
                    <a
                      key={link}
                      href={href}
                      className="group flex cursor-pointer items-center gap-2 text-sm text-gray-300 transition-all duration-300 hover:translate-x-1 hover:text-orange-500"
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="h-3 w-3 text-gray-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-500"
                      />
                      {link}
                    </a>
                  );
                })}
              </div>
              <div className="space-y-2">
                {shortcutsRight.map((link) => {
                  const href =
                    link === "Privacy Policy"
                      ? "/privacy-policy"
                      : link === "Terms of Service"
                      ? "/terms-of-service"
                      : `#${link.toLowerCase().replace(/\s+/g, "-")}`;
                  const isRoute =
                    link === "Privacy Policy" || link === "Terms of Service";

                  return isRoute ? (
                    <Link
                      key={link}
                      to={href}
                      className="group flex cursor-pointer items-center gap-2 text-sm text-gray-300 transition-all duration-300 hover:translate-x-1 hover:text-orange-500"
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="h-3 w-3 text-gray-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-500"
                      />
                      {link}
                    </Link>
                  ) : (
                    <a
                      key={link}
                      href={href}
                      className="group flex cursor-pointer items-center gap-2 text-sm text-gray-300 transition-all duration-300 hover:translate-x-1 hover:text-orange-500"
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="h-3 w-3 text-gray-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-orange-500"
                      />
                      {link}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Working Hours Section */}
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Working Hours
              <span className="mt-2 block h-0.5 w-12 bg-orange-500"></span>
            </h3>
            <p className="mb-4 text-sm text-gray-300">
              Our support available to help you 24 hours a day, seven days a
              week.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="cursor-pointer transition-colors duration-300 hover:text-orange-400">
                Monday to Friday: 8AM - 4PM
              </div>
              <div className="cursor-pointer transition-colors duration-300 hover:text-orange-400">
                Saturday: 8AM - 1PM
              </div>
              <div className="cursor-pointer transition-colors duration-300 hover:text-orange-400">
                Sunday: Closed
              </div>
            </div>

            {/* Contact Form - Overlapping from right */}
            {showContactForm && (
              <div className="absolute left-0 top-[-40px] z-50 w-full rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-2xl md:left-auto md:right-[-80px] md:w-[360px] lg:right-[-50px]">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white">
                    Contact Us
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="text-gray-400 transition hover:text-white"
                    aria-label="Close form"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1 block text-xs font-medium text-gray-300"
                    >
                      Your Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1 block text-xs font-medium text-gray-300"
                    >
                      Your Email <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="mb-1 block text-xs font-medium text-gray-300"
                    >
                      Your Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      placeholder="Enter your message"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full cursor-pointer rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="border-t border-gray-800 bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Left Side - Chat Icon and Copyright */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-white transition-all duration-300 hover:scale-110 hover:bg-orange-600"
                aria-label="Contact Support"
              >
                <FontAwesomeIcon icon={faCommentDots} className="h-5 w-5" />
              </button>
              <p className="text-sm text-gray-400">
                Copyright © 2025 AutoRent. All Rights Reserved.
              </p>
            </div>

            {/* Right Side - Payment Method and Action Buttons */}
            <div className="flex flex-col items-center gap-4 md:flex-row">
              {/* Payment Methods */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-gray-500">Payment Methods:</span>
                <div className="flex items-center gap-2">
                  <div className="group flex h-8 cursor-pointer items-center justify-center rounded bg-white px-3 py-1 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                    <span className="text-xs font-semibold text-gray-800 transition-colors duration-300 group-hover:text-orange-500">
                      eSewa
                    </span>
                  </div>
                  <div className="group flex h-8 cursor-pointer items-center justify-center rounded bg-white px-3 py-1 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                    <svg
                      className="h-5 transition-all duration-300 group-hover:scale-110"
                      viewBox="0 0 468 222.5"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M414 113.4c0-25.6-12.4-45.5-35-45.5-18.7 0-30.7 13.5-35.8 26.3v-22.7h-40.2v133.2h40.2v-70.6c0-10.3 6.2-17.5 15.3-17.5 9.4 0 14.8 6.6 14.8 16.3v71.8h40.2v-75.8zm-105.2-45.5c-13.3 0-24.2 7.2-29.8 18.1V67.5H238v133.2h40.2v-70.6c0-10.3 6.2-17.5 15.3-17.5 9.4 0 14.8 6.6 14.8 16.3v71.8h40.2v-75.8c0-25.6-12.4-45.5-35-45.5zM52.3 67.5c-17.8 0-31.3 9.2-38.2 22.8l-.2-.1v-20.7H0v133.2h13.9V113.4c0-10.3 6.2-17.5 15.3-17.5 9.4 0 14.8 6.6 14.8 16.3v71.8h40.2v-75.8c0-25.6-12.4-45.5-35-45.5z"
                        fill="#635BFF"
                      />
                    </svg>
                  </div>
                  <div className="group flex h-8 cursor-pointer items-center justify-center rounded bg-white px-3 py-1 transition-all duration-300 hover:scale-110 hover:shadow-lg">
                    <span className="text-xs font-semibold text-gray-800 transition-colors duration-300 group-hover:text-orange-500">
                      Khalti
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-white transition-all duration-300 hover:scale-110 hover:bg-orange-600"
                  aria-label="Email"
                >
                  <FontAwesomeIcon
                    icon={faEnvelopeCircle}
                    className="h-4 w-4"
                  />
                </button>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-orange-500 text-white transition-all duration-300 hover:scale-110 hover:bg-orange-600 ${
                    showScrollTop ? "opacity-100" : "opacity-50"
                  }`}
                  aria-label="Scroll to top"
                >
                  <FontAwesomeIcon icon={faArrowUp} className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
