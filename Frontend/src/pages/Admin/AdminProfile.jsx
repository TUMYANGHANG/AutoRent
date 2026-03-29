import {
  faCheckCircle,
  faEnvelope,
  faShield,
  faUser,
  faUsers,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api.js";

const AdminProfile = ({ user }) => {
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    activeRentals: 0,
  });

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  useEffect(() => {
    adminAPI
      .getStats()
      .then((res) => {
        const data = res?.data ?? {};
        setDashboardStats({
          totalUsers: data.totalUsers ?? 0,
          totalVehicles: data.totalVehicles ?? 0,
          activeRentals: data.activeRentals ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4DFFBC] text-2xl font-bold text-[#555555]">
          {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-black">{fullName}</h2>
          <p className="text-[#555555]">Administrator Profile</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex items-start gap-4 rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF4D4D]/15">
            <FontAwesomeIcon
              icon={faUser}
              className="h-5 w-5 text-[#FF4D4D]"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[#555555]">Full Name</p>
            <p className="mt-1 text-lg font-semibold text-black">{fullName}</p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF4D4D]/15">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="h-5 w-5 text-[#FF4D4D]"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[#555555]">Email</p>
            <p className="mt-1 text-lg font-semibold text-black">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4DFFBC]/30">
            <FontAwesomeIcon
              icon={faUserTag}
              className="h-5 w-5 text-[#555555]"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[#555555]">Role</p>
            <p className="mt-1 text-lg font-semibold text-black">
              Administrator
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4DFFBC]/30">
            <FontAwesomeIcon
              icon={faShield}
              className="h-5 w-5 text-[#555555]"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[#555555]">Account Status</p>
            <p className="mt-1 text-lg font-semibold text-black">
              {user.isEmailVerified ? (
                <span className="inline-flex items-center gap-1.5 text-[#4DFFBC]">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="h-4 w-4"
                  />
                  Verified
                </span>
              ) : (
                <span className="text-[#FF4D4D]">Unverified</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-xl border border-[#E2D4C4] bg-[#FFF7E6] p-4 md:col-span-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF4D4D]/15">
            <FontAwesomeIcon
              icon={faUsers}
              className="h-5 w-5 text-[#FF4D4D]"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[#555555]">
              Platform Overview
            </p>
            <p className="mt-1 text-sm text-[#555555]">
              Managing{" "}
              <span className="font-semibold text-black">
                {dashboardStats.totalUsers}
              </span>{" "}
              users &middot;{" "}
              <span className="font-semibold text-black">
                {dashboardStats.totalVehicles}
              </span>{" "}
              vehicles &middot;{" "}
              <span className="font-semibold text-black">
                {dashboardStats.activeRentals}
              </span>{" "}
              active rentals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
