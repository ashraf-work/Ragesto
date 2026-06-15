import { Cloud, ShieldCheck } from "lucide-react";

const AuthLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[var(--bg)]">
      <div className="premium-panel p-8 max-w-sm w-full mx-4 text-center animate-scale-in">
        <div className="relative mx-auto mb-5 w-14 h-14">
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center text-white"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
            }}
          >
            <Cloud className="w-6 h-6" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-[var(--primary-soft)] animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
          Verifying your session
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
          <span>Secure handshake in progress</span>
        </p>
        <div className="flex justify-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0.12s" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0.24s" }} />
        </div>
      </div>
    </div>
  );
};

export default AuthLoader;
