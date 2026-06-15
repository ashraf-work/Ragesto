import { CheckCircle2, Cloud, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Wordmark } from "./Logo";

const features = [
  {
    icon: ShieldCheck,
    title: "Enterprise-grade security",
    description: "End-to-end encryption, OTP verification & role-based sharing.",
  },
  {
    icon: Cloud,
    title: "AWS S3 backed storage",
    description: "Reliable cloud infrastructure with CloudFront CDN delivery.",
  },
  {
    icon: Sparkles,
    title: "Import from Google Drive",
    description: "Migrate your files with a single click — no manual uploads.",
  },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg)]">
      {/* LEFT — Brand showcase (desktop) */}
      <aside
        className="hidden lg:flex lg:w-[44%] xl:w-[40%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "radial-gradient(900px 600px at 10% -10%, rgba(124, 58, 237, 0.35), transparent 60%), radial-gradient(700px 500px at 110% 110%, rgba(6, 182, 212, 0.28), transparent 55%), linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
        }}
      >
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "26px 26px",
          }}
        />

        {/* Floating cards illustration */}
        <div className="absolute right-[-80px] top-[80px] w-[360px] h-[460px] pointer-events-none">
          <div
            className="absolute top-0 right-0 w-64 h-32 rounded-2xl backdrop-blur-md border border-white/15 p-4 shadow-2xl rotate-[8deg]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Cloud className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">Project_Alpha.zip</div>
                <div className="text-white/60 text-[10px]">128 MB · Encrypted</div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full" />
            </div>
          </div>
          <div
            className="absolute top-[200px] right-[40px] w-72 h-32 rounded-2xl backdrop-blur-md border border-white/15 p-4 shadow-2xl rotate-[-4deg]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <div className="text-white text-xs font-semibold">All synced</div>
                <div className="text-white/60 text-[10px]">2.4 TB of 5 TB used</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-2 bg-white/12 rounded" />
              <div className="h-2 bg-white/12 rounded" />
              <div className="h-2 bg-white/10 rounded" />
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <Wordmark size="lg" variant="light" />
        </div>

        <div className="relative z-10 max-w-md">
          <span
            className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-white/70 mb-4"
          >
            Your cloud, your rules
          </span>
          <h1
            className="text-4xl xl:text-5xl font-bold text-white mb-5 leading-[1.05]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Store, share &amp;{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #a5b4fc, #67e8f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ship faster
            </span>
            <br />
            with confidence.
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md">
            A modern cloud storage workspace built for individuals, teams &amp;
            creators who care about speed and security.
          </p>

          <div className="space-y-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">
                      {feat.title}
                    </div>
                    <div className="text-white/60 text-xs">
                      {feat.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-white/55 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>SOC 2 ready · GDPR compliant · 256-bit encryption</span>
        </div>
      </aside>

      {/* RIGHT — Form area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Wordmark size="md" />
          </div>

          <div className="mb-8 text-center lg:text-left animate-fade-up">
            <h2
              className="text-3xl sm:text-[34px] font-bold text-[var(--text-primary)] mb-2"
              style={{ letterSpacing: "-0.025em" }}
            >
              {title}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">{subtitle}</p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
