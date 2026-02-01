import {
  faCar,
  faGasPump,
  faGears,
  faHeart,
  faPeopleGroup,
  faShieldHalved,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { favoritesAPI, getAuthToken } from "../utils/api.js";

const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `₹${n.toLocaleString()}`;
};

const Favorites = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!getAuthToken();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await favoritesAPI.getFavorites();
        if (!cancelled && Array.isArray(data)) setVehicles(data);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? "Failed to load favorites");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFavorites();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleRemoveFavorite = async (vehicleId) => {
    try {
      await favoritesAPI.remove(vehicleId);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      setSuccessMessage("Vehicle removed from your favorites.");
    } catch {
      // keep list on error
    }
  };

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-6 py-16 text-center">
            <FontAwesomeIcon icon={faHeart} className="h-16 w-16 text-white/30" />
            <h2 className="mt-4 text-2xl font-bold text-white">Your favorites</h2>
            <p className="mt-2 max-w-md text-white/70">
              Sign in to see and manage your favorite vehicles.
            </p>
            <button
              type="button"
              onClick={() => navigate("/", { state: { openLogin: true } })}
              className="mt-6 cursor-pointer rounded-xl bg-orange-500 px-8 py-3 font-semibold text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
            >
              Sign in
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 sm:px-6 lg:px-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
          <p className="text-white/70">Loading your favorites…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 cursor-pointer rounded-lg bg-white/10 px-4 py-2 text-white/90 hover:bg-white/20"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070b]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {successMessage && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-emerald-400"
          >
            <span className="flex-1 font-medium">{successMessage}</span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-white">Your favorite vehicles</h1>
        <p className="mt-1 text-white/60">
          {vehicles.length === 0
            ? "You haven't added any vehicles to favorites yet."
            : `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} saved.`}
        </p>

        {vehicles.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-6 py-16 text-center">
            <FontAwesomeIcon icon={faHeart} className="h-14 w-14 text-white/25" />
            <p className="mt-4 text-white/70">Add vehicles from the rent page to see them here.</p>
            <Link
              to="/vehicles"
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
            >
              Browse vehicles
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {vehicles.map((vehicle) => {
              const imageUrl =
                Array.isArray(vehicle.images) && vehicle.images[0] != null
                  ? vehicle.images[0]
                  : null;
              const brand = vehicle.brand ?? "";
              const model = vehicle.model ?? "";
              const pricePerDay = formatPrice(vehicle.pricePerDay);
              return (
                <div
                  key={vehicle.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black/30 sm:flex-row"
                >
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="relative block h-40 w-full shrink-0 cursor-pointer overflow-hidden bg-zinc-800/80 sm:h-auto sm:w-56 sm:min-h-[140px]"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${brand} ${model}`}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FontAwesomeIcon icon={faCar} className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="cursor-pointer text-lg font-bold text-white hover:text-orange-400"
                      >
                        {brand} {model}
                      </Link>
                      {vehicle.manufactureYear && (
                        <p className="text-sm text-white/60">{vehicle.manufactureYear}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/70">
                        {vehicle.seatingCapacity != null && (
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faPeopleGroup} className="h-4 w-4 text-orange-400/80" />
                            {vehicle.seatingCapacity} seats
                          </span>
                        )}
                        {vehicle.transmission && (
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faGears} className="h-4 w-4 text-orange-400/80" />
                            {vehicle.transmission}
                          </span>
                        )}
                        {vehicle.fuelType && (
                          <span className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faGasPump} className="h-4 w-4 text-orange-400/80" />
                            {vehicle.fuelType}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 sm:border-t-0 sm:pt-0">
                      <span className="flex items-center gap-1.5 text-base font-semibold text-orange-400">
                        <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
                        {pricePerDay}
                        <span className="text-sm font-normal text-white/60">/day</span>
                      </span>
                      <Link
                        to={`/vehicles/${vehicle.id}`}
                        className="cursor-pointer rounded-lg bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-400 ring-1 ring-orange-500/30 hover:bg-orange-500/30"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(vehicle.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        aria-label="Remove from favorites"
                      >
                        <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Favorites;
