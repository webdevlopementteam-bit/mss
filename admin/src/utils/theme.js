export const setTheme = (theme) => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
};

export const getTheme = () => {
  return localStorage.getItem("theme") || "dark";
};

export const toggleTheme = () => {
  const current = getTheme();
  const newTheme = current === "dark" ? "light" : "dark";
  setTheme(newTheme);
  return newTheme;
};