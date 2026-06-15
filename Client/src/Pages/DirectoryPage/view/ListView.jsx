import { useRef } from "react";
import { MoreVertical } from "lucide-react";
import {
  formatDate,
  formatFileSize,
  getFileIcon,
} from "../../../Utils/helpers";
import { DropdownMenu } from "../Dropdown";

const ListView = ({
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
      className="group premium-card transition-all duration-200"
      data-testid={`list-item-${item.name}`}
    >
      <div className="flex items-center gap-3 p-3 sm:p-3.5">
        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 text-left cursor-pointer"
        >
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isFolder
                ? "bg-[var(--primary-soft)]"
                : "bg-[var(--surface-3)] group-hover:bg-[var(--surface-tint)]"
            }`}
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <div className="scale-110">{getFileIcon(item, "list")}</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {item.name}
              </h3>
              <span className="chip !py-0.5 !px-1.5 text-[10px] hidden sm:inline-flex">
                {isFolder
                  ? "Folder"
                  : item.name.split(".").pop()?.toUpperCase() || "File"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="font-medium">
                {isFolder ? "—" : formatFileSize(item.size)}
              </span>
              <span className="text-[var(--text-subtle)] hidden sm:inline">
                ·
              </span>
              <span className="hidden sm:inline">
                {formatDate(item.updatedAt)}
              </span>
            </div>
          </div>
        </button>

        <div className="flex-shrink-0 relative">
          <button
            ref={menuButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(activeDropdown === item._id ? null : item._id);
            }}
            data-testid={`list-item-menu-${item.name}`}
            className="p-2 rounded-lg hover:bg-[var(--surface-3)] transition"
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
      </div>
    </div>
  );
};

export default ListView;
