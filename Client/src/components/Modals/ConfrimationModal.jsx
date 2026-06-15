import { AlertCircle, AlertTriangle, Info, Loader2, ShieldAlert } from "lucide-react";
import { useState } from "react";

const TYPE = {
  danger: {
    icon: ShieldAlert,
    iconColor: "text-[var(--danger)]",
    iconBg: "bg-[var(--danger-soft)]",
    btnClass: "bg-[var(--danger)] hover:bg-[var(--danger-strong)] text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-[var(--warning-strong)]",
    iconBg: "bg-[var(--warning-soft)]",
    btnClass: "bg-[var(--warning)] hover:brightness-95 text-white",
  },
  info: {
    icon: Info,
    iconColor: "text-[var(--primary)]",
    iconBg: "bg-[var(--primary-soft)]",
    btnClass: "premium-button-primary",
  },
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
}) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const { icon: Icon, iconColor, iconBg, btnClass } = TYPE[type] || TYPE.warning;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="premium-panel w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="pt-1.5">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {title}
              </h3>
              <p className="text-xs text-[var(--text-subtle)] mt-0.5">
                Please confirm to continue
              </p>
            </div>
          </div>
          <div className="text-sm text-[var(--text-muted)] leading-relaxed">
            {message}
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 bg-[var(--surface-2)] border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl premium-button-secondary text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold transition-all ${btnClass} ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
