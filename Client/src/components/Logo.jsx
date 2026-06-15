import { Cloud } from "lucide-react";

export function Logo({ size = "md" }) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };
  const iconSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };
  return (
    <div
      className={`${sizes[size]} relative rounded-[10px] flex items-center justify-center text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.55)]`}
      style={{
        background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)",
      }}
      data-testid="brand-logo"
    >
      <Cloud className={iconSize[size]} strokeWidth={2.4} fill="rgba(255,255,255,0.18)" />
      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--surface)]" />
    </div>
  );
}

export function Wordmark({ size = "md", variant = "default" }) {
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const titleColor =
    variant === "light"
      ? "text-white"
      : "text-[var(--text-primary)]";
  const subtitleColor =
    variant === "light" ? "text-white/60" : "text-[var(--text-muted)]";
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={size} />
      <div className="leading-tight">
        <span
          className={`block ${textSize} font-bold tracking-tight ${titleColor}`}
          style={{ letterSpacing: "-0.02em" }}
        >
          Ragesto
        </span>
        {size === "lg" && (
          <span
            className={`text-[11px] font-medium ${subtitleColor} tracking-wider uppercase`}
          >
            Cloud storage
          </span>
        )}
      </div>
    </div>
  );
}
