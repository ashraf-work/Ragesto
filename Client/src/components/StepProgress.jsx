import { Check } from "lucide-react";

export default function StepProgress({ currentStep }) {
  const steps = [
    { key: "credentials", label: "Details" },
    { key: "otp", label: "Verify" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center mb-6" data-testid="step-progress">
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const isComplete = idx < currentIndex;
          const isActive = idx === currentIndex;
          return (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isComplete
                    ? "bg-[var(--success-soft)] text-[var(--success-strong)] border border-[rgba(16,185,129,0.2)]"
                    : isActive
                    ? "bg-[var(--primary)] text-white shadow-[0_4px_12px_-4px_rgba(79,70,229,0.5)]"
                    : "bg-[var(--surface-3)] text-[var(--text-subtle)] border border-[var(--border)]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isComplete
                      ? "bg-[var(--success)] text-white"
                      : isActive
                      ? "bg-white/25 text-white"
                      : "bg-white/0 text-[var(--text-subtle)]"
                  }`}
                >
                  {isComplete ? <Check className="w-3 h-3" /> : idx + 1}
                </span>
                <span>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-6 h-px transition-colors duration-300 ${
                    isComplete ? "bg-[var(--success)]" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
