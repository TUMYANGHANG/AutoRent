import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import birtamodeImg from "../assets/birtamode.jpg";
import bmwImg from "../assets/bmw.jpg";
import car2Img from "../assets/car2.jpg";
import chitwanImg from "../assets/chitwan.jpg";
import dharanImg from "../assets/dharan-bazaar.jpg";
import jeepImg from "../assets/jeep.jpg";
import jeep2Img from "../assets/jeep2.jpg";
import kathmanduImg from "../assets/kathmandu-nepal.jpg";
import pagganiImg from "../assets/paggani.jpg";
import pokharaImg from "../assets/pokhara.jpg";
import carVideo from "../assets/pov-view-of-car-driving-moving-fast-on-road-SBV-346443951-preview.mp4";

const Home = () => {
  const features = [
    {
      title: "BEST PRICE GUARANTEE",
      description: "if you find a lower price, we'll refund the difference",
    },
    {
      title: "NO CANCELLATION FEES",
      description: "Up to 2 days before collecting your vehicle",
    },
    {
      title: "NO HIDDEN EXTRAS TO PAY",
      description: "Theft and damage cover included",
    },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-[#05070b]"
    >
      {/* Hero Video Background */}
      <div className="relative h-screen w-full">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full max-w-[85%]">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-contain"
            >
              <source src={carVideo} type="video/mp4" />
            </video>
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex flex-1 items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Left Side - Features */}
                <div className="flex flex-col justify-center gap-5 pt-20 lg:pt-0">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center pt-0.5">
                        <FontAwesomeIcon
                          icon={faStar}
                          className="h-4 w-4 text-white"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-0.5 text-lg font-bold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-white">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Side - Empty for video to show through */}
                <div className="hidden lg:block"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Your Dream Vehicle Banner */}
      <section className="bg-[#05070b] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-8 rounded-2xl bg-gray-900/50 p-8 md:p-12 lg:flex-row">
            {/* Left Side - Text Content */}
            <div className="flex-1">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Book your dream vehicle?
              </h2>
              <p className="text-lg text-gray-300">
                It's a never ending battle of making your vehicles better and
                also trying to be better yourself.
              </p>
            </div>

            {/* Right Side - CTA Button */}
            <div className="flex-shrink-0">
              <button className="cursor-pointer rounded-lg bg-orange-500 px-8 py-4 text-lg font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900">
                Book Your Vehicle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Satisfaction Section */}
      <section className="bg-[#05070b] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            {/* Left Side - Images Grid */}
            <div className="relative grid grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={car2Img}
                    alt="Vehicle rental"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="aspect-[4/3] overflow-hidden rounded-lg">
                  <img
                    src={jeepImg}
                    alt="Jeep rental"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="flex items-center pt-8">
                <div className="aspect-[3/4] overflow-hidden rounded-lg">
                  <img
                    src={jeep2Img}
                    alt="Vehicle rental"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Your satisfaction is our main{" "}
                <span className="text-orange-500">aim</span>
              </h2>
              <p className="text-lg text-gray-300">
                Self-driving vehicles are the natural extension of active safety
                and obviously something we should do. It's a never ending battle
                of making your vehicles better and also trying to be better
                yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enjoy Your Holidays Section */}
      <section className="bg-[#05070b] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">
                Enjoy your holidays
              </h2>
              <h3 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                Get <span className="text-orange-500">lowest</span> rental
                vehicle
              </h3>
              <p className="text-lg text-gray-300">
                Self-driving vehicles are the natural extension of active safety
                and obviously something we should do. It's a never ending battle
                of making your vehicles better and also trying to be better
                yourself.
              </p>
            </div>

            {/* Right Side - Images Side by Side */}
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:max-w-xl">
              <div className="aspect-[4/3] overflow-hidden rounded-lg">
                <img
                  src={bmwImg}
                  alt="BMW vehicle rental"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-lg">
                <img
                  src={pagganiImg}
                  alt="Pagani vehicle rental"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Cars by Locations Section */}
      <section className="bg-[#05070b] py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Find Vehicles <span className="text-orange-500"> by locations</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Pokhara Card */}
            <div className="group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="relative aspect-[3/5] overflow-hidden">
                <img
                  src={pokharaImg}
                  alt="Pokhara"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xl font-bold text-white">POKHARA</p>
                  <p className="text-sm text-white/90">Fewa Lake Area</p>
                </div>
              </div>
            </div>

            {/* Kathmandu Card */}
            <div className="group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="relative aspect-[3/5] overflow-hidden">
                <img
                  src={kathmanduImg}
                  alt="Kathmandu"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xl font-bold text-white">KATHMANDU</p>
                  <p className="text-sm text-white/90">Durbar Square</p>
                </div>
              </div>
            </div>

            {/* Chitwan Card */}
            <div className="group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="relative aspect-[3/5] overflow-hidden">
                <img
                  src={chitwanImg}
                  alt="Chitwan"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xl font-bold text-white">CHITWAN</p>
                  <p className="text-sm text-white/90">National Park</p>
                </div>
              </div>
            </div>

            {/* Dharan Card */}
            <div className="group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="relative aspect-[3/5] overflow-hidden">
                <img
                  src={dharanImg}
                  alt="Dharan"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xl font-bold text-white">DHARAN</p>
                  <p className="text-sm text-white/90">Bazaar Area</p>
                </div>
              </div>
            </div>

            {/* Birtamode Card */}
            <div className="group relative cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="relative aspect-[3/5] overflow-hidden">
                <img
                  src={birtamodeImg}
                  alt="Birtamode"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                {/* Text Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xl font-bold text-white">BIRTAMODE</p>
                  <p className="text-sm text-white/90">City Center</p>
                </div>
              </div>
            </div>
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
    </section>
  );
};

export default Home;
