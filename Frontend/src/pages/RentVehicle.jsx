import {
  faCar,
  faGasPump,
  faGears,
  faHeart,
  faPeopleGroup,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { favoritesAPI, getAuthToken, renterAPI } from "../utils/api.js";

const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isNaN(n) ? "—" : `₹${n.toLocaleString()}`;
};

export const VehicleCard = ({ vehicle, isFavorite = false, onFavoriteClick }) => {
  const imageUrl =
    Array.isArray(vehicle.images) && vehicle.images[0] != null
      ? vehicle.images[0]
      : null;
  const brand = vehicle.brand ?? "";
  const model = vehicle.model ?? "";
  const pricePerDay = formatPrice(vehicle.pricePerDay);
  const seats =
    vehicle.seatingCapacity != null ? vehicle.seatingCapacity : null;
  const transmission = vehicle.transmission ?? null;
  const fuelType = vehicle.fuelType ?? null;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteClick) onFavoriteClick(vehicle.id);
  };

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-lg transition-all duration-300 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-800/80">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${brand} ${model}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FontAwesomeIcon icon={faCar} className="h-16 w-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {onFavoriteClick != null && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/90 ring-1 ring-white/20 transition hover:bg-black/70 hover:text-red-400 hover:ring-red-400/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FontAwesomeIcon
              icon={faHeart}
              className={`h-5 w-5 ${isFavorite ? "text-red-400" : "text-white/80"}`}
            />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold text-white">
          {brand} {model}
        </h3>
        {vehicle.manufactureYear && (
          <p className="text-sm text-white/60">{vehicle.manufactureYear}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
          {seats != null && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faPeopleGroup} className="h-3.5 w-3" />
              {seats} seats
            </span>
          )}
          {transmission && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faGears} className="h-3.5 w-3" />
              {transmission}
            </span>
          )}
          {fuelType && (
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faGasPump} className="h-3.5 w-3" />
              {fuelType}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5 text-base font-semibold text-orange-400">
            <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4" />
            {pricePerDay}
            <span className="text-sm font-normal text-white/60">/day</span>
          </span>
          <span className="rounded-lg bg-orange-500/20 px-3 py-1.5 text-sm font-semibold text-orange-400 ring-1 ring-orange-500/30 transition group-hover:bg-orange-500/30">
            View details
          </span>
        </div>
      </div>
    </Link>
  );
};

const RentVehicle = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterFuel, setFilterFuel] = useState("all");
  const [filterTransmission, setFilterTransmission] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await renterAPI.getVehiclesForRent();
        if (!cancelled && res?.data) setVehicles(res.data);
      } catch (err) {
        const errorMessage = err?.message ?? "Failed to load vehicles";
        if (!cancelled) {
          if (
            errorMessage.includes("Access token required") ||
            errorMessage.includes("Unauthorized") ||
            errorMessage.includes("401") ||
            err?.response?.status === 401
          ) {
            navigate("/", { state: { openLogin: true } });
          } else {
            setError(errorMessage);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVehicles();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const filterOptions = useMemo(() => {
    const types = new Set(["all"]);
    const fuels = new Set(["all"]);
    const transmissions = new Set(["all"]);
    vehicles.forEach((v) => {
      if (v.vehicleType?.trim()) types.add(String(v.vehicleType).trim());
      if (v.fuelType?.trim()) fuels.add(String(v.fuelType).trim());
      if (v.transmission?.trim())
        transmissions.add(String(v.transmission).trim());
    });
    return {
      types: Array.from(types).sort((a, b) =>
        a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)
      ),
      fuels: Array.from(fuels).sort((a, b) =>
        a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)
      ),
      transmissions: Array.from(transmissions).sort((a, b) =>
        a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b)
      ),
    };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      if (filterType !== "all" && (v.vehicleType?.trim() ?? "") !== filterType)
        return false;
      if (filterFuel !== "all" && (v.fuelType?.trim() ?? "") !== filterFuel)
        return false;
      if (
        filterTransmission !== "all" &&
        (v.transmission?.trim() ?? "") !== filterTransmission
      )
        return false;
      return true;
    });
  }, [vehicles, filterType, filterFuel, filterTransmission]);

  return (
    <main className="min-h-screen bg-[#05070b]">
      <section className="sticky top-20 z-40 border-b border-white/10 bg-[#05070b]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <label
                htmlFor="filter-type"
                className="text-sm font-medium text-white/70"
              >
                Type
              </label>
              <select
                id="filter-type"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 min-w-[120px]"
              >
                {filterOptions.types.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="bg-zinc-900 text-white"
                  >
                    {opt === "all" ? "All types" : opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="filter-fuel"
                className="text-sm font-medium text-white/70"
              >
                Fuel
              </label>
              <select
                id="filter-fuel"
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 min-w-[120px]"
              >
                {filterOptions.fuels.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="bg-zinc-900 text-white"
                  >
                    {opt === "all" ? "All fuel" : opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="filter-trans"
                className="text-sm font-medium text-white/70"
              >
                Transmission
              </label>
              <select
                id="filter-trans"
                value={filterTransmission}
                onChange={(e) => setFilterTransmission(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 min-w-[120px]"
              >
                {filterOptions.transmissions.map((opt) => (
                  <option
                    key={opt}
                    value={opt}
                    className="bg-zinc-900 text-white"
                  >
                    {opt === "all" ? "All" : opt}
                  </option>
                ))}
              </select>
            </div>
            {(filterType !== "all" ||
              filterFuel !== "all" ||
              filterTransmission !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setFilterType("all");
                  setFilterFuel("all");
                  setFilterTransmission("all");
                }}
                className="text-sm font-medium text-orange-400 hover:text-orange-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
            <p className="text-white/70">Loading vehicles…</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-16 text-center">
            <FontAwesomeIcon
              icon={faCar}
              className="mx-auto h-16 w-16 text-white/20"
            />
            <h2 className="mt-4 text-xl font-semibold text-white">
              No vehicles available yet
            </h2>
            <p className="mt-2 text-white/70">
              Verified vehicles will show up here. Check back soon.
            </p>
          </div>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <>
            {filteredVehicles.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
                <p className="text-white/70">
                  No vehicles match the selected filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("all");
                    setFilterFuel("all");
                    setFilterTransmission("all");
                  }}
                  className="mt-3 text-sm font-medium text-orange-400 hover:text-orange-300"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredVehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default RentVehicle;
