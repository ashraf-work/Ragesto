import { HardDrive } from "lucide-react";
import ShareModal from "../../components/Modals/ShareModal";
import useDirectory from "../../hooks/useDirectory";
import { useAuth } from "../../Contexts/AuthContext";
import { useStorage } from "../../Contexts/StorageContext";
import { formatFileSize } from "../../Utils/helpers";
import { useNavigate } from "react-router-dom";
import DirectoryView from "./DirectoryView";
import CreateFolderModal from "./CreateModal";
import UploadSection from "./UploadSection";

const StorageHeader = () => {
  const { user } = useAuth();
  const { storageData } = useStorage();
  const navigate = useNavigate();

  const max = storageData.maxStorageLimit || user.maxStorageLimit || 0;
  const used = storageData.usedStorageLimit || user.usedStorageLimit || 0;
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  const isNearLimit = pct >= 80;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const firstName = (user?.name || "").split(" ")[0] || "there";

  return (
    <div
      className="mb-6 grid gap-4 md:grid-cols-[1.4fr_1fr] items-stretch"
      data-testid="dashboard-storage-header"
    >
      <div className="premium-panel-tinted p-6 sm:p-7 relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 w-48 h-48 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(closest-side, rgba(79,70,229,0.18), transparent 70%)",
          }}
        />
        <div className="relative">
          <span className="eyebrow">Dashboard</span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {greeting},{" "}
            <span className="text-gradient-brand">{firstName}</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)] max-w-md">
            Manage your files, share securely, and keep everything in sync.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/plans")}
        data-testid="storage-card"
        className="premium-card p-5 sm:p-6 text-left w-full"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center">
              <HardDrive className="w-4.5 h-4.5 text-[var(--primary)]" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-xs text-[var(--text-subtle)] font-medium">
                Storage used
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {formatFileSize(used)}{" "}
                <span className="text-[var(--text-subtle)] font-medium">
                  of {formatFileSize(max)}
                </span>
              </div>
            </div>
          </div>
          <span
            className={`chip ${
              isNearLimit ? "chip-warning" : "chip-brand"
            } shrink-0`}
          >
            {Math.round(pct)}%
          </span>
        </div>
        <div className="h-2 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{
              width: `${pct}%`,
              background: isNearLimit
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : "linear-gradient(90deg, #6366f1, #06b6d4)",
            }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-[var(--text-subtle)]">
            {pct < 100
              ? `${formatFileSize(Math.max(0, max - used))} available`
              : "Storage full"}
          </span>
          <span className="font-semibold text-[var(--primary)]">
            Upgrade plan →
          </span>
        </div>
      </button>
    </div>
  );
};

const DirectoryPage = () => {
  const {
    allItems,
    loading,
    showCreateModal,
    showShareModal,
    currentFile,
    activeDropdown,
    dirId,
    breadCrumb,
    handleCreateModalClose,
    handleCreateSuccess,
    handleShareModalClose,
    handleDropdownClose,
    handleActionComplete,
    setCurrentPath,
    setActiveDropdown,
    setShowShareModal,
    setCurrentFile,
    setShowCreateModal,
  } = useDirectory();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {!dirId && <StorageHeader />}

      <main className="space-y-5">
        <UploadSection
          setShowCreateModal={setShowCreateModal}
          setActionDone={handleActionComplete}
        />

        <DirectoryView
          loading={loading}
          activeDropdown={activeDropdown}
          setActionDone={handleActionComplete}
          setActiveDropdown={setActiveDropdown}
          setCurrentFile={setCurrentFile}
          setCurrentPath={setCurrentPath}
          setShowShareModal={setShowShareModal}
          allItems={allItems}
          breadCrumb={breadCrumb}
        />
      </main>

      {showCreateModal && (
        <CreateFolderModal
          onClose={handleCreateModalClose}
          onCreate={handleCreateSuccess}
          dirId={dirId}
        />
      )}

      {showShareModal && (
        <ShareModal
          closeModal={handleShareModalClose}
          currentFile={currentFile}
        />
      )}

      {activeDropdown && (
        <div className="fixed inset-0 z-10" onClick={handleDropdownClose} />
      )}
    </div>
  );
};

export default DirectoryPage;
