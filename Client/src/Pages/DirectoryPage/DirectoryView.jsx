import { FolderOpen, Search } from "lucide-react";
import { useMemo, useState } from "react";
import FileDetailsModal from "../../components/Modals/FileDetailsModal";
import Breadcrumb from "./Breadcrumb";
import ItemCard from "./ItemCard";
import ToolBar from "./ToolBar";

const DirectoryView = ({
  loading,
  allItems = [],
  breadCrumb,
  activeDropdown,
  setActiveDropdown,
  setActionDone,
  setShowShareModal,
  setCurrentFile,
}) => {
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, item: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("view") || "grid"
  );
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleViewMode = (view) => {
    localStorage.setItem("view", view);
    setViewMode(view);
  };

  const filteredAndSortedItems = useMemo(() => {
    const filtered = allItems.filter((item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const multiplier = sortOrder === "asc" ? 1 : -1;
    const getKey = (item) => {
      switch (sortBy) {
        case "size":
          return item.size ?? 0;
        case "modified":
          return new Date(item.updatedAt ?? 0).getTime();
        default:
          return (item.name ?? "").toLowerCase();
      }
    };

    return [...filtered].sort((a, b) => {
      const aDir = a.type === "directory";
      const bDir = b.type === "directory";
      if (aDir !== bDir) return aDir ? -1 : 1;
      const aKey = getKey(a);
      const bKey = getKey(b);
      if (aKey < bKey) return -1 * multiplier;
      if (aKey > bKey) return 1 * multiplier;
      return 0;
    });
  }, [allItems, searchTerm, sortBy, sortOrder]);

  const handleDetailsOpen = (item) => {
    setDetailsModal({ isOpen: true, item });
  };

  return (
    <div className="min-h-full max-[800px]:pb-28" data-testid="directory-view">
      <div className="space-y-4">
        {/* Breadcrumb + Toolbar */}
        <div className="space-y-3">
          <Breadcrumb breadCrumb={breadCrumb} />
          <ToolBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={handleViewMode}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            itemCount={filteredAndSortedItems.length}
          />
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            All items
            {filteredAndSortedItems.length > 0 && (
              <span className="ml-2 text-sm font-medium text-[var(--text-subtle)]">
                ({filteredAndSortedItems.length})
              </span>
            )}
          </h2>
          {searchTerm && filteredAndSortedItems.length > 0 && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Items Grid/List */}
        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                : "space-y-2"
            }
            data-testid="directory-loading"
          >
            {Array.from({ length: viewMode === "grid" ? 8 : 6 }).map((_, idx) => (
              <div key={idx} className="premium-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl premium-skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 premium-skeleton" />
                    <div className="h-2 w-1/2 premium-skeleton" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedItems.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
                : "space-y-2"
            }
            data-testid="directory-items"
          >
            {filteredAndSortedItems.map((item) => (
              <ItemCard
                key={item._id || item.id}
                item={item}
                viewMode={viewMode}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                setActionDone={setActionDone}
                setShowShareModal={setShowShareModal}
                setCurrentFile={setCurrentFile}
                onDetailsOpen={handleDetailsOpen}
              />
            ))}
          </div>
        ) : (
          <div className="premium-empty text-center py-16 px-6 animate-fade-up" data-testid="directory-empty">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.10))",
                border: "1px solid var(--border)",
              }}
            >
              {searchTerm ? (
                <Search className="w-7 h-7 text-[var(--primary)]" />
              ) : (
                <FolderOpen className="w-7 h-7 text-[var(--primary)]" />
              )}
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">
              {searchTerm ? "No matches found" : "This space is empty"}
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
              {searchTerm
                ? `Try a different keyword or clear the search to see all your files.`
                : "Upload your first file or create a folder to start organising your cloud workspace."}
            </p>
          </div>
        )}

        <FileDetailsModal
          item={detailsModal.item}
          isOpen={detailsModal.isOpen}
          onClose={() => setDetailsModal({ isOpen: false, item: null })}
        />
      </div>
    </div>
  );
};

export default DirectoryView;
