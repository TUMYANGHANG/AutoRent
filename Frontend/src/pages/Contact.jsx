import {
  faEnvelope,
  faMapMarkerAlt,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import contactImage from "../assets/wmremove-transformed.jpeg";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    question: "",
  });

  const handleChange = (e) => {
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
  };

  return (
    <section className="min-h-screen bg-[#05070b] py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Main Content Section - 3 columns: Image | Contact Info | Form */}
        <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column - Image (takes 4 columns) */}
          <div className="lg:col-span-4">
            <img
              src={contactImage}
              alt="Customer Service Representative"
              className="h-full w-full object-contain rounded-lg"
            />
          </div>

          {/* Right Side - Contact Info and Form (takes 8 columns, split 50/50) */}
          <div className="lg:col-span-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left Sub-column - Contact Information List */}
            <div className="space-y-5 pt-20">
              {/* Address 1 */}
              <div className="group flex cursor-pointer items-start gap-4 transition-all duration-200 hover:translate-x-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/20 transition group-hover:bg-orange-500/40">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="h-7 w-7 text-orange-500 transition-colors group-hover:text-orange-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-400 mb-1.5 transition-colors group-hover:text-white">
                    Address
                  </p>
                  <p className="text-lg text-white transition-colors group-hover:text-orange-400">
                    #025, Dulhari, Itahari
                  </p>
                </div>
              </div>

              {/* Address 2 */}
              <div className="group flex cursor-pointer items-start gap-4 transition-all duration-200 hover:translate-x-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/20 transition group-hover:bg-orange-500/40">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="h-7 w-7 text-orange-500 transition-colors group-hover:text-orange-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-400 mb-1.5 transition-colors group-hover:text-white">
                    Address 2
                  </p>
                  <p className="text-lg text-white transition-colors group-hover:text-orange-400">
                    #023, Damk, Jhapa
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="group flex cursor-pointer items-start gap-4 transition-all duration-200 hover:translate-x-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/20 transition group-hover:bg-orange-500/40">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="h-7 w-7 text-orange-500 transition-colors group-hover:text-orange-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-400 mb-1.5 transition-colors group-hover:text-white">
                    Phone
                  </p>
                  <p className="text-lg text-white transition-colors group-hover:text-orange-400">
                    +977 9815045184
                  </p>
                </div>
              </div>

              {/* Social media */}
              <div className="group flex cursor-pointer items-start gap-4 transition-all duration-200 hover:translate-x-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/20 transition group-hover:bg-orange-500/40">
                  <svg
                    className="h-7 w-7 text-orange-500 transition-colors group-hover:text-orange-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-400 mb-1.5 transition-colors group-hover:text-white">
                    Social media
                  </p>
                  <p className="text-lg text-white transition-colors group-hover:text-orange-400">
                    @autorent
                  </p>
                </div>
              </div>

              {/* Facebook */}
              <div className="group flex cursor-pointer items-start gap-4 transition-all duration-200 hover:translate-x-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/20 transition group-hover:bg-orange-500/40">
                  <svg
                    className="h-7 w-7 text-orange-500 transition-colors group-hover:text-orange-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-400 mb-1.5 transition-colors group-hover:text-white">
                    Facebook
                  </p>
                  <p className="text-lg text-white transition-colors group-hover:text-orange-400">
                    @autorent
                  </p>
                </div>
              </div>

              {/* Support Email */}
              <div className="group flex cursor-pointer items-start gap-4 transition-all duration-200 hover:translate-x-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-500/20 transition group-hover:bg-orange-500/40">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-7 w-7 text-orange-500 transition-colors group-hover:text-orange-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-gray-400 mb-1.5 transition-colors group-hover:text-white">
                    Support
                  </p>
                  <p className="text-lg text-white transition-colors group-hover:text-orange-400">
                    support@autorent.com
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sub-column - Contact Form */}
            <div className="space-y-4">
              <h2 className="mb-6 text-3xl font-bold text-white">
                Contact <span className="text-orange-500">Us</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Your Name <span className="text-orange-500">(*)</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Your Email <span className="text-orange-500">(*)</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Department Field */}
                <div>
                  <label
                    htmlFor="department"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="" className="bg-gray-800">
                      Business Department
                    </option>
                    <option value="sales" className="bg-gray-800">
                      Sales
                    </option>
                    <option value="support" className="bg-gray-800">
                      Support
                    </option>
                    <option value="technical" className="bg-gray-800">
                      Technical
                    </option>
                  </select>
                </div>

                {/* Question Field */}
                <div>
                  <label
                    htmlFor="question"
                    className="mb-1.5 block text-sm font-medium text-white"
                  >
                    Your Question
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleChange}
                    rows={4}
                    className="w-full resize-none rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter your question"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-orange-500 px-6 py-3 text-base font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="border-t border-white/10 pt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Pre-sale Questions */}
            <div className="group cursor-pointer text-center transition-all duration-300 hover:scale-105 md:text-left">
              <h3 className="mb-3 text-xl font-bold text-orange-500 transition-colors duration-300 group-hover:text-orange-400">
                Pre-sale Questions
              </h3>
              <p className="text-white transition-colors duration-300 group-hover:text-orange-400">
                help@autorent.com
              </p>
            </div>

            {/* Call Us */}
            <div className="group cursor-pointer border-l border-white/10 pl-8 text-center transition-all duration-300 hover:scale-105 md:text-left">
              <h3 className="mb-3 text-xl font-bold text-orange-500 transition-colors duration-300 group-hover:text-orange-400">
                Call Us
              </h3>
              <p className="text-white transition-colors duration-300 group-hover:text-orange-400">
                +977 9815045184
              </p>
            </div>

            {/* Our Location */}
            <div className="group cursor-pointer border-l border-white/10 pl-8 text-center transition-all duration-300 hover:scale-105 md:text-left">
              <h3 className="mb-3 text-xl font-bold text-orange-500 transition-colors duration-300 group-hover:text-orange-400">
                Our Location
              </h3>
              <p className="text-white transition-colors duration-300 group-hover:text-orange-400">
                #025, Dulhari, Itahari
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
