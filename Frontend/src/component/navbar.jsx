import {
  faChevronDown,
  faGauge,
  faHeart,
  faLifeRing,
  faRightFromBracket,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const PlaceholderLogo = () => {
  // Inline SVG placeholder so we don't depend on any asset files yet
  const dataUrl = useMemo(() => {
    const svg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
        <rect width="120" height="80" rx="18" fill="#0b0f14"/>
        <path d="M27 48c0-9 7-16 16-16h2c9 0 16 7 16 16" fill="none" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>
        <path d="M30 48h29" fill="none" stroke="#f97316" stroke-width="6" stroke-linecap="round"/>
        <circle cx="33" cy="52" r="5.5" fill="#f97316"/>
        <circle cx="55" cy="52" r="5.5" fill="#f97316"/>
      </svg>`
    );
    return `data:image/svg+xml,${svg}`;
  }, []);

  return (
    <img
      src={dataUrl}
      alt="AutoRent logo"
      className="h-11 w-11 rounded-2xl"
      loading="eager"
      decoding="async"
    />
  );
};

const desktopLinks = [
  { label: "Home", href: "/", type: "link" },
  { label: "Services", href: "/services", type: "link" },
  { label: "Shop", href: "#shop", type: "link" },
  { label: "FAQ", href: "/faq", type: "link" },
  { label: "Contact", href: "/contact", type: "link" },
];

const Navbar = ({ isAuthenticated, onOpenLogin, onOpenSignUp, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState("Home");

  useEffect(() => {
    if (location.pathname === "/") {
      setActive("Home");
    } else if (location.pathname === "/services") {
      setActive("Services");
    } else if (location.pathname === "/faq") {
      setActive("FAQ");
    } else if (location.pathname === "/contact") {
      setActive("Contact");
    }
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="w-full bg-gradient-to-b from-black/80 to-black/55 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Brand */}
            <Link
              to="/"
              onClick={() => setActive("Home")}
              className="group flex shrink-0 cursor-pointer items-center gap-3 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                <PlaceholderLogo />
              </div>
              <div className="leading-none">
                <div className="text-xs font-semibold tracking-[0.25em] text-orange-400 transition-colors duration-300 group-hover:text-orange-300">
                  AUTO
                </div>
                <div className="text-2xl font-extrabold tracking-tight text-orange-400 transition-colors duration-300 group-hover:text-orange-300">
                  RENT
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="absolute left-[48%] hidden -translate-x-1/2 items-center justify-center md:flex">
              <div className="flex items-center gap-2 lg:gap-4">
                {desktopLinks.map((l) => {
                  if (l.type === "dropdown") {
                    const isActive = active === l.label;
                    return (
                      <div key={l.label} className="relative group">
                        <a
                          href={l.href}
                          onClick={() => setActive(l.label)}
                          className={[
                            "relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
                            isActive
                              ? "text-white"
                              : "text-white/60 hover:text-white",
                          ].join(" ")}
                          aria-haspopup="menu"
                        >
                          <span>{l.label}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className="h-4 w-4 text-white/60 group-hover:text-white"
                          />
                          {isActive ? (
                            <span className="pointer-events-none absolute left-1/2 top-full mt-1 h-0 w-0 -translate-x-1/2 border-x-[7px] border-x-transparent border-t-[7px] border-t-orange-400" />
                          ) : null}
                        </a>

                        {/* Dropdown panel */}
                        <div className="invisible absolute left-0 top-full mt-3 w-56 translate-y-1 rounded-2xl border border-white/10 bg-black/85 p-2 opacity-0 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                          {l.items.map((it) => (
                            <a
                              key={it.label}
                              href={it.href}
                              onClick={() => setActive(l.label)}
                              className="block rounded-xl px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
                            >
                              {it.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const isActive =
                    active === l.label || location.pathname === l.href;
                  return (
                    <Link
                      key={l.label}
                      to={l.href}
                      onClick={() => setActive(l.label)}
                      className={[
                        "group relative cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105",
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white",
                      ].join(" ")}
                    >
                      <span className="relative z-10">{l.label}</span>
                      {isActive ? (
                        <span className="pointer-events-none absolute left-1/2 top-full mt-1 h-0 w-0 -translate-x-1/2 border-x-[7px] border-x-transparent border-t-[7px] border-t-orange-400 transition-all duration-300" />
                      ) : (
                        <span className="pointer-events-none absolute left-1/2 top-full mt-1 h-0 w-0 -translate-x-1/2 border-x-[7px] border-x-transparent border-t-[7px] border-t-orange-400 opacity-0 transition-all duration-300 group-hover:opacity-100" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right actions */}
            <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-8 lg:ml-12">
              <Link
                to="/contact"
                className="group hidden cursor-pointer items-center gap-2 rounded-full bg-orange-500 px-5 py-3 text-sm font-extrabold text-black shadow-[0_18px_45px_rgba(249,115,22,0.35)] transition-all duration-300 hover:scale-110 hover:bg-orange-400 hover:shadow-[0_18px_45px_rgba(249,115,22,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:inline-flex"
              >
                <FontAwesomeIcon
                  icon={faLifeRing}
                  className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                />
                Help &amp; Support
              </Link>

              <button
                type="button"
                className="group relative hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/80 ring-1 ring-white/10 transition-all duration-300 hover:scale-110 hover:bg-white/10 hover:text-white hover:ring-white/20 md:inline-flex"
                aria-label="Wishlist"
              >
                <FontAwesomeIcon
                  icon={faHeart}
                  className="h-5 w-5 transition-all duration-300 group-hover:scale-125 group-hover:text-red-400"
                />
              </button>

              {isAuthenticated ? (
                <div
                  className="group relative hidden md:block"
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/80 ring-1 ring-white/10 transition-all duration-300 hover:scale-110 hover:bg-white/10 hover:text-white hover:ring-white/20"
                    aria-label="Profile"
                  >
                    <FontAwesomeIcon
                      icon={faUserCircle}
                      className="h-6 w-6 transition-all duration-300 group-hover:scale-125"
                    />
                  </button>

                  {/* Profile Dropdown */}
                  <div
                    className={`absolute right-0 top-full mt-1 w-48 rounded-2xl border border-white/10 bg-black/85 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition z-50 ${
                      profileDropdownOpen
                        ? "visible translate-y-0 opacity-100"
                        : "invisible translate-y-1 opacity-0"
                    }`}
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
                    >
                      <FontAwesomeIcon icon={faGauge} className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/5 hover:text-white"
                    >
                      <FontAwesomeIcon
                        icon={faRightFromBracket}
                        className="h-4 w-4"
                      />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="hidden cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white/75 transition-all duration-300 hover:scale-105 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:inline-block"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={onOpenSignUp}
                    className="hidden cursor-pointer rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black shadow-sm transition-all duration-300 hover:scale-105 hover:bg-orange-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:inline-block"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {/* Mobile toggle */}
              <button
                type="button"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl p-2 text-white/80 transition-all duration-300 hover:scale-110 hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen ? (
        <div className="border-t border-white/10 bg-black/85 backdrop-blur-xl md:hidden transition-all duration-300">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="grid gap-1">
              {desktopLinks.map((l, index) =>
                l.type === "dropdown" ? (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => {
                      setActive(l.label);
                      setMobileOpen(false);
                    }}
                    className="group cursor-pointer rounded-xl px-3 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:translate-x-2 hover:bg-white/5 hover:text-white"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {l.label}
                  </a>
                ) : (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => {
                      setActive(l.label);
                      setMobileOpen(false);
                    }}
                    className="group cursor-pointer rounded-xl px-3 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:translate-x-2 hover:bg-white/5 hover:text-white"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {l.label}
                  </Link>
                )
              )}
              <div className="mt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
                    >
                      <FontAwesomeIcon icon={faGauge} className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition-all duration-300 hover:scale-105 hover:bg-red-500/20 hover:text-red-300"
                    >
                      <FontAwesomeIcon
                        icon={faRightFromBracket}
                        className="h-5 w-5"
                      />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenLogin();
                      }}
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onOpenSignUp();
                      }}
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-orange-400"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Navbar;
