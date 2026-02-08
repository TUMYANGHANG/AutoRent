import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { garagesAPI } from "../utils/api.js";

const INITIAL_VIEW_STATE = {
  longitude: 84.0, // Approx center of Nepal
  latitude: 28.0,
  zoom: 10,
};

const GaragesMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [garages, setGarages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCrowdLocateForm, setShowCrowdLocateForm] = useState(false);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    district: "",
    province: "",
    phone: "",
    type: "",
  });

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    // Request user's geolocation and center map on it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
          
          // Center and zoom map on user's location
          map.setCenter([longitude, latitude]);
          map.setZoom(10);
          
          // Add a marker for user's location
          const userMarker = new maplibregl.Marker({ color: "#3b82f6" })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setHTML("<div style='font-weight: 600;'>📍 Your Location</div>"))
            .addTo(map);
          
          map.__userLocationMarker = userMarker;
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          // Continue with default location if geolocation fails
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }

    const fetchForBounds = async () => {
      if (!mapRef.current) return;
      const bounds = mapRef.current.getBounds();
      const west = bounds.getWest();
      const south = bounds.getSouth();
      const east = bounds.getEast();
      const north = bounds.getNorth();
      const bbox = `${west},${south},${east},${north}`;

      try {
        setIsLoading(true);
        setError("");
        const res = await garagesAPI.getForMap(bbox);
        setGarages(res?.data ?? res ?? []);
      } catch (err) {
        console.error("Failed to load garages for map:", err);
        setError(err.message || "Failed to load garages.");
      } finally {
        setIsLoading(false);
      }
    };

    // Load initially and then on moveend
    map.on("load", fetchForBounds);
    map.on("moveend", fetchForBounds);

    // Click handler will be added/removed based on showCrowdLocateForm state
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle map clicks only when crowd locate form is open
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (e) => {
      if (showCrowdLocateForm) {
        const { lng, lat } = e.lngLat;
        setPendingLocation({ longitude: lng, latitude: lat });
      }
    };

    mapRef.current.on("click", handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.off("click", handleMapClick);
      }
    };
  }, [showCrowdLocateForm]);

  // Render garages as markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers and their popups
    if (mapRef.current.__garageMarkers) {
      mapRef.current.__garageMarkers.forEach((m) => {
        // Remove hover popup if it exists
        if (m._hoverPopup && m._hoverPopup.isOpen()) {
          m._hoverPopup.remove();
        }
        m.remove();
      });
    }

    const markers = (garages || []).map((garage) => {
      const el = document.createElement("div");
      el.className =
        "rounded-full bg-orange-500 border-2 border-white w-3 h-3 shadow-[0_0_0_4px_rgba(0,0,0,0.35)] cursor-pointer hover:scale-125 transition-transform";

      const lat = Number(garage.latitude);
      const lng = Number(garage.longitude);
      
      // Google Maps URL for redirecting on click
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      // Create hover tooltip content
      const tooltipContent = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; min-width: 180px; max-width: 250px;">
          <div style="font-weight: 600; margin-bottom: 4px; color: #fff; font-size: 13px;">${garage.name ?? "Garage"}</div>
          ${
            garage.address || garage.city
              ? `<div style="color:#d1d5db; margin-bottom: 3px; font-size: 11px; line-height: 1.3;">
                  ${[garage.address, garage.city, garage.district, garage.province]
                    .filter(Boolean)
                    .join(", ")}
                </div>`
              : ""
          }
          ${
            garage.phone
              ? `<div style="color:#9ca3af; font-size: 11px; margin-bottom: 2px;">📞 ${garage.phone}</div>`
              : ""
          }
          ${
            garage.openingHours
              ? `<div style="color:#9ca3af; font-size: 10px; margin-top: 4px;">🕐 ${garage.openingHours}</div>`
              : ""
          }
        </div>
      `;

      // Create hover tooltip popup
      const hoverPopup = new maplibregl.Popup({
        offset: 12,
        maxWidth: "250px",
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        className: "garage-hover-popup",
      }).setHTML(tooltipContent);

      const marker = new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(mapRef.current);

      // Store popup reference on marker for cleanup
      marker._hoverPopup = hoverPopup;

      // Add hover events
      el.addEventListener("mouseenter", () => {
        if (!hoverPopup.isOpen()) {
          hoverPopup.setLngLat([lng, lat]).addTo(mapRef.current);
        }
      });

      el.addEventListener("mouseleave", () => {
        if (hoverPopup.isOpen()) {
          hoverPopup.remove();
        }
      });

      // Add click event to redirect to Google Maps
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        // Close hover popup if open
        if (hoverPopup.isOpen()) {
          hoverPopup.remove();
        }
        // Redirect to Google Maps
        window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
      });

      return marker;
    });

    mapRef.current.__garageMarkers = markers;
  }, [garages]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitGarage = async (e) => {
    e.preventDefault();
    if (!pendingLocation) return;

    if (!formData.name.trim()) {
      setError("Garage name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        ...formData,
        latitude: pendingLocation.latitude,
        longitude: pendingLocation.longitude,
      };

      const res = await garagesAPI.create(payload);
      const created = res?.data ?? res;

      // Optimistically add to map
      setGarages((prev) => [...(prev || []), created]);
      setPendingLocation(null);
      setFormData({
        name: "",
        address: "",
        city: "",
        district: "",
        province: "",
        phone: "",
        type: "",
      });
      // Optionally close the form after successful submission
      setShowCrowdLocateForm(false);
    } catch (err) {
      console.error("Failed to create garage:", err);
      setError(err.message || "Failed to add garage. Make sure you are logged in as a renter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocateMe = () => {
    if (!mapRef.current) return;

    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation({ longitude, latitude });
          
          // Remove existing user location marker if any
          if (mapRef.current.__userLocationMarker) {
            mapRef.current.__userLocationMarker.remove();
          }
          
          // Center and zoom map on user's location
          mapRef.current.setCenter([longitude, latitude]);
          mapRef.current.setZoom(10);
          
          // Add a marker for user's location
          const userMarker = new maplibregl.Marker({ color: "#3b82f6" })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setHTML("<div style='font-weight: 600;'>📍 Your Location</div>"))
            .addTo(mapRef.current);
          
          mapRef.current.__userLocationMarker = userMarker;
          
          setIsLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to get your location. Please check your browser permissions.");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">
              Nepal <span className="text-orange-500">Garage Map</span>
            </h1>
            <p className="mt-1 text-sm text-gray-300 md:text-base">
              Map placeholder - Garage locations will be displayed here once backend is connected.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={isLoading}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-all duration-300 hover:scale-105 hover:bg-blue-500/20 hover:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#05070b] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span>📍</span>
              {isLoading ? "Locating..." : "Locate Me"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCrowdLocateForm(!showCrowdLocateForm);
                if (showCrowdLocateForm) {
                  // Reset form when closing
                  setPendingLocation(null);
                  setFormData({
                    name: "",
                    address: "",
                    city: "",
                    district: "",
                    province: "",
                    phone: "",
                    type: "",
                  });
                }
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400 transition-all duration-300 hover:scale-105 hover:bg-orange-500/20 hover:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#05070b]"
            >
              {showCrowdLocateForm ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hide Add Garage Form
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add a Garage Location (Optional)
                </>
              )}
            </button>
          </div>

          <div className={`grid gap-4 ${showCrowdLocateForm ? "md:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]" : "md:grid-cols-1"}`}>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <div
                ref={mapContainerRef}
                className="h-[480px] w-full md:h-[560px]"
              />
            </div>

            {showCrowdLocateForm && (
              <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                <h2 className="text-lg font-semibold text-white">
                  Add Garage <span className="text-orange-500">Location</span>
                </h2>
                <p className="text-xs text-gray-300">
                  Click anywhere on the map to select a location, then fill in the details below. Only logged-in
                  renters can add garages. This is completely optional.
                </p>

                {pendingLocation ? (
                  <div className="rounded-lg bg-white/5 p-3 text-xs text-gray-200">
                    <div className="font-semibold text-orange-400">Location selected</div>
                    <div className="mt-1">
                      Lat: {pendingLocation.latitude.toFixed(6)}, Lng:{" "}
                      {pendingLocation.longitude.toFixed(6)}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-white/5 p-3 text-xs text-gray-300">
                    Click anywhere on the map to select a location for the garage.
                  </div>
                )}

                <form onSubmit={handleSubmitGarage} className="space-y-3">
                  <div>
                <label className="mb-1 block text-xs font-medium text-gray-200">
                  Garage name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  placeholder="Example: Birtamod Auto Workshop"
                />
              </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-200">
                        City / Town
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFieldChange}
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        placeholder="Itahari"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-200">
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleFieldChange}
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        placeholder="Jhapa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-200">
                        Province
                      </label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleFieldChange}
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        placeholder="Koshi Province"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-200">
                        Phone
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFieldChange}
                        className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                        placeholder="+977 98XXXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-200">
                      Address / Landmark
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleFieldChange}
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      placeholder="Near main road, opposite to petrol pump"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-200">
                      Type (optional)
                    </label>
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleFieldChange}
                      className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                      placeholder="car_repair, tyre, workshop…"
                    />
                  </div>

                <button
                  type="submit"
                  disabled={!pendingLocation || isSubmitting}
                  className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(249,115,22,0.35)] transition-all duration-300 hover:scale-[1.02] hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Saving…" : pendingLocation ? "Submit Garage" : "Select a point on map first"}
                </button>
              </form>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GaragesMap;

