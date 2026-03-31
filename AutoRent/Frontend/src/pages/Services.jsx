import {
  faCar,
  faCheckCircle,
  faChevronDown,
  faComments,
  faCreditCard,
  faMapMarkerAlt,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import bikeImg from "../assets/bike.jpg";
import chatAppImg from "../assets/build-a-realtime-chat-app-from-scratch--1-.png";
import car2Img from "../assets/car2.jpg";
import garageLocationImg from "../assets/garage location.jpg";
import hourlyRentalImg from "../assets/hourly-rental-or-daily-rental-1024x683.png";
import jeepImg from "../assets/jeep.jpg";
import jeep2Img from "../assets/jeep2.jpg";
import locationsImg from "../assets/locations-1024x576.png";
import nearbyLocationImg from "../assets/nearby-destinations-icon-design-free-vector.jpg";
import onlinePayImg from "../assets/online pay.jpg";

const Services = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const services = [
    {
      icon: faCar,
      title: "Daily Rentals",
      description:
        "Perfect for short trips and daily commutes. Choose from our wide selection of economy, luxury, and premium vehicles for your day-to-day needs.",
    },
    {
      icon: faMapMarkerAlt,
      title: "Suggest Near Location",
      description:
        "Find and book vehicles from nearby locations. Our system suggests the nearest available vehicles based on your location, making it convenient to pick up your rental.",
    },
    {
      icon: faCreditCard,
      title: "Online Payment",
      description:
        "Secure online payment processing with instant transaction confirmation. Pay easily and receive digital receipts for all your rental transactions.",
    },
  ];

  const features = [
    { text: "Free test drives", column: 1 },
    { text: "Custom vehicle selection", column: 1 },
    { text: "Electric vehicles available", column: 1 },
    { text: "Expert maintenance", column: 2 },
    { text: "Premium upgrades", column: 2 },
    { text: "Free delivery service", column: 2 },
  ];

  const serviceFaqs = [
    {
      question: "What services do you offer for vehicle rentals?",
      answer:
        "We offer a comprehensive range of services including daily rentals, weekly rentals, monthly rentals, insurance and protection plans, 24/7 roadside assistance, vehicle maintenance, GPS navigation systems, child seats, and additional driver options. All our vehicles are regularly serviced and maintained to ensure your safety and comfort.",
    },
    {
      question: "Do you provide insurance coverage for rentals?",
      answer:
        "Yes, we offer multiple insurance coverage options including basic liability insurance, collision damage waiver (CDW), theft protection, and comprehensive coverage. You can choose the level of protection that best suits your needs. Our insurance plans are designed to give you peace of mind during your rental period.",
    },
    {
      question: "How long does it take to process a rental service?",
      answer:
        "Our rental process is quick and efficient. For online reservations, you can complete the booking in just a few minutes. At our rental location, the pickup process typically takes 15-20 minutes after you've completed the necessary paperwork and vehicle inspection. We strive to make the process as smooth as possible.",
    },
    {
      question: "Can I book a service appointment online?",
      answer:
        "Absolutely! You can book your rental service online 24/7 through our website. Simply select your preferred vehicle, dates, and location, and you'll receive instant confirmation. You can also modify or cancel your reservation online up to 24 hours before your scheduled pickup time.",
    },
    {
      question: "What types of vehicles are available for rental?",
      answer:
        "We have a diverse fleet including economy cars, sedans, SUVs, luxury vehicles, trucks, vans, and electric vehicles. Whether you need a compact car for city driving, a spacious SUV for family trips, or a luxury vehicle for special occasions, we have options to suit every need and budget.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      {/* Our Popular Car Rental Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
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
              Services
            </a>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            Our Popular{" "}
            <span className="text-orange-500"> Rental Services</span>
          </h1>

          {/* Subtitle */}
          <p className="mb-12 text-lg text-gray-300">
            At AutoRent, we take pride in delivering top notch services to keep
            your journey smooth and comfortable.
          </p>

          {/* Service Cards */}
          <div className="mb-0 grid grid-cols-1 gap-4 md:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className={`rounded-2xl border border-gray-800 bg-gray-900/50 transition hover:border-orange-500/50 hover:bg-gray-900 ${
                  service.title === "Daily Rentals" ||
                  service.title === "Suggest Near Location" ||
                  service.title === "Online Payment"
                    ? "p-5 md:p-6"
                    : "rounded-xl p-6"
                }`}
              >
                <div
                  className={`flex items-center justify-center rounded-full bg-orange-500 ${
                    service.title === "Daily Rentals" ||
                    service.title === "Suggest Near Location" ||
                    service.title === "Online Payment"
                      ? "mb-3 h-10 w-10"
                      : "mb-4 h-16 w-16"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={service.icon}
                    className={`text-black ${
                      service.title === "Daily Rentals" ||
                      service.title === "Suggest Near Location" ||
                      service.title === "Online Payment"
                        ? "h-5 w-5"
                        : "h-8 w-8"
                    }`}
                  />
                </div>
                <h3
                  className={`font-bold text-white ${
                    service.title === "Daily Rentals" ||
                    service.title === "Suggest Near Location" ||
                    service.title === "Online Payment"
                      ? "mb-2 text-xl md:text-2xl"
                      : "mb-3 text-xl"
                  }`}
                >
                  {service.title === "Daily Rentals" ? (
                    <>
                      Daily <span className="text-orange-500">Rentals</span>
                    </>
                  ) : service.title === "Suggest Near Location" ? (
                    <>
                      Suggest Near{" "}
                      <span className="text-orange-500">Location</span>
                    </>
                  ) : service.title === "Online Payment" ? (
                    <>
                      Online <span className="text-orange-500">Payment</span>
                    </>
                  ) : (
                    service.title
                  )}
                </h3>
                {service.title === "Daily Rentals" ? (
                  <>
                    <p className="mb-3 text-sm text-gray-300">
                      {service.description}
                    </p>
                    <div className="mb-3 h-40 overflow-hidden rounded-lg">
                      <img
                        src={hourlyRentalImg}
                        alt="Hourly rental or daily rental options"
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Flexible hourly and daily rental options
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Wide selection of economy, luxury, and premium
                          vehicles
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Perfect for short trips and daily commutes
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Easy booking and instant confirmation
                        </span>
                      </div>
                    </div>
                  </>
                ) : service.title === "Suggest Near Location" ? (
                  <>
                    <p className="mb-3 text-sm text-gray-300">
                      {service.description}
                    </p>
                    <div className="mb-3 h-40 overflow-hidden rounded-lg">
                      <img
                        src={nearbyLocationImg}
                        alt="Suggest nearby vehicle locations"
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Find nearest available vehicles from your location
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Book vehicles from nearby rental locations
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Real-time location-based suggestions
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Easy pickup from closest available location
                        </span>
                      </div>
                    </div>
                  </>
                ) : service.title === "Online Payment" ? (
                  <>
                    <p className="mb-3 text-sm text-gray-300">
                      {service.description}
                    </p>
                    <div className="mb-3 h-40 overflow-hidden rounded-lg">
                      <img
                        src={onlinePayImg}
                        alt="Online payment and transaction"
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Secure online payment processing
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Instant transaction confirmation
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Digital receipt generation and delivery
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                        />
                        <span className="text-sm text-gray-300">
                          Multiple payment methods supported
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-300">{service.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Garage Location Features Section */}
      <section className="pt-5 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Location Features */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 md:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="h-5 w-5 text-black"
                />
              </div>
              <h2 className="mb-2 text-xl font-bold md:text-2xl">
                Multiple{" "}
                <span className="text-orange-500">Pickup Locations</span>
              </h2>
              <p className="mb-3 text-sm text-gray-300">
                Find us at convenient locations throughout the city. With
                multiple pickup and drop-off points, we make it easy for you to
                access our rental services wherever you are.
              </p>
              <div className="mb-3 h-40 overflow-hidden rounded-lg">
                <img
                  src={locationsImg}
                  alt="Multiple rental locations map"
                  className="h-full w-full object-cover transition hover:scale-105"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Strategic locations across the city for easy access
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Real-time location tracking and availability
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Flexible pickup and drop-off at any location
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Nearby parking and public transport access
                  </span>
                </div>
              </div>
            </div>

            {/* Garage Location Features */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 md:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                <FontAwesomeIcon
                  icon={faWrench}
                  className="h-5 w-5 text-black"
                />
              </div>
              <h2 className="mb-2 text-xl font-bold md:text-2xl">
                Expert <span className="text-orange-500">Service Garages</span>
              </h2>
              <p className="mb-3 text-sm text-gray-300">
                Our state-of-the-art service garages are located on main street
                locations throughout the city, making them easily accessible for
                all your vehicle maintenance needs.
              </p>
              <div className="mb-3 h-40 overflow-hidden rounded-lg">
                <img
                  src={garageLocationImg}
                  alt="Service garage with advanced diagnostics"
                  className="h-full w-full object-cover transition hover:scale-105"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Main street locations for easy access
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Advanced diagnostic equipment and technology
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Certified mechanics and expert technicians
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    24/7 roadside assistance and emergency support
                  </span>
                </div>
              </div>
            </div>

            {/* Real-time Chat Features */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 md:p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
                <FontAwesomeIcon
                  icon={faComments}
                  className="h-5 w-5 text-black"
                />
              </div>
              <h2 className="mb-2 text-xl font-bold md:text-2xl">
                Real-time <span className="text-orange-500">Chat Support</span>
              </h2>
              <p className="mb-3 text-sm text-gray-300">
                Instant communication between renters and owners. Get quick
                responses, ask questions, and resolve issues in real-time
                through our integrated chat system.
              </p>
              <div className="mb-3 h-40 overflow-hidden rounded-lg">
                <img
                  src={chatAppImg}
                  alt="Real-time chat between renter and owner"
                  className="h-full w-full object-cover transition hover:scale-105"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Instant messaging between renter and owner
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Real-time notifications and message delivery
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Quick response time for booking inquiries
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"
                  />
                  <span className="text-sm text-gray-300">
                    Secure and private communication channel
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Drive. Explore. Connect. Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 md:p-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
              {/* Left Side - Content */}
              <div>
                <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                  Drive. Explore.{" "}
                  <span className="text-orange-500">Connect.</span>
                </h2>
                <p className="mb-8 text-lg text-gray-300">
                  At AutoRent, we take pride in delivering top notch services to
                  keep your journey smooth and comfortable.
                </p>

                {/* Features List - Two Columns */}
                <div className="mb-8 grid grid-cols-2 gap-x-6 gap-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="h-5 w-5 shrink-0 text-orange-500"
                      />
                      <span className="text-gray-300">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                  See full details
                </button>

                <p className="text-sm text-gray-400">
                  Vehicles have different colors and models.
                </p>
              </div>

              {/* Right Side - Image Grid (4 images in 2 rows, 2 columns) */}
              <div className="grid grid-cols-2 gap-3">
                {/* Top Row */}
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={bikeImg}
                    alt="Vehicle rental"
                    className="h-full w-full object-cover object-center transition hover:scale-105"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={jeepImg}
                    alt="Jeep rental"
                    className="h-full w-full object-cover object-center transition hover:scale-105"
                  />
                </div>
                {/* Bottom Row */}
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={car2Img}
                    alt="Car rental"
                    className="h-full w-full object-cover object-center transition hover:scale-105"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={jeep2Img}
                    alt="Jeep rental"
                    className="h-full w-full object-cover object-center transition hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pre Services Common Questions Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            Pre Services{" "}
            <span className="text-orange-500">Common Questions</span>
          </h2>
          <p className="mb-12 text-lg text-gray-300">
            At AutoRent, we take pride in delivering top notch services to keep
            your journey smooth and comfortable.
          </p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Side - Image */}
            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={bikeImg}
                  alt="Vehicle rental service"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Right Side - FAQ Accordion */}
            <div className="space-y-4">
              {serviceFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-800/50"
                  >
                    <span className="pr-4 font-semibold text-white">
                      {faq.question}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                        openFaqIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="border-t border-gray-800 p-4">
                      <p className="text-gray-300">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-orange-500 p-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-black md:text-5xl">
              It's a great day for a ride.
            </h2>
            <p className="mb-8 text-lg text-black/80">
              A vehicle rental service that provides you with the freedom to
              explore, travel, and experience the journey on your own terms.
            </p>
            <button className="cursor-pointer rounded-lg bg-black px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-orange-500">
              Explore Products
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
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
    </div>
  );
};

export default Services;
