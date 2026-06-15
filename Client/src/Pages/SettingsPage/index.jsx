import { useEffect, useState } from "react";
import { useModal } from "../../Contexts/ModalContext";
import useUserSettings from "../../hooks/useUserSettings";
import AccountOptions from "./AccountOptions";
import ConnectedAccount from "./ConnectedAccount";
import LogoutOptions from "./LogoutOptions";
import PasswordSettings from "./PasswordSettings";
import ProfileSettings from "./ProfileSettings";
import StorageUsage from "./StorageUsage";
import { useStorage } from "../../Contexts/StorageContext";
import {
  HardDrive,
  KeyRound,
  Link2,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";

const sections = [
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: KeyRound },
  { id: "connected", label: "Connected", icon: Link2 },
  { id: "session", label: "Sessions", icon: LogOut },
  { id: "danger", label: "Account", icon: Shield },
];

export default function SettingsPage() {
  const { showModal } = useModal();
  const { storageData, setStorageData } = useStorage();
  const {
    isSocialLogin,
    connectedAccount,
    profileData,
    getUserSettings,
    setProfileData,
    setOriginalProfileData,
    imagePreview,
    selectedImage,
    setImagePreview,
    setSelectedImage,
    handleImageSelect,
    hasProfileChanges,
    passwordData,
    setPasswordData,
    hasManualPassword,
    setHasManualPassword,
  } = useUserSettings({ showModal, setStorageData });

  const [activeSection, setActiveSection] = useState("storage");

  useEffect(() => {
    getUserSettings();
  }, []);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-10" data-testid="settings-page">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Settings
            </h1>
          </div>
          <p className="text-sm text-[var(--text-muted)] max-w-xl">
            Manage your profile, security, and account preferences in one place.
          </p>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-8">
          {/* Sidebar nav */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 -mx-1 px-1">
              {sections.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    data-testid={`settings-nav-${s.id}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      active
                        ? "bg-[var(--primary-softer)] text-[var(--primary-strong)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <div className="space-y-5 min-w-0">
            <div id="section-storage">
              <StorageUsage
                maxStorageLimit={storageData.maxStorageLimit}
                usedStorageLimit={storageData.usedStorageLimit}
              />
            </div>

            <div id="section-profile">
              <ProfileSettings
                profileData={profileData}
                setProfileData={setProfileData}
                setOriginalProfileData={setOriginalProfileData}
                imagePreview={imagePreview}
                selectedImage={selectedImage}
                setImagePreview={setImagePreview}
                setSelectedImage={setSelectedImage}
                handleImageSelect={handleImageSelect}
                hasProfileChanges={hasProfileChanges}
              />
            </div>

            <div id="section-password">
              <PasswordSettings
                passwordData={passwordData}
                setPasswordData={setPasswordData}
                hasManualPassword={hasManualPassword}
                setHasManualPassword={setHasManualPassword}
              />
            </div>

            {isSocialLogin && (
              <div id="section-connected">
                <ConnectedAccount connectedAccount={connectedAccount} />
              </div>
            )}

            <div id="section-session">
              <LogoutOptions />
            </div>

            <div id="section-danger" className="space-y-5">
              <AccountOptions option="disable" />
              <AccountOptions option="delete" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
