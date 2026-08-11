import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Box,
  Users,
  ShoppingCart,
  Star,
  ChevronDown,
  LogOut,
} from "lucide-react";

const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5174";
export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // ✅ THIS WAS MISSING
  const isCatalogActive = [
    "/brands",
    "/categories",
    "/subcategories",
    "/products",
    "/attributes",
    "/coupons",
    "/blog",
    "/company",
    "/pincode",
  ].includes(location.pathname);

  const isStoreActive = ["/view-store", "/store-customization"].includes(
    location.pathname,
  );

  const [open, setOpen] = useState(isCatalogActive);
  const [storeOpen, setStoreOpen] = useState(isStoreActive);
  return (
    <aside
      className="h-screen w-64 fixed left-0 top-0 border-r border-white/5 
    bg-[var(--surface)]/80 backdrop-blur-xl flex flex-col py-8 px-4"
    >
      {/* LOGO */}
      <div className="mb-10 px-2">
        <h1 className="text-xl font-bold text-[var(--on-surface)]">
          MSS Admin
        </h1>
        <p className="text-[10px] uppercase font-semibold text-[var(--on-surface-variant)]">
          Premium Management
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto pr-2 space-y-1 custom-scroll">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide
          ${
            isActive("/")
              ? "text-[var(--primary)] bg-[var(--primary)]/10 border-r-2 border-[var(--primary)]"
              : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* Catalog */}
        <div>
          <div
            onClick={() => setOpen(!open)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-[11px] font-semibold uppercase tracking-wide
  ${
    isCatalogActive
      ? "text-[var(--primary)] bg-[var(--primary)]/10 "
      : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
  }`}
          >
            <div className="flex items-center gap-3 text-current">
              <Box size={18} />
              Catalog
            </div>

            <ChevronDown
              size={16}
              className={`text-current transition ${open ? "rotate-180" : ""}`}
            />
          </div>

          {open && (
            <div className="ml-6 mt-2 space-y-1">
              {[
                { name: "Brands", path: "/brands" },
                { name: "Categories", path: "/categories" },
                { name: "Subcategories", path: "/subcategories" },
                { name: "Products", path: "/products" },
                { name: "Attributes", path: "/attributes" },
                { name: "Coupons", path: "/coupons" },
                { name: "Pincode", path: "/pincode" },
                { name: "Award", path: "/award" },
                { name: "Blog", path: "/blog" },
                { name: "Company", path: "/company" },
              ].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-lg text-sm
                  ${
                    isActive(item.path)
                      ? "text-[var(--primary)] bg-[var(--primary)]/10 border-r-2 border-[var(--primary)]"
                      : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
                  }`}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/customers"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide
          ${
            isActive("/customers")
              ? "text-[var(--primary)] bg-[var(--primary)]/10 border-r-2 border-[var(--primary)]"
              : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
          }`}
        >
          <Users size={18} /> Customers
        </NavLink>

        <NavLink
          to="/orders"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide
          ${
            isActive("/orders")
              ? "text-[var(--primary)] bg-[var(--primary)]/10 border-r-2 border-[var(--primary)]"
              : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
          }`}
        >
          <ShoppingCart size={18} /> Orders
        </NavLink>

        <NavLink
          to="/ratings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold uppercase tracking-wide
          ${
            isActive("/ratings")
              ? "text-[var(--primary)] bg-[var(--primary)]/10 border-r-2 border-[var(--primary)]"
              : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
          }`}
        >
          <Star size={18} /> Ratings
        </NavLink>
{/* Store */}
<div>
  <div
    onClick={() => setStoreOpen(!storeOpen)}
    className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-[11px] font-semibold uppercase tracking-wide
    ${
      isStoreActive
        ? "text-[var(--primary)] bg-[var(--primary)]/10 "
        : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
    }`}
  >
    <div className="flex items-center gap-3 text-current">
      <Box size={18} />
      Store
    </div>

    <ChevronDown
      size={16}
      className={`text-current transition ${
        storeOpen ? "rotate-180" : ""
      }`}
    />
  </div>

  {storeOpen && (
    <div className="ml-6 mt-2 space-y-1">

      {/* 🔥 View Store (External Link) */}
      <div
        onClick={() =>
          window.open(
            STORE_URL,
            "_blank"
          )
        }
        className="block px-3 py-2 rounded-lg text-sm cursor-pointer
        text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
      >
        View Store
      </div>

      {/* ✅ Store Customization (Internal Route) */}
      <NavLink
        to="/store-customization"
        className={({ isActive }) =>
          `block px-3 py-2 rounded-lg text-sm ${
            isActive
              ? "text-[var(--primary)] bg-[var(--primary)]/10 border-r-2 border-[var(--primary)]"
              : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)] hover:text-[var(--on-surface)]"
          }`
        }
      >
        Store Customization
      </NavLink>

    </div>
  )}
</div>
      </nav>

      {/* LOGOUT BUTTON (EXACT SAME AS NEW PRODUCT) */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="w-full bg-gradient-to-br 
    from-[var(--primary)] to-[var(--primary-container)] 
    text-black py-3 rounded-xl font-bold text-sm shadow-lg 
    hover:brightness-110 transition"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
