import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

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

  const getIconAndColor = () => {
    switch (type) {
      case "danger":
        return {
          icon: AlertCircle,
          color: "text-red-600",
          buttonColor: "bg-[var(--error)] hover:brightness-95",
        };
      case "warning":
        return {
          icon: AlertCircle,
          color: "text-yellow-600",
          buttonColor: "bg-[var(--warning)] hover:brightness-95",
        };
      default:
        return {
          icon: AlertCircle,
          color: "text-blue-600",
          buttonColor: "premium-button-primary",
        };
    }
  };

  const { icon: Icon, color, buttonColor } = getIconAndColor();

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
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="premium-panel p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 mb-4">
          <Icon className={`${color} w-6 h-6`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-gray-600 mb-6">{message}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl premium-button-secondary disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${buttonColor} ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
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
