import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState("dark");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      toast.success("Login successful 🚀");

      login(res.data);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4 bg-[var(--bg)]">
      {/* Toggle */}
      <div
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full 
    bg-[var(--card)] border border-[var(--border)] shadow-md cursor-pointer"
      >
        {theme === "dark" ? (
          <Sun size={18} className="text-yellow-400" />
        ) : (
          <Moon size={18} className="text-gray-700" />
        )}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-center text-[var(--text)] mb-2">
          Admin Login
        </h2>

        <p className="text-sm text-[var(--muted)] text-center mb-6">
          Welcome back! Please login to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-transparent border border-[var(--border)] text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
