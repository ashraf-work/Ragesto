import { TrendingUp } from "lucide-react";

const Header = () => {
  return (
    <div className="premium-panel p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)] mb-2">
            Collaboration hub
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-primary)]">
            File Sharing Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm">
            Manage your shared files and collaborations seamlessly
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-gray-500">
          <TrendingUp size={14} />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
