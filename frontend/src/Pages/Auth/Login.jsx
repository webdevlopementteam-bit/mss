import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import * as authService from "../../api/authService";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const { data } = await authService.googleLogin(credentialResponse.credential);
      login(data);
      toast.success("Login successful");
      redirectAfterLogin(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Google login failed");
    } finally {
      setLoading(false);
    }
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
      const message = error.response?.data?.message || "Login failed";
      if (message.toLowerCase().includes("verify")) {
        toast.info(message);
        navigate("/verify-email-otp", { state: { email: formData.email } });
        return;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to continue</p>
        </div>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google login failed")}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 outline-none"
            required
          />

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-semibold">
            Create Account
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
