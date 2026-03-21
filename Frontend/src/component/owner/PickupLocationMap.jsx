import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";

const CARTO_STYLE_LIGHT =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  longitude: 84.0, // Approx center of Nepal
  latitude: 28.0,
  zoom: 7,
};

/**
 * Simple map picker for vehicle pickup location.
 * Props:
 * - value: { latitude, longitude } | null
 * - onChange: ({ latitude, longitude }) => void
 */
const PickupLocationMap = ({ value, onChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_STYLE_LIGHT,
      center: [
        value?.longitude ?? INITIAL_VIEW_STATE.longitude,
        value?.latitude ?? INITIAL_VIEW_STATE.latitude,
      ],
      zoom: value ? 12 : INITIAL_VIEW_STATE.zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    // Optional: center on user's current location
    if (!value && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          map.setCenter([longitude, latitude]);
          map.setZoom(12);
        },
        () => {
          // ignore errors – we stay on default center
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 },
      );
    }

    const handleClick = (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new maplibregl.Marker({ color: "#f97316" })
          .setLngLat([lng, lat])
          .addTo(map);
      }

      if (onChange) {
        onChange({ latitude: lat, longitude: lng });
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // If value changes from outside, move marker
  useEffect(() => {
    if (!mapRef.current || !value?.latitude || !value?.longitude) return;
    const { latitude, longitude } = value;
    if (markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude]);
    } else {
      markerRef.current = new maplibregl.Marker({ color: "#f97316" })
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);
    }
    mapRef.current.setCenter([longitude, latitude]);
  }, [value?.latitude, value?.longitude]);

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className="h-64 w-full overflow-hidden rounded-xl border border-slate-300"
      />
      <p className="text-xs text-slate-500">
        Click on the map to set the pickup location for this vehicle.
      </p>
    </div>
  );
};

export default PickupLocationMap;

