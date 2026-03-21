import {
  faBars,
  faCar,
  faChartLine,
  faCog,
  faGauge,
  faRightFromBracket,
  faUser,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: faGauge },
  { key: "users", label: "User Management", icon: faUsers },
  { key: "vehicles", label: "Vehicle Management", icon: faCar },
  { key: "reports", label: "Reports", icon: faChartLine },
  { key: "settings", label: "Settings", icon: faCog },
  { key: "profile", label: "Profile", icon: faUser },
];

const SIDEBAR_WIDTH = 288;
const TRIGGER_WIDTH = 32;

const AdminSidebar = ({ activeKey = "dashboard", onSelect, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const listRef = useRef(null);
  const asideRef = useRef(null);
  const wrapperRef = useRef(null);

  const animateNavItems = () => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-nav-item]");
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, x: -16 },
      {
        opacity: 1,
        x: 0,
        duration: 0.28,
        stagger: 0.04,
        ease: "power2.out",
      },
    );
  };

  const handleDesktopEnter = () => {
    if (asideRef.current && wrapperRef.current) {
      gsap.to(asideRef.current, {
        x: 0,
        duration: 0.28,
        ease: "power2.out",
      });
      gsap.to(wrapperRef.current, {
        width: SIDEBAR_WIDTH,
        duration: 0.28,
        ease: "power2.out",
      });
      requestAnimationFrame(() => animateNavItems());
    }
  };

  const handleDesktopLeave = () => {
    if (asideRef.current && wrapperRef.current) {
      gsap.to(asideRef.current, {
        x: -SIDEBAR_WIDTH,
        duration: 0.22,
        ease: "power2.in",
      });
      gsap.to(wrapperRef.current, {
        width: TRIGGER_WIDTH,
        duration: 0.22,
        ease: "power2.in",
      });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024 && mobileOpen) {
      animateNavItems();
    }
  }, [mobileOpen]);

  const renderSidebarContent = (navRef = null) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#898989] px-5 py-4 lg:justify-end lg:border-b-0">
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-[#555555] transition hover:bg-[#898989] hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
        </button>
      </div>
      <nav ref={navRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {navItems.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              data-nav-item
              onClick={() => {
                onSelect?.(item.key);
                setMobileOpen(false);
              }}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left text-base font-medium transition ${
                isActive
                  ? "bg-[#FF4D4D]/10 text-[#FF4D4D] ring-1 ring-[#FF4D4D]/40"
                  : "text-[#555555] hover:bg-[#898989] hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="h-6 w-6 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
      {onLogout && (
        <div className="border-t border-[#898989] px-5 py-5">
          <button
            type="button"
            onClick={() => {
              onLogout();
              setMobileOpen(false);
            }}
            className="flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 text-left text-base font-medium text-[#FF4D4D] transition hover:bg-[#FF4D4D]/10 hover:text-[#FF4D4D]"
          >
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="h-6 w-6 shrink-0"
            />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyDesktopInitial = () => {
      if (window.innerWidth >= 1024 && asideRef.current && wrapperRef.current) {
        gsap.set(asideRef.current, { x: -SIDEBAR_WIDTH });
        gsap.set(wrapperRef.current, { width: TRIGGER_WIDTH });
      }
    };
    applyDesktopInitial();
    window.addEventListener("resize", applyDesktopInitial);
    return () => window.removeEventListener("resize", applyDesktopInitial);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-24 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-[#898989] bg-[#D9D9D9] text-[#555555] shadow-md transition hover:bg-[#898989] hover:text-white lg:hidden"
        aria-label="Open menu"
      >
        <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="w-0 shrink-0">
        <div
          ref={wrapperRef}
          className="fixed left-0 top-20 z-50 hidden h-[calc(100vh-5rem)] overflow-visible lg:block"
          style={{ width: TRIGGER_WIDTH }}
          onMouseEnter={handleDesktopEnter}
          onMouseLeave={handleDesktopLeave}
        >
          <aside
            ref={asideRef}
            className="absolute left-0 top-0 h-full w-72 border-r border-[#898989] bg-[#D9D9D9] shadow-lg"
          >
            {renderSidebarContent(listRef)}
          </aside>
        </div>

        <aside
          className={`fixed left-0 top-20 z-50 h-[calc(100vh-5rem)] w-72 border-r border-[#898989] bg-[#D9D9D9] shadow-lg transition-transform duration-300 lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {renderSidebarContent()}
        </aside>
      </div>
    </>
  );
};

export default AdminSidebar;
export { navItems as adminNavItems };
