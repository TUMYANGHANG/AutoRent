import { faExclamationTriangle, faHardHat, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { authAPI, getAuthToken } from "../utils/api.js";

const VehicleBook = () => {
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const isAuthenticated = !!getAuthToken();
  const isRenterUnverified =
    isAuthenticated &&
    currentUser?.role === "renter" &&
    currentUser?.isProfileVerified === false;

  useEffect(() => {
    if (!isAuthenticated) {
      setUserLoading(false);
      return;
    }
    authAPI.me().then((u) => {
      setCurrentUser(u ?? null);
      setUserLoading(false);
    }).catch(() => setUserLoading(false));
  }, [isAuthenticated]);

  if (!userLoading && isRenterUnverified) {
    return (
      <main className="min-h-screen bg-[#05070b]">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/20">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-12 w-12 text-amber-400" />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-white md:text-4xl">
              Profile verification required
            </h1>
            <p className="mt-3 text-lg text-white/70">
              Complete your profile and get it verified by an admin before you can book vehicles. Go to your dashboard to complete and submit your profile.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
              >
                Go to dashboard
              </Link>
              <Link
                to={`/vehicles/${id}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                Back to vehicle
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070b]">
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-500/20">
            <FontAwesomeIcon icon={faHardHat} className="h-12 w-12 text-orange-400" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-white md:text-4xl">
            Under construction
          </h1>
          <p className="mt-3 text-lg text-white/70">
            The booking flow for this vehicle is being built. Check back soon to reserve your ride.
          </p>
          <p className="mt-2 text-sm text-white/50">Vehicle ID: {id}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to={`/vehicles/${id}`}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
              Back to vehicle
            </Link>
            <Link
              to="/vehicles"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-black transition hover:bg-orange-400"
            >
              Browse all vehicles
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VehicleBook;
