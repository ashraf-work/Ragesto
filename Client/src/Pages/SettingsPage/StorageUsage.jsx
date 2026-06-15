import { AlertTriangle, ArrowUpRight, CheckCircle, HardDrive } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const StorageUsage = ({ maxStorageLimit, usedStorageLimit }) => {
  const navigate = useNavigate();

  const formatBytes = (bytes) => {
    if (bytes === 0 || isNaN(bytes) || bytes < 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const m = useMemo(() => {
    const pct = (usedStorageLimit / maxStorageLimit) * 100;
    const remaining = Math.max(0, maxStorageLimit - usedStorageLimit);
    const isOver = usedStorageLimit > maxStorageLimit;
    return {
      used: formatBytes(usedStorageLimit),
      max: formatBytes(maxStorageLimit),
      remaining: isOver ? "0 Bytes" : formatBytes(remaining),
      pct: Math.round(Math.min(pct, 100) * 100) / 100,
      isOver,
      isNear: pct >= 80,
      isCritical: pct >= 95,
    };
  }, [maxStorageLimit, usedStorageLimit]);

  const status = m.isOver || m.isCritical
    ? { chip: "chip-danger", icon: AlertTriangle, msg: "Storage limit exceeded" }
    : m.isNear
    ? { chip: "chip-warning", icon: AlertTriangle, msg: "Storage is nearly full" }
    : { chip: "chip-success", icon: CheckCircle, msg: "Storage is healthy" };

  const StatusIcon = status.icon;

  return (
    <div className="premium-card p-5 sm:p-6" data-testid="storage-usage-card">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-4.5 h-4.5 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Storage usage
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{status.msg}</span>
            </p>
          </div>
        </div>
        <span className={`chip ${status.chip}`}>{m.pct}% used</span>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-2xl font-bold text-[var(--text-primary)]">
            {m.used}
          </span>
          <span className="text-sm text-[var(--text-subtle)] font-medium">
            of {m.max}
          </span>
        </div>
        <div className="w-full bg-[var(--surface-3)] rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(m.pct, 100)}%`,
              background: m.isOver || m.isCritical
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : m.isNear
                ? "linear-gradient(90deg, #f59e0b, #d97706)"
                : "linear-gradient(90deg, #6366f1, #06b6d4)",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl border border-[var(--border)] p-3 bg-[var(--surface-2)]">
          <p className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.08em]">
            Used
          </p>
          <p className="text-base font-bold text-[var(--text-primary)] mt-1">
            {m.used}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] p-3 bg-[var(--surface-2)]">
          <p className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.08em]">
            Available
          </p>
          <p className="text-base font-bold text-[var(--text-primary)] mt-1">
            {m.remaining}
          </p>
        </div>
      </div>

      {(m.isNear || m.isOver) && (
        <button
          onClick={() => navigate("/plans")}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl premium-button-primary text-sm"
        >
          Upgrade your plan
          <ArrowUpRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default StorageUsage;
