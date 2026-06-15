import { AlertOctagon, PauseCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteAccount, disableAccount } from "../../Apis/userApi";
import { useModal } from "../../Contexts/ModalContext";
import { useAuth } from "../../Contexts/AuthContext";

const AccountOptions = ({ option }) => {
  const navigate = useNavigate();
  const { setIsAuth } = useAuth();
  const { showModal, showConfirmModal, closeConfirmModal } = useModal();

  const config = {
    delete: {
      title: "Delete account",
      icon: Trash2,
      tone: "danger",
      subject: "This action is permanent.",
      info: "Deleting your account will permanently remove all your data, files, and settings. You will lose access to all connected services and this cannot be reversed.",
      cta: "Delete account permanently",
      handler: () => {
        showConfirmModal(
          "Delete account",
          "Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.",
          async () => {
            const res = await deleteAccount();
            if (res.success) {
              showModal("Account Deleted", "Your account has been deleted.");
              setIsAuth(false);
              setTimeout(() => navigate("/login"), 1000);
            } else {
              showModal("Error", res.message || "Something went wrong.", "error");
            }
            closeConfirmModal();
          },
          "danger"
        );
      },
    },
    disable: {
      title: "Disable account",
      icon: PauseCircle,
      tone: "warning",
      subject: "Temporary and reversible.",
      info: "Disabling your account will hide your profile and stop all notifications. Your data will be retained securely and can be restored anytime by contacting our support team.",
      cta: "Disable my account",
      handler: () => {
        showConfirmModal(
          "Disable account",
          "Are you sure you want to disable your account? You can reactivate it later by contacting support.",
          async () => {
            const res = await disableAccount();
            if (res.success) {
              showModal(
                "Account Disabled",
                "Your account has been disabled. Contact support@ragesto.cloud to reactivate.",
                "success"
              );
              setIsAuth(false);
              setTimeout(() => navigate("/login"), 1000);
            } else {
              showModal("Error", res.message || "Something went wrong.", "error");
            }
            closeConfirmModal();
          },
          "warning"
        );
      },
    },
  };

  const { title, icon: Icon, tone, subject, info, cta, handler } = config[option];

  const toneClasses = {
    danger: {
      iconBg: "bg-[var(--danger-soft)]",
      iconColor: "text-[var(--danger)]",
      cardBorder: "border-[rgba(239,68,68,0.18)]",
      banner: "bg-[var(--danger-soft)] text-[var(--danger-strong)] border-[rgba(239,68,68,0.18)]",
      btn: "bg-[var(--danger)] hover:bg-[var(--danger-strong)] text-white",
    },
    warning: {
      iconBg: "bg-[var(--warning-soft)]",
      iconColor: "text-[var(--warning-strong)]",
      cardBorder: "border-[rgba(245,158,11,0.22)]",
      banner: "bg-[var(--warning-soft)] text-[var(--warning-strong)] border-[rgba(245,158,11,0.22)]",
      btn: "bg-[var(--warning)] hover:brightness-95 text-white",
    },
  };
  const t = toneClasses[tone];

  return (
    <div
      className={`premium-card p-5 sm:p-6 border ${t.cardBorder}`}
      data-testid={`account-option-${option}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl ${t.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${t.iconColor}`} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{title}</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            {subject}
          </p>
        </div>
      </div>

      <div className={`flex items-start gap-2.5 p-4 rounded-xl border ${t.banner} mb-5`}>
        <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p className="text-sm">{info}</p>
      </div>

      <button
        onClick={handler}
        data-testid={`account-${option}-btn`}
        className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${t.btn}`}
      >
        <Icon className="w-4 h-4 mr-1.5" />
        {cta}
      </button>
    </div>
  );
};

export default AccountOptions;
