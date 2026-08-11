import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import * as authService from "../../api/authService";
import { useAuth } from "../../context/AuthContext";
import AuthShell from "./AuthShell";

const RESEND_SECONDS = 30;
const OTP_VALID_SECONDS = 5 * 60;

const VerifyMobileOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const mobile = location.state?.mobile;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);
  const [expiryCountdown, setExpiryCountdown] = useState(OTP_VALID_SECONDS);

  useEffect(() => {
    if (!mobile) {
      navigate("/signup", { replace: true });
    }
  }, [mobile, navigate]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (expiryCountdown <= 0) return;
    const timer = setInterval(() => setExpiryCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [expiryCountdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.verifyRegistrationOtp({ mobile, otp });
      login(data);
      toast.success("Mobile number verified successfully");
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
      const { data } = await authService.resendRegistrationOtp({ mobile });
      toast.success(data.message || "OTP resent");
      setResendCountdown(RESEND_SECONDS);
      setExpiryCountdown(OTP_VALID_SECONDS);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  if (!mobile) return null;

  return (
    <AuthShell
      title="Verify your mobile"
      subtitle={
        <>
          Enter the 6-digit code sent to <span className="font-semibold text-[#334155]">{mobile}</span>
        </>
      }
    >
      <form onSubmit={handleVerify} className="space-y-5">
        <input
          type="text"
          placeholder="• • • • • •"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="w-full border border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-primaryColor rounded-2xl h-[60px] text-center text-2xl font-semibold tracking-[10px] outline-none transition-colors"
          required
        />

        <p className="text-center text-xs text-[#94a3b8]">
          {expiryCountdown > 0
            ? `Code expires in ${formatTime(expiryCountdown)}`
            : "Code expired — please resend"}
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primaryColor hover:bg-[#9c1e22] transition-colors text-white py-[14px] rounded-2xl font-semibold text-[15px] disabled:opacity-70"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendCountdown > 0 || resending}
          className="w-full text-sm text-primaryColor font-medium disabled:text-[#94a3b8] transition-colors"
        >
          {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : resending ? "Resending..." : "Resend OTP"}
        </button>
      </form>
    </AuthShell>
  );
};

export default VerifyMobileOtp;
