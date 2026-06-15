import { ArrowLeft, MailCheck, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

export default function OTPForm({
  formData,
  handleChange,
  handleBackToCredentials,
  handleResendOTP,
  loading,
}) {
  const inputRef = useRef(null);
  const isTestEmail = formData.email === "test@gmail.com";

  useEffect(() => {
    inputRef.current?.focus();
    if (formData.email === "test@gmail.com") {
      handleChange({
        target: { name: "otp", value: "9999" },
      });
    }
  }, []);

  return (
    <>
      <div className="flex items-start gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--primary-softer)]">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center">
          <MailCheck className="w-4 h-4" />
        </div>
        <div className="text-sm">
          <p className="text-[var(--text-secondary)] mb-0.5">
            We sent a 4-digit code to
          </p>
          <p className="font-semibold text-[var(--text-primary)] break-all">
            {formData.email}
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="otp"
          className="flex items-center justify-between text-sm font-semibold text-[var(--text-secondary)] mb-2"
        >
          <span>Verification code</span>
          {isTestEmail && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--warning-strong)] bg-[var(--warning-soft)] px-2 py-0.5 rounded-full border border-[rgba(245,158,11,0.25)]">
              <Sparkles className="w-3 h-3" /> TEST · 9999
            </span>
          )}
        </label>
        <input
          ref={inputRef}
          id="otp"
          type="text"
          name="otp"
          placeholder="• • • •"
          value={formData.otp}
          onChange={handleChange}
          maxLength="4"
          data-testid="otp-input"
          className="premium-input w-full px-4 py-4 rounded-xl text-center text-2xl font-bold tracking-[0.8em] pl-9"
          style={{ caretColor: "var(--primary)" }}
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <button
          type="button"
          onClick={handleBackToCredentials}
          data-testid="otp-back-btn"
          className="inline-flex items-center gap-1.5 font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={loading}
          data-testid="otp-resend-btn"
          className="inline-flex items-center gap-1.5 font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] disabled:opacity-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Resend code
        </button>
      </div>
    </>
  );
}
