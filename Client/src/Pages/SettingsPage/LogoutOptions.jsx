import { LogOut, Monitor, Smartphone } from "lucide-react";
import { logout, logoutAll } from "../../Apis/authApi";
import { useModal } from "../../Contexts/ModalContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext";

const LogoutOptions = () => {
  const navigate = useNavigate();
  const { setIsAuth } = useAuth();
  const { showModal, showConfirmModal, closeConfirmModal } = useModal();

  const handleLogout = async () => {
    const res = await logout();
    if (res.success) {
      showModal("Success", "Logged out successfully!", "success");
      setIsAuth(false);
      setTimeout(() => navigate("/login"), 1200);
    } else {
      showModal("Error", "Logout failed", "error");
    }
  };

  const handleLogoutAll = async () => {
    showConfirmModal(
      "Logout All Devices",
      "Are you sure you want to logout from all devices?",
      async () => {
        const res = await logoutAll();
        if (res.success) {
          showModal("Success", "Logged out from all devices!", "success");
          setIsAuth(false);
          setTimeout(() => navigate("/login"), 1000);
          closeConfirmModal();
        } else {
          showModal("Error", "Failed to logout all.", "error");
        }
      },
      "warning"
    );
  };

  return (
    <div className="premium-card p-5 sm:p-6" data-testid="logout-options-card">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center flex-shrink-0">
          <LogOut className="w-4.5 h-4.5 text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Active sessions
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Sign out of this device or every device where you are signed in.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--surface-2)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
              <Monitor className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                This device
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Sign out from this browser
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-btn"
            className="w-full px-3 py-2 rounded-xl premium-button-secondary text-sm"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--border)] p-4 bg-[var(--surface-2)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--danger-soft)] border border-[rgba(239,68,68,0.18)] flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-[var(--danger)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                All devices
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Sign out everywhere
              </p>
            </div>
          </div>
          <button
            onClick={handleLogoutAll}
            data-testid="logout-all-btn"
            className="w-full px-3 py-2 rounded-xl text-sm font-semibold text-[var(--danger-strong)] bg-[var(--danger-soft)] border border-[rgba(239,68,68,0.18)] hover:bg-[rgba(239,68,68,0.12)] transition-all"
          >
            Sign out everywhere
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutOptions;
