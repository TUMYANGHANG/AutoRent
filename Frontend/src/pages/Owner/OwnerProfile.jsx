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
import OwnerProfileForm from "../../component/owner/OwnerProfileForm.jsx";

const OwnerProfile = ({ user, userDetails, loadingDetails, onProfileUpdate }) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || "User";

  const handleProfileUpdate = async () => {
    await onProfileUpdate();
    setIsEditingProfile(false);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-black">Profile</h1>
        <p className="mt-2 text-[#555555]">Manage your profile information</p>
      </div>
      <div className="rounded-2xl border border-[#E2D4C4] bg-[#FFF7E6] p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {userDetails?.profilePicture ? (
              <img
                src={userDetails.profilePicture}
                alt={fullName}
                className="h-16 w-16 rounded-full object-cover border-2 border-[#4DFFBC]"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4DFFBC] text-2xl font-bold text-[#555555]">
                {user.firstName?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-black">{fullName}</h2>
              <p className="text-[#555555]">Profile Information</p>
            </div>
          </div>
          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#898989] bg-[#D9D9D9] px-4 py-2 text-sm font-semibold text-[#555555] transition hover:bg-[#898989] hover:text-white"
            >
              <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <OwnerProfileForm
            user={user}
            userDetails={userDetails}
            onSuccess={handleProfileUpdate}
            onCancel={() => setIsEditingProfile(false)}
          />
        ) : (
          <>
            {loadingDetails ? (
              <div className="py-8 text-center text-[#555555]">
                Loading profile...
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-5 w-5 text-[#555555]"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#555555]">
                      Full Name
                    </p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      {fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="h-5 w-5 text-[#555555]"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#555555]">
                      Email Address
                    </p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      {user.email}
                    </p>
                  </div>
                </div>

                {userDetails?.phoneNumber && (
                  <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="h-5 w-5 text-[#555555]"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        Phone Number
                      </p>
                      <p className="mt-1 text-lg font-semibold text-black">
                        {userDetails.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.dateOfBirth && (
                  <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="h-5 w-5 text-[#555555]"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        Date of Birth
                      </p>
                      <p className="mt-1 text-lg font-semibold text-black">
                        {new Date(userDetails.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.address && (
                  <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-5 w-5 text-orange-600"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        Address
                      </p>
                      <p className="mt-1 text-lg font-semibold text-black">
                        {userDetails.address}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.city && (
                  <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-5 w-5 text-orange-600"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">City</p>
                      <p className="mt-1 text-lg font-semibold text-black">
                        {userDetails.city}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.licenseNumber && (
                  <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                      <FontAwesomeIcon
                        icon={faIdCard}
                        className="h-5 w-5 text-orange-600"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        License Number
                      </p>
                      <p className="mt-1 text-lg font-semibold text-black">
                        {userDetails.licenseNumber}
                      </p>
                      {userDetails.isLicenseVerified && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#4DFFBC]">
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
                  <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="h-5 w-5 text-orange-600"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#555555]">
                        License Expiry
                      </p>
                      <p className="mt-1 text-lg font-semibold text-black">
                        {new Date(
                          userDetails.licenseExpiry,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.licenseImage && (
                  <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4 md:col-span-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                      <FontAwesomeIcon
                        icon={faImage}
                        className="h-5 w-5 text-orange-600"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#555555]">
                        License Image
                      </p>
                      <img
                        src={userDetails.licenseImage}
                        alt="License"
                        className="mt-2 max-h-48 rounded-lg border border-[#898989]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 rounded-xl bg-[#FFF7E6] p-4 md:col-span-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4DFFBC]">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="h-5 w-5 text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#555555]">Role</p>
                    <p className="mt-1 text-lg font-semibold text-black">
                      Vehicle Owner
                    </p>
                  </div>
                </div>

                {!userDetails && (
                  <div className="md:col-span-2 rounded-xl bg-[#FF4D4D]/10 border border-[#FF4D4D] px-4 py-3 text-center">
                    <p className="text-[#FF4D4D] text-sm">
                      Complete your profile to get started. Click "Edit Profile"
                      to add your information.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default OwnerProfile;
