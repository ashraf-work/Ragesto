import { Menu, Share2, Sparkles, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdSubscriptions } from "react-icons/md";
import { useAuth } from "../Contexts/AuthContext";
import { useStorage } from "../Contexts/StorageContext";
import { useNavigate } from "react-router-dom";
import { Logo } from "./Logo";

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setStorageData } = useStorage();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setStorageData({
      maxStorageLimit: user.maxStorageLimit,
      usedStorageLimit: user.usedStorageLimit,
      availableStorageLimit: user.availableStorageLimit,
    });
  }, []);

  useEffect(() => {
    const controlHeader = () => {
      // Only apply scroll behavior on mobile (below md breakpoint)
      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setMobileMenuOpen(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", controlHeader);
    window.addEventListener("resize", controlHeader);

    return () => {
      window.removeEventListener("scroll", controlHeader);
      window.removeEventListener("resize", controlHeader);
    };
  }, [lastScrollY]);

  return (
    <>
      <div
        className={`sticky top-0 left-0 right-0 z-50 premium-nav backdrop-blur-xl transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <header className="px-3 sm:px-5 py-3 sm:py-4 max-w-7xl mx-auto relative">
          <div
            className="flex items-center justify-between"
          >
            {/* LEFT — Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src="./logo.png" className="w-12" alt="Ragesto Logo Image" />
              <div className="leading-tight">
                <span className="block text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  Ragesto
                </span>
              </div>
            </div>

            {/* DESKTOP — Action Buttons */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(253,254,255,0.68)] p-1 shadow-sm">
              <button
                onClick={() => navigate("/plans")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-[var(--surface-blue)] transition-colors text-sm font-medium text-[var(--text-muted)]"
              >
                <MdSubscriptions className="w-4 h-4" />
                <span>Subscription</span>
              </button>

              <button
                onClick={() => navigate("/share")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-[var(--surface-blue)] transition-colors text-sm font-medium text-[var(--text-muted)]"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              {user.role !== "User" && (
                <button
                  onClick={() => navigate("/users")}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-[var(--surface-blue)] transition-colors text-sm font-medium text-[var(--text-muted)]"
                >
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </button>
              )}

              <button
                onClick={() => navigate("/settings")}
                className="flex items-center gap-2 hover:bg-[var(--surface-blue)] px-2.5 py-1.5 rounded-full transition-colors ml-1"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[120px]">
                    {user?.email}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center font-semibold text-sm shadow-md ring-2 ring-white/80">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
              </button>
            </div>

            {/* MOBILE — Menu Toggle & Avatar */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => navigate("/settings")}
                className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center font-semibold text-sm shadow-md ring-2 ring-white/80"
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase()
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] hover:bg-[var(--surface-blue)] transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE MENU - Absolute positioned */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-3 right-3 mt-2 premium-panel !z-[5000] overflow-hidden">
              <nav className="px-3 py-3 space-y-1">
                <button
                  onClick={() => {
                    navigate("/plans");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface-blue)] transition-colors text-left"
                >
                  <MdSubscriptions className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Subscription
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigate("/share");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface-blue)] transition-colors text-left"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    Share
                  </span>
                </button>

                {user.role !== "User" && (
                  <button
                    onClick={() => {
                      navigate("/users");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--surface-blue)] transition-colors text-left"
                  >
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Users
                    </span>
                  </button>
                )}

                <div className="pt-2 border-t border-gray-200 mt-2">
                  <div className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </header>
      </div>

      {/* Backdrop overlay when menu is open */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
