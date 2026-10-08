import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Mail, Lock } from "lucide-react";
import logo from "../assets/logo.png";
import { getTheme, toggleTheme as switchTheme } from "../utils/theme";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(getTheme());

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleTheme = () => setTheme(switchTheme());

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

  const inputCls =
    "w-full h-12 pl-11 pr-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border-strong)] text-[var(--text)] focus:outline-none transition";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg)]">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[var(--sidebar)] p-12">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#338779]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-[#b52327]/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl bg-[#fff] flex items-center justify-center">
            <img src={logo} alt="MSS" className="w-9" />
          </span>
          <div>
            <p className="text-lg font-bold text-[#fff]">MSS Admin</p>
            <p className="text-xs text-[var(--sidebar-muted)]">Medical & Surgical Solutions</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight text-[#fff]">
            Manage your store
            <br />
            with confidence.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--sidebar-text)]">
            Products, orders, customers and website content — everything for Medical & Surgical Solutions in one place.
          </p>
        </div>

        <p className="relative text-xs text-[var(--sidebar-muted)]">© {new Date().getFullYear()} Medical & Surgical Solutions</p>
      </div>

      {/* Form */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <button
          type="button"
          onClick={toggleTheme}
          title="Toggle theme"
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--text)] shadow-sm"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <span className="w-11 h-11 rounded-xl bg-[#fff] border border-[var(--border)] flex items-center justify-center">
              <img src={logo} alt="MSS" className="w-8" />
            </span>
            <p className="text-lg font-bold text-[var(--text)]">MSS Admin</p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--text)]">Welcome back</h2>
          <p className="mt-1.5 text-sm text-[var(--text-3)]">Sign in to your admin account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label">Email or mobile number</label>
              <div className="relative mt-1.5">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
                <input
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative mt-1.5">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[#fff] font-semibold shadow-[0_10px_25px_-10px_var(--primary)] transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
