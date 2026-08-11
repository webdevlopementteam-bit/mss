import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import * as authService from "../../api/authService";
import { isValidMobile } from "../../utils/validators";
import AuthShell from "./AuthShell";
import AuthInput from "./AuthInput";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidMobile(mobile)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    try {
      setLoading(true);
      const { data } = await authService.forgotPassword(mobile);
      toast.success(data.message || "If that mobile number exists, a reset code has been sent");
      navigate("/reset-password", { state: { mobile } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your mobile number to receive a reset code"
      footer={
        <p className="text-sm text-[#64748b]">
          Remembered your password?{" "}
          <Link to="/login" className="text-primaryColor font-semibold">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          icon="fa-mobile-screen"
          type="tel"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            setError("");
          }}
          maxLength={10}
          error={error}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primaryColor hover:bg-[#9c1e22] transition-colors text-white py-[14px] rounded-2xl font-semibold text-[15px] disabled:opacity-70"
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
