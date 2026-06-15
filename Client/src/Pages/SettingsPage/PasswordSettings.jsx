import { CheckCircle2, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { useState } from "react";
import { setPassword, updatePassword } from "../../Apis/authApi";
import { useModal } from "../../Contexts/ModalContext";

const PasswordSettings = ({
  passwordData,
  setPasswordData,
  hasManualPassword,
  setHasManualPassword,
}) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { showModal } = useModal();

  const handlePasswordAction = async () => {
    const { current, new: newPass, confirm } = passwordData;

    if (newPass !== confirm) {
      showModal("Mismatch", "New passwords do not match!", "error");
      return;
    }
    if (newPass.length <= 3) {
      showModal("Invalid", "Password must be longer than 3 characters!", "error");
      return;
    }
    if (hasManualPassword && current === confirm) {
      showModal("Invalid", "Old and New password cannot be same!", "error");
      return;
    }

    setSubmitting(true);
    const res = hasManualPassword
      ? await updatePassword(current, confirm)
      : await setPassword(confirm);
    setSubmitting(false);

    if (res.success) {
      showModal(
        "Success",
        hasManualPassword
          ? "Password updated successfully!"
          : "Password set successfully!",
        "success"
      );
      if (!hasManualPassword) setHasManualPassword(true);
      setPasswordData({ current: "", new: "", confirm: "" });
    } else {
      showModal("Error", res.message, "error");
    }
  };

  const PasswordField = ({ label, value, onChange, show, setShow, testId }) => (
    <div>
      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          data-testid={testId}
          className="premium-input w-full pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="premium-card p-5 sm:p-6" data-testid="password-settings-card">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center flex-shrink-0">
          <KeyRound className="w-4.5 h-4.5 text-[var(--primary)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {hasManualPassword ? "Change password" : "Set up password"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {hasManualPassword
              ? "Use a strong password that you don't use anywhere else."
              : "Set a password to enable manual login in addition to social login."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {hasManualPassword && (
          <PasswordField
            label="Current password"
            value={passwordData.current}
            onChange={(e) =>
              setPasswordData({ ...passwordData, current: e.target.value })
            }
            show={showCurrent}
            setShow={setShowCurrent}
            testId="password-current"
          />
        )}
        <PasswordField
          label={hasManualPassword ? "New password" : "Password"}
          value={passwordData.new}
          onChange={(e) =>
            setPasswordData({ ...passwordData, new: e.target.value })
          }
          show={showNew}
          setShow={setShowNew}
          testId="password-new"
        />
        <PasswordField
          label={hasManualPassword ? "Confirm new password" : "Confirm password"}
          value={passwordData.confirm}
          onChange={(e) =>
            setPasswordData({ ...passwordData, confirm: e.target.value })
          }
          show={showConfirm}
          setShow={setShowConfirm}
          testId="password-confirm"
        />

        <div className="pt-2 flex justify-end">
          <button
            onClick={handlePasswordAction}
            disabled={submitting}
            data-testid="password-submit-btn"
            className="inline-flex items-center px-4 py-2.5 rounded-xl premium-button-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {submitting
              ? "Saving..."
              : hasManualPassword
              ? "Update password"
              : "Set password"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordSettings;
