import {
  faCalendar,
  faCheckCircle,
  faEdit,
  faEnvelope,
  faIdCard,
  faImage,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import RenterProfileForm from "../../component/renter/RenterProfileForm.jsx";

const RenterProfile = ({ user, userDetails, loadingDetails, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const handleProfileUpdate = async () => {
    await onProfileUpdate();
    setIsEditing(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {userDetails?.profilePicture ? (
            <img
              src={userDetails.profilePicture}
              alt={fullName}
              className="h-16 w-16 rounded-full object-cover border-2 border-amber-500/30"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 text-2xl font-bold text-amber-400">
              {user.firstName?.[0]?.toUpperCase() ||
                user.email[0].toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-white">{fullName}</h2>
            <p className="text-white/70">Profile Information</p>
          </div>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <RenterProfileForm
          user={user}
          userDetails={userDetails}
          onSuccess={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          {loadingDetails ? (
            <div className="py-8 text-center text-white/60">
              Loading profile...
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="h-5 w-5 text-amber-400"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">Full Name</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {fullName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-5 w-5 text-amber-400"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">
                    Email Address
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {user.email}
                  </p>
                </div>
              </div>

              {userDetails?.phoneNumber && (
                <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="h-5 w-5 text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">
                      Phone Number
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {userDetails.phoneNumber}
                    </p>
                  </div>
                </div>
              )}

              {userDetails?.dateOfBirth && (
                <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="h-5 w-5 text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">
                      Date of Birth
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {new Date(userDetails.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {userDetails?.address && (
                <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="h-5 w-5 text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">Address</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {userDetails.address}
                    </p>
                  </div>
                </div>
              )}

              {userDetails?.city && (
                <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="h-5 w-5 text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">City</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {userDetails.city}
                    </p>
                  </div>
                </div>
              )}

              {userDetails?.licenseNumber && (
                <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="h-5 w-5 text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">
                      License Number
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {userDetails.licenseNumber}
                    </p>
                    {userDetails.isLicenseVerified && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="h-3 w-3"
                        />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              )}

              {userDetails?.licenseExpiry && (
                <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className="h-5 w-5 text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/70">
                      License Expiry
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {new Date(userDetails.licenseExpiry).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {userDetails?.licenseImage && (
                <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4 md:col-span-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                    <FontAwesomeIcon
                      icon={faImage}
                      className="h-5 w-5 text-amber-400"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/70">
                      License Image
                    </p>
                    <img
                      src={userDetails.licenseImage}
                      alt="License"
                      className="mt-2 max-h-48 rounded-lg border border-white/20"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 rounded-xl bg-white/[0.06] p-4 md:col-span-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                  <FontAwesomeIcon
                    icon={faUserTag}
                    className="h-5 w-5 text-amber-400"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70">Role</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Renter
                  </p>
                </div>
              </div>

              {!userDetails && (
                <div className="md:col-span-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-center">
                  <p className="text-amber-200/80 text-sm">
                    Complete your profile to get started. Click "Edit Profile" to
                    add your information.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RenterProfile;
