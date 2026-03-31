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
import { PageHeader } from "../../component/dashboard/DashboardPrimitives.jsx";
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
      <PageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Manage your profile information and verification details."
      />
      <div className="dash-panel rounded-2xl p-5 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {userDetails?.profilePicture ? (
              <img
                src={userDetails.profilePicture}
                alt={fullName}
                className="h-16 w-16 rounded-full border-2 border-teal-400 object-cover ring-2 ring-teal-500/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-2xl font-bold text-white shadow-lg shadow-teal-900/25">
                {user.firstName?.[0]?.toUpperCase() ||
                  user.email[0].toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
              <p className="text-slate-600">Profile information</p>
            </div>
          </div>
          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800"
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
              <div className="py-8 text-center text-slate-500">
                Loading profile...
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="h-5 w-5 text-white"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Full Name
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {fullName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="h-5 w-5 text-white"
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

                {userDetails?.phoneNumber && (
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Phone Number
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {userDetails.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.dateOfBirth && (
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Date of Birth
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {new Date(userDetails.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.address && (
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Address
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {userDetails.address}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.city && (
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">City</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {userDetails.city}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.licenseNumber && (
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                      <FontAwesomeIcon
                        icon={faIdCard}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        License Number
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {userDetails.licenseNumber}
                      </p>
                      {userDetails.isLicenseVerified && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-teal-600">
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
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        License Expiry
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {new Date(
                          userDetails.licenseExpiry,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {userDetails?.licenseImage && (
                  <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 md:col-span-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                      <FontAwesomeIcon
                        icon={faImage}
                        className="h-5 w-5 text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-500">
                        License Image
                      </p>
                      <img
                        src={userDetails.licenseImage}
                        alt="License"
                        className="mt-2 max-h-48 rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 md:col-span-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-900/20">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="h-5 w-5 text-white"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Role</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      Vehicle Owner
                    </p>
                  </div>
                </div>

                {!userDetails && (
                  <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-center">
                    <p className="text-sm text-red-700">
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
