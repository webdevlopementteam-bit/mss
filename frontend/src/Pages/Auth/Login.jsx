import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import * as authService from "../../api/authService";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "./AuthShell";
import AuthInput from "./AuthInput";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const redirectAfterLogin = (user) => {
    if (!user.profileCompleted && user.role !== "admin") {
      navigate("/user-dashboard/profile");
      return;
    }
    const from = location.state?.from?.pathname;
    navigate(from || "/user-dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.login(formData);
      login(data);
      toast.success("Login successful");
      redirectAfterLogin(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your account"
      footer={
        <p className="text-sm text-[#64748b]">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-primaryColor font-semibold">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon="fa-user"
          name="identifier"
          placeholder="Email or Mobile Number"
          value={formData.identifier}
          onChange={handleChange}
          required
        />

        <AuthInput
          icon="fa-lock"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="text-right -mt-1">
          <Link to="/forgot-password" className="text-sm text-primaryColor font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primaryColor hover:bg-[#9c1e22] transition-colors text-white py-[14px] rounded-2xl font-semibold text-[15px] disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
