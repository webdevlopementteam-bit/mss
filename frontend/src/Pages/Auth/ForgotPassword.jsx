import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import * as authService from "../../api/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.forgotPassword(email);
      toast.success(data.message || "If that email exists, a reset code has been sent");
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Forgot Password</h2>
          <p className="text-gray-500 mt-2">
            Enter your email to receive a reset code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl p-3 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;
