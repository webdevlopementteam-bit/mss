import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Tag,
  SlidersHorizontal,
  Building2,
  ShoppingCart,
  Users,
  TicketPercent,
  Star,
  MapPin,
  Newspaper,
  Award,
  Palette,
  ExternalLink,
  LogOut,
} from "lucide-react";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const STORE_URL = import.meta.env.VITE_STORE_URL || "http://localhost:5174";

const SECTIONS = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", path: "/", icon: LayoutDashboard, end: true }],
  },
  {
    title: "Catalog",
    items: [
      { name: "Products", path: "/products", icon: Package },
      { name: "Categories", path: "/categories", icon: FolderTree },
      { name: "Subcategories", path: "/subcategories", icon: Layers },
      { name: "Brands", path: "/brands", icon: Tag },
      { name: "Attributes", path: "/attributes", icon: SlidersHorizontal },
      { name: "Company", path: "/company", icon: Building2 },
    ],
  },
  {
    title: "Sales",
    items: [
      { name: "Orders", path: "/orders", icon: ShoppingCart },
      { name: "Customers", path: "/customers", icon: Users },
      { name: "Coupons", path: "/coupons", icon: TicketPercent },
      { name: "Ratings", path: "/ratings", icon: Star },
      { name: "Pincode", path: "/pincode", icon: MapPin },
    ],
  },
  {
    title: "Content",
    items: [
      { name: "Blog", path: "/blog", icon: Newspaper },
      { name: "Award", path: "/award", icon: Award },
      { name: "Store Customization", path: "/store-customization", icon: Palette },
    ],
  },
];

const linkClass = ({ isActive }) =>
  `group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors ${
    isActive
      ? "bg-white/[0.09] text-[#fff]"
      : "text-[var(--sidebar-text)] hover:bg-white/[0.05] hover:text-[#fff]"
  }`;

export default function Sidebar() {
  const { user } = useAuth();
  const name = user?.name || user?.fullName || "Admin";
  const sub = user?.email || user?.role || "Administrator";

  return (
    <aside className="admin-sidebar h-screen w-64 fixed left-0 top-0 z-40 flex flex-col bg-[var(--sidebar)] border-r border-black/20">
      {/* Brand */}
      <div className="h-16 shrink-0 flex items-center gap-3 px-5 border-b border-white/[0.06]">
        <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <img src={logo} alt="MSS" className="w-8 object-contain" />
        </span>
        <div className="leading-tight">
          <p className="text-[15px] font-bold text-[#fff]">MSS Admin</p>
          <p className="text-[11px] text-[var(--sidebar-muted)]">Medical & Surgical Solutions</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 admin-sidebar-scroll">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[var(--sidebar-muted)]">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const { name: label, path, end } = item;
                const Icon = item.icon;
                return (
                <NavLink key={path} to={path} end={end} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--primary)]" />}
                      <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? "text-[#fff]" : "text-[var(--sidebar-muted)] group-hover:text-[#fff]"} />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
                );
              })}
              {section.title === "Content" && (
                <a
                  href={STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-[var(--sidebar-text)] hover:bg-white/[0.05] hover:text-[#fff] transition-colors"
                >
                  <ExternalLink size={17} strokeWidth={1.8} className="text-[var(--sidebar-muted)] group-hover:text-[#fff]" />
                  <span>View Store</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="shrink-0 p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 rounded-xl bg-[var(--sidebar-2)] p-2.5">
          <span className="w-9 h-9 rounded-lg bg-[var(--primary)] flex items-center justify-center text-sm font-bold text-[#fff]">
            {String(name).charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[#fff] truncate">{name}</p>
            <p className="text-[11px] text-[var(--sidebar-muted)] truncate">{sub}</p>
          </div>
          <button
            type="button"
            title="Log out"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sidebar-muted)] hover:bg-white/[0.1] hover:text-[#fff] transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
