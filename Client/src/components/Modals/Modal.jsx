import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

const TYPE = {
  success: {
    icon: CheckCircle,
    iconColor: "text-[var(--success)]",
    iconBg: "bg-[var(--success-soft)]",
  },
  error: {
    icon: AlertCircle,
    iconColor: "text-[var(--danger)]",
    iconBg: "bg-[var(--danger-soft)]",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-[var(--warning-strong)]",
    iconBg: "bg-[var(--warning-soft)]",
  },
  info: {
    icon: Info,
    iconColor: "text-[var(--primary)]",
    iconBg: "bg-[var(--primary-soft)]",
  },
};

const Modal = ({ isOpen, onClose, title, children, type = "info" }) => {
  if (!isOpen) return null;
  const { icon: Icon, iconColor, iconBg } = TYPE[type] || TYPE.info;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="premium-panel w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-5 sm:p-6 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mt-1.5">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-[var(--text-muted)] p-5 sm:p-6 whitespace-pre-line">
          {children}
        </div>
        <div className="flex justify-end gap-2 p-4 bg-[var(--surface-2)] border-t border-[var(--border-subtle)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl premium-button-primary text-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
