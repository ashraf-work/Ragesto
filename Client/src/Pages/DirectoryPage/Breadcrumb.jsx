import { ChevronLeft, ChevronRight, Home, MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useDirectory from "../../hooks/useDirectory";

const Breadcrumb = ({ breadCrumb }) => {
  const { dirId } = useDirectory();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  if (!breadCrumb?.length) return null;

  const currentItem = breadCrumb[breadCrumb.length - 1];
  const parentItem =
    breadCrumb.length > 1 ? breadCrumb[breadCrumb.length - 2] : null;
  const isAtRoot = breadCrumb.length <= 1;

  const handleBack = () => {
    if (parentItem) {
      navigate(parentItem._id ? `/directory/${parentItem._id}` : "/");
    } else {
      navigate("/");
    }
  };

  return (
    <nav
      className="flex items-center text-sm text-[var(--text-muted)]"
      data-testid="breadcrumb"
    >
      {/* Mobile */}
      <div className="flex items-center justify-between w-full sm:hidden">
        <div className="flex items-center min-w-0 flex-1">
          {!isAtRoot && (
            <button
              onClick={handleBack}
              className="flex items-center p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition mr-1.5"
              title="Go back"
              data-testid="breadcrumb-back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center min-w-0 flex-1">
            {isAtRoot ? (
              <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)] truncate">
                <Home className="w-3.5 h-3.5" />
                My Drive
              </span>
            ) : (
              <span className="font-semibold text-[var(--text-primary)] truncate">
                {currentItem?.name}
              </span>
            )}
          </div>
        </div>
        {breadCrumb.length > 1 && (
          <div className="relative ml-2">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition"
              title="Full path"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-9 premium-panel py-1.5 z-20 min-w-[220px] max-w-[280px] overflow-hidden">
                  <div className="px-3 py-2 text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-[0.12em] border-b border-[var(--border-subtle)]">
                    Path
                  </div>
                  {breadCrumb.map((item, index) => (
                    <button
                      key={item._id || index}
                      onClick={() => {
                        if (dirId !== item._id) {
                          navigate(
                            index === 0 ? `/` : `/directory/${item._id}`
                          );
                        }
                        setShowDropdown(false);
                      }}
                      disabled={dirId === item._id}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                        dirId === item._id
                          ? "text-[var(--text-primary)] font-semibold bg-[var(--primary-softer)]"
                          : "text-[var(--text-muted)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {index === 0 && <Home className="w-3 h-3" />}
                      <span className="truncate">
                        {index === 0 ? "My Drive" : item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-1 min-w-0 flex-1 flex-wrap">
        <button
          onClick={() => navigate(`/`)}
          disabled={!dirId}
          data-testid="breadcrumb-home"
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition ${
            !dirId
              ? "text-[var(--text-primary)] font-semibold cursor-default"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span className="font-medium">My Drive</span>
        </button>

        {breadCrumb.slice(1).map((item, index) => (
          <React.Fragment key={item._id || index}>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-subtle)] flex-shrink-0" />
            <button
              onClick={() =>
                dirId !== item._id && navigate(`/directory/${item._id}`)
              }
              disabled={dirId === item._id}
              className={`px-2 py-1 rounded-lg transition truncate max-w-[180px] ${
                dirId === item._id
                  ? "text-[var(--text-primary)] font-semibold cursor-default"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
              }`}
              title={item.name}
            >
              <span className="font-medium">{item.name}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
