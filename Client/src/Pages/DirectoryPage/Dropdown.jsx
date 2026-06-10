import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Edit2, Info, Share2, Trash2 } from "lucide-react";

const MENU_WIDTH = 190;
const MENU_GAP = 8;
const VIEWPORT_GAP = 12;

export const DropdownMenu = ({
  item,
  anchorRef,
  setActiveDropdown,
  handleAction,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    function updatePosition() {
      const anchor = anchorRef?.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const menuWidth = Math.min(MENU_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);
      const estimatedHeight = item.type === "file" ? 220 : 140;
      const hasSpaceBelow =
        window.innerHeight - rect.bottom > estimatedHeight + MENU_GAP;
      const top = hasSpaceBelow
        ? rect.bottom + MENU_GAP
        : Math.max(VIEWPORT_GAP, rect.top - estimatedHeight - MENU_GAP);
      const left = Math.min(
        Math.max(VIEWPORT_GAP, rect.right - menuWidth),
        window.innerWidth - menuWidth - VIEWPORT_GAP
      );

      setPosition({ top, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, item.type]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9000]"
        onClick={(e) => {
          e.stopPropagation();
          setActiveDropdown(null);
        }}
      />
      <div
        className="fixed z-[9010] w-[min(190px,calc(100vw-24px))] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => handleAction(e, "details")}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-blue)]"
        >
          <Info className="w-4 h-4" />
          <span>Details</span>
        </button>
        {item.type === "file" && (
          <>
            <button
              onClick={(e) => handleAction(e, "download")}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-blue)]"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={(e) => handleAction(e, "share")}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-blue)]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </>
        )}
        <button
          onClick={(e) => handleAction(e, "rename")}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-blue)]"
        >
          <Edit2 className="w-4 h-4" />
          <span>Rename</span>
        </button>
        <button
          onClick={(e) => handleAction(e, "delete")}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[var(--danger)] transition-colors hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </>,
    document.body
  );
};
