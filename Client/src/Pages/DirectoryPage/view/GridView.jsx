import { useRef } from "react";
import { MoreVertical } from "lucide-react";
import { formatDate, formatFileSize, getFileIcon } from "../../../Utils/helpers";
import { DropdownMenu } from "../Dropdown";

const GridView = ({
  item,
  handleOpen,
  handleAction,
  setActiveDropdown,
  activeDropdown,
}) => {
  const menuButtonRef = useRef(null);
  const isFolder = item.type === "directory";

  return (
    <div
      className="group premium-card overflow-hidden relative"
      data-testid={`grid-item-${item.name}`}
    >
      {/* More button overlay */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <button
          ref={menuButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            setActiveDropdown(activeDropdown === item._id ? null : item._id);
          }}
          data-testid={`grid-item-menu-${item.name}`}
          className="p-1.5 rounded-lg bg-[var(--surface)]/80 backdrop-blur-sm border border-[var(--border)] hover:bg-[var(--surface)] hover:border-[var(--border-strong)] transition opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <MoreVertical className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
        {activeDropdown === item._id && (
          <DropdownMenu
            item={item}
            anchorRef={menuButtonRef}
            setActiveDropdown={setActiveDropdown}
            handleAction={handleAction}
          />
        )}
      </div>

      <button
        type="button"
        onClick={handleOpen}
        className="block w-full text-left p-4 cursor-pointer"
      >
        {/* Thumbnail / icon */}
        <div
          className={`relative aspect-[16/10] mb-3 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${
            isFolder
              ? "bg-gradient-to-br from-[#eef2ff] via-[#f5f3ff] to-[#ecfeff]"
              : "bg-[var(--surface-3)]"
          }`}
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          {/* Decorative pattern for folders */}
          {isFolder && (
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(79,70,229,0.4) 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            />
          )}
          <div className="relative scale-[1.7] transition-transform duration-300 group-hover:scale-[1.85]">
            {getFileIcon(item, "grid")}
          </div>
        </div>

        {/* File info */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">
            {item.name}
          </h3>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="chip !py-0.5 !px-2 text-[10px]">
              {isFolder
                ? "Folder"
                : item.name.split(".").pop()?.toUpperCase() || "File"}
            </span>
            <span className="text-[11px] text-[var(--text-subtle)] font-medium truncate">
              {isFolder ? formatDate(item.updatedAt) : formatFileSize(item.size)}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default GridView;
