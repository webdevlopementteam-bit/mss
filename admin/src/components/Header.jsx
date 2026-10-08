import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sun, Moon, ExternalLink, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getTheme, toggleTheme } from "../utils/theme";

const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5174";

// Route → [section, page title] for the header breadcrumb.
const TITLES = {
  "/": ["Overview", "Dashboard"],
  "/products": ["Catalog", "Products"],
  "/categories": ["Catalog", "Categories"],
  "/subcategories": ["Catalog", "Subcategories"],
  "/brands": ["Catalog", "Brands"],
  "/attributes": ["Catalog", "Attributes"],
  "/company": ["Catalog", "Company"],
  "/orders": ["Sales", "Orders"],
  "/customers": ["Sales", "Customers"],
  "/coupons": ["Sales", "Coupons"],
  "/ratings": ["Sales", "Ratings"],
  "/pincode": ["Sales", "Pincode"],
  "/blog": ["Content", "Blog"],
  "/award": ["Content", "Award"],
  "/store-customization": ["Content", "Store Customization"],
};

const titleFor = (pathname) => {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/orders/")) return ["Sales", "Order Details"];
  if (pathname.startsWith("/edit-product")) return ["Catalog", "Edit Product"];
  if (pathname.startsWith("/create-product")) return ["Catalog", "Create Product"];
  return ["Admin", ""];
};

const Header = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [theme, setThemeState] = useState(getTheme());

  useEffect(() => {
    const onChange = (e) => setThemeState(e.detail);
    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);

  const [section, title] = titleFor(pathname);
  const name = user?.name || user?.fullName || "Admin";

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-6 lg:px-8 bg-[var(--surface)] border-b border-[var(--border)]">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-3)]">
          <span>{section}</span>
          {title && <ChevronRight size={12} />}
          {title && <span className="text-[var(--text-2)]">{title}</span>}
        </div>
        <h1 className="text-[17px] font-semibold text-[var(--text)] leading-tight truncate">{title || "Admin"}</h1>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[var(--border)] text-[13px] font-medium text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition"
        >
          <ExternalLink size={15} /> View Store
        </a>

        <button
          type="button"
          onClick={() => setThemeState(toggleTheme())}
          title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <div className="h-6 w-px bg-[var(--border)] mx-1.5" />

        <div className="flex items-center gap-2.5">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-9 h-9 rounded-lg object-cover" />
          ) : (
            <span className="w-9 h-9 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center text-sm font-bold text-[var(--primary)]">
              {String(name).charAt(0).toUpperCase()}
            </span>
          )}
          <div className="hidden sm:block leading-tight">
            <p className="text-[13px] font-semibold text-[var(--text)]">{name}</p>
            <p className="text-[11px] text-[var(--text-3)] capitalize">{user?.role || "Administrator"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
