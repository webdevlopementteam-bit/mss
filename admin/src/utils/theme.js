// Single source of truth for the admin colour theme. The CSS reads
// html[data-theme="light" | "dark"] (see styles/theme.css); the `dark` class
// is kept in sync for any Tailwind `dark:` utilities.
const KEY = "theme";

export const getTheme = () => (localStorage.getItem(KEY) === "light" ? "light" : "dark");

export const setTheme = (theme) => {
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.classList.toggle("dark", t === "dark");
  localStorage.setItem(KEY, t);
  window.dispatchEvent(new CustomEvent("themechange", { detail: t }));
  return t;
};

export const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");
