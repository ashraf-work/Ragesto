import { CreditCard, Menu, Share2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useStorage } from "../Contexts/StorageContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Wordmark } from "./Logo";

const NavItem = ({ icon: Icon, label, onClick, active, testId }) => (
  <button
    onClick={onClick}
    data-testid={testId}
    className={`flex items-center gap-2 px-3.5 py-2 rounded-full transition-all duration-200 text-sm font-medium ${
      active
        ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
        : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
    }`}
  >
    <Icon className="w-4 h-4" strokeWidth={2.1} />
    <span>{label}</span>
  </button>
);

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setStorageData } = useStorage();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const initials = user?.name?.charAt(0)?.toUpperCase();

  return (
    <>
      <div
        className={`sticky top-0 left-0 right-0 z-50 premium-nav transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <header className="px-4 sm:px-6 py-3 max-w-7xl mx-auto relative">
          <div className="flex items-center justify-between gap-4">
            {/* LEFT — Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate("/")}
              data-testid="header-logo"
            >
              <Wordmark />
            </div>

            {/* DESKTOP — Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem
                icon={Share2}
                label="Share"
                active={isActive("/share")}
                onClick={() => navigate("/share")}
                testId="nav-share"
              />
              <NavItem
                icon={CreditCard}
                label="Plans"
                active={isActive("/plans")}
                onClick={() => navigate("/plans")}
                testId="nav-plans"
              />
              {user.role !== "User" && (
                <NavItem
                  icon={Users}
                  label="Users"
                  active={isActive("/users")}
                  onClick={() => navigate("/users")}
                  testId="nav-users"
                />
              )}
            </nav>

            {/* RIGHT — Profile */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate("/settings")}
                data-testid="header-profile-btn"
                className="group flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:shadow-sm transition-all duration-200"
              >
                <div
                  className="w-8 h-8 rounded-full overflow-hidden text-white flex items-center justify-center font-semibold text-sm ring-2 ring-white/80"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                  }}
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="text-left leading-tight pr-1">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate max-w-[140px]">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-subtle)] truncate max-w-[140px]">
                    {user?.email}
                  </div>
                </div>
              </button>
            </div>

            {/* MOBILE — Avatar & Menu */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => navigate("/settings")}
                data-testid="header-profile-btn-mobile"
                className="w-9 h-9 rounded-full overflow-hidden text-white flex items-center justify-center font-semibold text-sm shadow-sm ring-2 ring-white/80"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
                }}
              >
                {user.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="header-mobile-menu"
                className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-3)] transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-[var(--text-secondary)]" />
                ) : (
                  <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-3 right-3 mt-2 premium-panel !z-[5000] overflow-hidden animate-fade-up">
              <nav className="px-2 py-2 space-y-0.5">
                <button
                  onClick={() => {
                    navigate("/share");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-3)] transition-colors text-left"
                >
                  <Share2 className="w-5 h-5 text-[var(--text-muted)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Share
                  </span>
                </button>
                <button
                  onClick={() => {
                    navigate("/plans");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-3)] transition-colors text-left"
                >
                  <CreditCard className="w-5 h-5 text-[var(--text-muted)]" />
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    Plans &amp; Pricing
                  </span>
                </button>
                {user.role !== "User" && (
                  <button
                    onClick={() => {
                      navigate("/users");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-3)] transition-colors text-left"
                  >
                    <Users className="w-5 h-5 text-[var(--text-muted)]" />
                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                      Users
                    </span>
                  </button>
                )}
                <div className="mt-2 pt-3 border-t border-[var(--border-subtle)] px-3 pb-1">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-subtle)]">
                    {user?.email}
                  </div>
                </div>
              </nav>
            </div>
          )}
        </header>
      </div>

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
