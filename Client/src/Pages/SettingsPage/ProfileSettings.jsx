import { Camera, Save, User } from "lucide-react";
import { UpdateUserSettings } from "../../Apis/userApi";
import { useModal } from "../../Contexts/ModalContext";

const SectionCard = ({ title, icon: Icon, description, children }) => (
  <div className="premium-card p-5 sm:p-6">
    <div className="flex items-start gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-[var(--primary)]" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
    </div>
    {children}
  </div>
);

const ProfileSettings = ({
  profileData,
  setProfileData,
  setOriginalProfileData,
  imagePreview,
  selectedImage,
  setImagePreview,
  setSelectedImage,
  handleImageSelect,
  hasProfileChanges,
}) => {
  const { showModal } = useModal();

  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("name", profileData.name);
    const res = await UpdateUserSettings(formData);
    if (res.success) {
      showModal("Success", "Profile updated successfully!", "success");
      setSelectedImage(null);
      setImagePreview(null);
      setOriginalProfileData({
        ...profileData,
        picture: imagePreview || profileData.picture,
      });
      if (imagePreview) {
        setProfileData((prev) => ({
          ...prev,
          picture: imagePreview,
        }));
      }
    } else {
      showModal("Error", "Failed to update profile.", "error");
    }
  };

  const initials = (profileData?.name || "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SectionCard
      title="Profile information"
      icon={User}
      description="Update your name, photo, and other personal details."
    >
      {/* Avatar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-6 pb-6 border-b border-[var(--border-subtle)]">
        {imagePreview || profileData.picture ? (
          <img
            src={imagePreview || profileData.picture}
            alt="User profile"
            className="rounded-2xl w-20 h-20 sm:w-24 sm:h-24 object-cover ring-2 ring-[var(--border)]"
          />
        ) : (
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl text-white flex items-center justify-center text-2xl font-bold ring-2 ring-[var(--border)]"
            style={{
              background: "linear-gradient(135deg, #6366f1, #4338ca)",
            }}
          >
            {initials || "U"}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <input
            type="file"
            id="profileImage"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            data-testid="profile-image-input"
          />
          <label
            htmlFor="profileImage"
            className="inline-flex items-center px-3.5 py-2 rounded-xl premium-button-secondary text-sm cursor-pointer"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            Change photo
          </label>
          <p className="text-xs text-[var(--text-subtle)] mt-2">
            JPG, PNG or GIF · Max size 2MB
          </p>
          {selectedImage && (
            <p className="text-xs text-[var(--success-strong)] mt-1 truncate">
              {selectedImage.name} selected
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
            Full name
          </label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
            data-testid="profile-name-input"
            className="premium-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
            Email address
          </label>
          <input
            type="email"
            value={profileData.email}
            disabled
            className="premium-input w-full px-3.5 py-2.5 rounded-xl text-sm font-medium"
          />
          <p className="text-xs text-[var(--text-subtle)] mt-1.5">
            Email cannot be changed once set.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleProfileUpdate}
            disabled={!hasProfileChanges()}
            data-testid="profile-update-btn"
            className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              hasProfileChanges()
                ? "premium-button-primary"
                : "bg-[var(--surface-3)] text-[var(--text-subtle)] cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4 mr-1.5" />
            Save changes
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

export default ProfileSettings;
