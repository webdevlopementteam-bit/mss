import { Bell, LayoutGrid, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user } = useAuth(); // ✅ THIS LINE ADD

  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 
    bg-[var(--surface)]/60 backdrop-blur-md 
    flex justify-end items-center px-8 border-b border-white/5">

      <div className="flex items-center gap-5">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification */}
        <button className="relative text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--error)] rounded-full border border-[var(--background)]"></span>
        </button>

        {/* Grid Icon */}
        <button className="text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition">
          <LayoutGrid size={20} />
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-white/10"></div>

        {/* Profile */}
        <div className="flex items-center gap-3">
         {user?.avatar ? (
  <img src={user.avatar} className="w-8 h-8 rounded-full" />
) : (
  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
    A
  </div>
)}
        </div>

      </div>
    </header>
  );
}

export default Header;