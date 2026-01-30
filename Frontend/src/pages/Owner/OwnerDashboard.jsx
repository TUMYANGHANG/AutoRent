import {
  faCar,
  faChartLine,
  faDollarSign,
  faEnvelope,
  faPlus,
  faUser,
  faUserTag,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddVehicleForm from "../../component/owner/AddVehicleForm.jsx";
import OwnerNavbar from "../../component/owner/OwnerNavbar.jsx";
import OwnerSidebar from "../../component/owner/OwnerSidebar.jsx";
import { removeAuthToken } from "../../utils/api.js";

const OwnerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <OwnerNavbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1">
        <OwnerSidebar
          activeKey={activeSection}
          onSelect={setActiveSection}
        />
        <main className="min-w-0 flex-1 px-4 py-12 pl-14 sm:px-6 lg:pl-8">
          <div className="mx-auto max-w-5xl">
            {activeSection === "add-vehicle" ? (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-extrabold text-slate-900">
                    Add Vehicle
                  </h1>
                  <p className="mt-2 text-slate-600">
                    List your vehicle and start earning rental income.
                  </p>
                </div>
                <AddVehicleForm
                  onCancel={() => setActiveSection("dashboard")}
                  onSuccess={() => setActiveSection("vehicles")}
                />
              </>
            ) : (
              <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900">
                Vehicle Owner Dashboard
              </h1>
              <p className="mt-2 text-slate-600">
                Welcome back, {user.firstName || "User"}! Manage your vehicles and
                earnings.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mb-8 grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Vehicles
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <FontAwesomeIcon
                      icon={faCar}
                      className="h-6 w-6 text-orange-600"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Active Rentals
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <FontAwesomeIcon
                      icon={faChartLine}
                      className="h-6 w-6 text-green-600"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Earnings
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <FontAwesomeIcon
                      icon={faDollarSign}
                      className="h-6 w-6 text-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Available Balance
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">$0</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <FontAwesomeIcon
                      icon={faWallet}
                      className="h-6 w-6 text-purple-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setActiveSection("add-vehicle")}
                className="group w-full rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 transition-all duration-300 group-hover:bg-orange-200">
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="h-8 w-8 text-orange-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Add New Vehicle
                    </h3>
                    <p className="mt-1 text-slate-600">
                      List your vehicle and start earning rental income
                    </p>
                  </div>
                </div>
              </button>

              <button className="group rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 transition-all duration-300 group-hover:bg-blue-200">
                    <FontAwesomeIcon
                      icon={faCar}
                      className="h-8 w-8 text-blue-600"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Manage Vehicles
                    </h3>
                    <p className="mt-1 text-slate-600">
                      View and manage all your listed vehicles
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* User Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
                  {user.firstName?.[0]?.toUpperCase() ||
                    user.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
                  <p className="text-slate-500">Profile Information</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-5 w-5 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Full Name</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="h-5 w-5 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Email Address
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 md:col-span-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="h-5 w-5 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Role</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      Vehicle Owner
                    </p>
                  </div>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;
