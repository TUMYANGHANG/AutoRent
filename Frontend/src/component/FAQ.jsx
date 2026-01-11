import {
  faChevronDown,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    department: "Business Department",
    question: "",
  });

  const faqQuestions = [
    {
      question: "What types of vehicles do you rent?",
      answer:
        "We offer a wide variety of vehicles including economy cars, sedans, SUVs, luxury vehicles, trucks, and vans. Whether you need a compact car for city driving or a spacious SUV for a family trip, we have options to suit your needs. All our vehicles are well-maintained and regularly serviced to ensure your safety and comfort.",
    },
    {
      question: "What are your rental requirements?",
      answer:
        "To rent a vehicle, you must be at least 21 years old (25 for luxury vehicles), have a valid driver's license, and a credit card for the security deposit. International renters need a valid passport and an International Driving Permit. We also require proof of insurance or you can purchase our rental insurance coverage.",
    },
    {
      question: "How do I make a reservation?",
      answer:
        "You can make a reservation online through our website, by calling our customer service at +1 (800) 123 45 67, or by visiting one of our rental locations. Online reservations are available 24/7 and allow you to compare vehicles, prices, and rental periods. You'll receive instant confirmation via email.",
    },
    {
      question: "What is included in the rental price?",
      answer:
        "The base rental price includes the vehicle rental, unlimited mileage (for most vehicles), and basic insurance coverage. Additional services like GPS navigation, child seats, additional drivers, and premium insurance coverage can be added for an extra fee. Fuel is not included - you return the vehicle with the same fuel level or pay for the difference.",
    },
    {
      question: "Can I cancel or modify my reservation?",
      answer:
        "Yes, you can cancel or modify your reservation up to 24 hours before your scheduled pickup time at no charge. Cancellations made less than 24 hours in advance may incur a fee. You can manage your reservation online through your account or by contacting our customer service team.",
    },
    {
      question: "What happens if I return the vehicle late?",
      answer:
        "If you return the vehicle late, you'll be charged for the additional rental period at the daily rate. We offer a grace period of 29 minutes, after which hourly charges apply. To avoid late fees, please contact us if you need to extend your rental period, and we'll do our best to accommodate your request.",
    },
    {
      question: "Do you offer roadside assistance?",
      answer:
        "Yes, all our rentals include 24/7 roadside assistance. If you experience a breakdown, flat tire, lockout, or need fuel delivery, simply call our emergency hotline and we'll dispatch assistance to your location. This service is included in your rental at no additional cost.",
    },
    {
      question: "What is your fuel policy?",
      answer:
        "Our fuel policy is 'full-to-full' - you receive the vehicle with a full tank and should return it with a full tank. If you return it with less fuel, we'll charge you for the difference at a premium rate. Alternatively, you can prepay for a full tank at a discounted rate and return it empty if you prefer.",
    },
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
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
    console.log("FAQ Form submitted:", formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      department: "Business Department",
      question: "",
    });
    alert("Your question has been submitted! We'll get back to you soon.");
  };

  return (
    <section
      id="faq"
      className="relative min-h-screen bg-[#05070b] py-12 text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <a
            href="#home"
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-orange-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            FAQ
          </a>
        </div>

        <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Side - FAQ Content */}
          <div className="lg:col-span-2 lg:pr-8">
            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
              Common <span className="text-orange-500">Questions</span>
            </h1>

            {/* Introduction */}
            <p className="mb-8 text-lg text-gray-300">
              Please read questions below and if you can not find your answer
              please send us your question, we will answer you as soon as
              possible.
            </p>

            {/* FAQ Section Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-900">
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className="h-6 w-6 text-amber-600"
                />
              </div>
              <h2 className="text-2xl font-bold">? F.A.Qs</h2>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-4">
              {faqQuestions.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleQuestion(index)}
                    className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-800/50"
                  >
                    <span className="pr-4 font-semibold text-white">
                      {faq.question}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="border-t border-gray-800 p-4">
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="relative lg:absolute lg:right-0 lg:top-0 lg:w-[420px]">
            {/* Large Graphic */}
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500">
                <svg
                  className="h-12 w-12 text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
              <div className="relative">
                <div className="rounded-lg bg-orange-500 px-6 py-4">
                  <h3 className="text-2xl font-bold text-black">
                    AUTO RENT FAQ
                  </h3>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="faq-name"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Your Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="faq-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="faq-email"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Your Email <span className="text-orange-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="faq-email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="faq-subject"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="faq-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter subject"
                  />
                </div>
                <div>
                  <label
                    htmlFor="faq-department"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Department
                  </label>
                  <select
                    id="faq-department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="Business Department">
                      Business Department
                    </option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing Department">
                      Billing Department
                    </option>
                    <option value="Sales Department">Sales Department</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="faq-question"
                    className="mb-1 block text-sm font-medium text-gray-300"
                  >
                    Your Question
                  </label>
                  <textarea
                    id="faq-question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    placeholder="Enter your question"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  Ask
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

export default FAQ;
