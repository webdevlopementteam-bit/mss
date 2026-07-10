import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import * as authService from "../../api/authService";
import { useAuth } from "../../context/AuthContext";

const RESEND_SECONDS = 60;

const VerifyEmailOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.verifyEmailOtp({ email, otp });
      login(data);
      toast.success("Email verified successfully");
      if (!data.user.profileCompleted) {
        navigate("/user-dashboard/profile");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const { data } = await authService.resendOtp({ email, purpose: "verify" });
      toast.success(data.message || "OTP resent");
      setCountdown(RESEND_SECONDS);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Verify Your Email</h2>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to
            <span className="font-semibold ml-1">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full border rounded-xl p-3 text-center text-xl tracking-[8px] outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="w-full text-sm text-blue-600 disabled:text-gray-400"
          >
            {countdown > 0 ? `Resend OTP in ${countdown}s` : resending ? "Resending..." : "Resend OTP"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default VerifyEmailOtp;
