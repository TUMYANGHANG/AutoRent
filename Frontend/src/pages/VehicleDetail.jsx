import {
  faArrowLeft,
  faCar,
  faGasPump,
  faGears,
  faHeart,
  faPeopleGroup,
  faShieldHalved,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { renterAPI, favoritesAPI, getAuthToken } from "../utils/api.js";

const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `₹${n.toLocaleString()}`;
};

const VehicleDetail = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const isAuthenticated = !!getAuthToken();

  useEffect(() => {
    let cancelled = false;
    const fetchVehicle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await renterAPI.getVehicleById(id);
        if (!cancelled && res?.data) setVehicle(res.data);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? "Failed to load vehicle");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVehicle();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [vehicle?.id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    let cancelled = false;
    const fetchFavoriteIds = async () => {
      try {
        const ids = await favoritesAPI.getIds();
        if (!cancelled && Array.isArray(ids)) setIsFavorite(ids.includes(Number(id)));
      } catch {
        if (!cancelled) setIsFavorite(false);
      }
    };
    fetchFavoriteIds();
    return () => { cancelled = true; };
  }, [isAuthenticated, id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated || !id || favoriteLoading) return;
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await favoritesAPI.remove(id);
        setIsFavorite(false);
      } else {
        await favoritesAPI.add(id);
        setIsFavorite(true);
      }
    } catch {
      // keep current state on error
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 sm:px-6 lg:px-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
          <p className="text-white/70">Loading vehicle…</p>
        </div>
      </main>
    );
  }

  if (error || !vehicle) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 text-white/70 transition hover:text-orange-400"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            Back to vehicles
          </Link>
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-center">
            <p className="text-red-400">{error ?? "Vehicle not found or not available for rent."}</p>
          </div>
        </div>
      </main>
    );
  }

  const images = Array.isArray(vehicle.images) ? vehicle.images.filter((url) => url != null) : [];
  const imageUrl = images[selectedImageIndex] ?? images[0] ?? null;
  const brand = vehicle.brand ?? "";
  const model = vehicle.model ?? "";
  const pricePerDay = formatPrice(vehicle.pricePerDay);
  const securityDeposit = formatPrice(vehicle.securityDeposit);
  const lateFeePerHour = formatPrice(vehicle.lateFeePerHour);

  const specs = [
    { label: "Year", value: vehicle.manufactureYear },
    { label: "Type", value: vehicle.vehicleType },
    { label: "Color", value: vehicle.color },
    { label: "Fuel", value: vehicle.fuelType },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Seats", value: vehicle.seatingCapacity },
    { label: "Airbags", value: vehicle.airbags },
  ].filter((s) => s.value != null && s.value !== "");

  return (
    <main className="min-h-screen bg-[#05070b]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 text-white/70 transition hover:text-orange-400"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          Back to vehicles
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${brand} ${model}`}
                  className="h-auto w-full cursor-default select-none object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-zinc-800/80">
                  <FontAwesomeIcon icon={faCar} className="h-24 w-24 text-white/20" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.slice(0, 10).map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`h-20 w-32 shrink-0 overflow-hidden rounded-lg border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                      selectedImageIndex === i
                        ? "border-orange-500 ring-2 ring-orange-500/30"
                        : "border-white/20 hover:border-white/40"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {brand} {model}
            </h1>
            {vehicle.manufactureYear && (
              <p className="mt-1 text-white/60">{vehicle.manufactureYear}</p>
            )}

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
              {vehicle.seatingCapacity != null && (
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <FontAwesomeIcon icon={faPeopleGroup} className="h-4 w-4 text-orange-400" />
                  {vehicle.seatingCapacity} seats
                </span>
              )}
              {vehicle.transmission && (
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <FontAwesomeIcon icon={faGears} className="h-4 w-4 text-orange-400" />
                  {vehicle.transmission}
                </span>
              )}
              {vehicle.fuelType && (
                <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <FontAwesomeIcon icon={faGasPump} className="h-4 w-4 text-orange-400" />
                  {vehicle.fuelType}
                </span>
              )}
            </div>

            {vehicle.description && (
              <p className="mt-6 text-white/80 leading-relaxed">{vehicle.description}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <p className="text-xs font-medium text-white/50">{label}</p>
                  <p className="mt-0.5 font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Price per day</span>
                <span className="flex items-center gap-2 font-semibold text-orange-400">
                  <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                  {pricePerDay}
                </span>
              </div>
              {vehicle.securityDeposit != null && vehicle.securityDeposit !== "" && (
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-white/70">Security deposit</span>
                  <span className="font-medium text-white">{securityDeposit}</span>
                </div>
              )}
              {vehicle.lateFeePerHour != null && vehicle.lateFeePerHour !== "" && (
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-white/70">Late fee (per hour)</span>
                  <span className="font-medium text-white">{lateFeePerHour}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={`/vehicles/${id}/book`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-lg font-bold text-black shadow-[0_18px_45px_rgba(249,115,22,0.35)] transition-all hover:bg-orange-400 hover:shadow-[0_18px_45px_rgba(249,115,22,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <FontAwesomeIcon icon={faCalendarCheck} className="h-5 w-5" />
                Book this vehicle
              </Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-4 text-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60 ${
                    isFavorite
                      ? "border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={faHeart} className={isFavorite ? "h-5 w-5" : "h-5 w-5 opacity-80"} />
                  {favoriteLoading ? (isFavorite ? "Removing…" : "Adding…") : isFavorite ? "Remove from favorites" : "Add to favorites"}
                </button>
              ) : (
                <Link
                  to="/"
                  state={{ openLogin: true }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-lg font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                  <FontAwesomeIcon icon={faHeart} className="h-5 w-5 opacity-80" />
                  Sign in to add to favorites
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VehicleDetail;
