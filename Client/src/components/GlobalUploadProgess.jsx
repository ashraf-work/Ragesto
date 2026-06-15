import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { useGlobalProgress } from "../Contexts/ProgressContext";
import { useModal } from "../Contexts/ModalContext";

export function GlobalUploadProgress() {
  const { active, total, completed, percent, currentFileName, message } =
    useGlobalProgress();
  const { showModal } = useModal();

  const isFinished = useMemo(
    () => total > 0 && completed >= total && !active,
    [total, completed, active]
  );

  const [holdVisible, setHoldVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const holdTimerRef = useRef(null);

  useEffect(() => {
    if (isFinished) {
      setHoldVisible(true);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      holdTimerRef.current = setTimeout(() => {
        setHoldVisible(false);
        setDismissed(false);

        showModal(
          "Success",
          "Files have been uploaded successfully. You can find them in the 'Google Drive' folder at the root directory.",
          "success"
        );
      }, 2000);
    }
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [isFinished]);

  const shouldShow = (active || holdVisible) && !dismissed;
  if (!shouldShow) return null;

  const percentSafe = Number.isFinite(percent)
    ? Math.max(0, Math.min(100, percent))
    : 0;
  const countText =
    total > 0 ? `${Math.min(completed, total)} of ${total} files` : "Preparing...";
  const detailText = isFinished
    ? "All files uploaded successfully"
    : message ||
      (currentFileName ? `Importing ${currentFileName}` : "Please don't close this window");

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-up">
      <div className="min-w-[300px] max-w-[380px] premium-panel overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0">
              {isFinished ? (
                <div className="w-9 h-9 rounded-2xl bg-[var(--success-soft)] flex items-center justify-center">
                  <CheckCircle2 className="h-4.5 w-4.5 text-[var(--success)]" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-2xl bg-[var(--primary-soft)] flex items-center justify-center">
                  <Loader2 className="h-4.5 w-4.5 text-[var(--primary)] animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isFinished ? "Upload complete" : "Uploading files"}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
                {detailText}
              </p>
            </div>

            <div className="text-right">
              <div className="text-base font-bold text-[var(--text-primary)] tabular-nums">
                {percentSafe}%
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-[var(--text-muted)] font-medium">
              {countText}
            </span>
            <span
              className={`font-semibold ${
                isFinished ? "text-[var(--success-strong)]" : "text-[var(--primary)]"
              }`}
            >
              {isFinished ? "Complete" : "In progress"}
            </span>
          </div>

          <div className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${percentSafe}%`,
                background: isFinished
                  ? "linear-gradient(90deg, #10b981, #047857)"
                  : "linear-gradient(90deg, #6366f1, #06b6d4)",
              }}
            />
          </div>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <UploadCloud className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
            <span className="text-[11px] text-[var(--text-subtle)] truncate">
              {isFinished
                ? "Files are now available in your drive"
                : currentFileName || "Upload in progress..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
