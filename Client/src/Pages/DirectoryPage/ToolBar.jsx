import {
  ArrowUpDown,
  ChevronDown,
  Clock,
  Grid3x3,
  HardDrive,
  LayoutGrid,
  List,
  Search,
  SortAsc,
  SortDesc,
  Type,
  X,
} from "lucide-react";
import { useState } from "react";

const ToolBar = ({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  itemCount,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setShowSortDropdown(false);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-testid="toolbar">
      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
        <input
          type="text"
          placeholder="Search files and folders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="toolbar-search-input"
          className="premium-input w-full pl-10 pr-9 py-2.5 rounded-xl text-sm font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            data-testid="toolbar-search-clear"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)] transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center justify-end gap-2">
        {/* View Mode Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-[var(--surface-3)] border border-[var(--border)]" data-testid="toolbar-view-toggle">
          <button
            onClick={() => setViewMode("grid")}
            data-testid="view-grid"
            title="Grid view"
            className={`flex items-center justify-center px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            data-testid="view-list"
            title="List view"
            className={`flex items-center justify-center px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === "list"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            data-testid="toolbar-sort-btn"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl premium-button-secondary text-sm"
          >
            <ArrowUpDown className="w-4 h-4 text-[var(--text-subtle)]" />
            <span className="hidden sm:inline text-[var(--text-secondary)]">Sort:</span>
            <span className="capitalize">{sortBy}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[var(--text-subtle)] transition-transform duration-200 ${
                showSortDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortDropdown(false)}
              />
              <div
                className="absolute right-0 top-full mt-2 premium-panel py-1.5 z-20 min-w-[200px] animate-scale-in overflow-hidden"
                data-testid="sort-dropdown"
              >
                <div className="px-3 py-2 text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-[0.12em] border-b border-[var(--border-subtle)]">
                  Sort by
                </div>
                {[
                  { key: "name", label: "Name", icon: Type },
                  { key: "size", label: "Size", icon: HardDrive },
                  { key: "modified", label: "Modified", icon: Clock },
                ].map((option) => {
                  const Icon = option.icon;
                  const active = sortBy === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => handleSort(option.key)}
                      data-testid={`sort-${option.key}`}
                      className={`w-full px-3 py-2.5 text-left text-sm flex items-center justify-between group transition-colors ${
                        active
                          ? "bg-[var(--primary-softer)] text-[var(--primary-strong)]"
                          : "hover:bg-[var(--surface-3)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Icon
                          className={`w-4 h-4 ${
                            active ? "text-[var(--primary)]" : "text-[var(--text-subtle)]"
                          }`}
                        />
                        {option.label}
                      </span>
                      {active && (
                        <span className="text-[var(--primary)]">
                          {sortOrder === "asc" ? (
                            <SortAsc className="w-4 h-4" />
                          ) : (
                            <SortDesc className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {searchTerm && (
        <div className="w-full sm:hidden -mt-1">
          <p className="text-xs text-[var(--text-muted)]">
            {itemCount} result{itemCount !== 1 ? "s" : ""} for{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              "{searchTerm}"
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ToolBar;
