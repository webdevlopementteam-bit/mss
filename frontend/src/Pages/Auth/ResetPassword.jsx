import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import * as authService from "../../api/authService";
import { isValidPassword, PASSWORD_HINT } from "../../utils/validators";
import AuthShell from "./AuthShell";
import AuthInput from "./AuthInput";

const RESEND_SECONDS = 30;

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile;

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!mobile) {
      navigate("/forgot-password", { replace: true });
    }
  }, [mobile, navigate]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.verifyResetOtp({ mobile, otp });
      setResetToken(data.data.resetToken);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const { data } = await authService.resendPasswordResetOtp(mobile);
      toast.success(data.message || "OTP resent");
      setResendCountdown(RESEND_SECONDS);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const next = {};
    if (!isValidPassword(newPassword)) next.newPassword = PASSWORD_HINT;
    if (newPassword !== confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setLoading(true);
      const { data } = await authService.resetPassword({ resetToken, newPassword });
      toast.success(data.message || "Password updated successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!mobile) return null;

  return (
    <AuthShell
      title="Reset password"
      subtitle={
        step === 1 ? (
          <>
            Enter the code sent to <span className="font-semibold text-[#334155]">{mobile}</span>
          </>
        ) : (
          "Create your new password"
        )
      }
      footer={
        <p className="text-sm text-[#64748b]">
          <Link to="/login" className="text-primaryColor font-semibold">
            Back to login
          </Link>
        </p>
      }
    >
      {step === 1 ? (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <input
            type="text"
            placeholder="• • • • • •"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full border border-[#e2e8f0] bg-[#f8fafc] focus:bg-white focus:border-primaryColor rounded-2xl h-[60px] text-center text-2xl font-semibold tracking-[10px] outline-none transition-colors"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primaryColor hover:bg-[#9c1e22] transition-colors text-white py-[14px] rounded-2xl font-semibold text-[15px] disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Verify Code"}
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
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <AuthInput
            icon="fa-lock"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrors((prev) => ({ ...prev, newPassword: "" }));
            }}
            error={errors.newPassword}
          />
          {!errors.newPassword && (
            <p className="text-[#94a3b8] text-xs -mt-3 ml-1">{PASSWORD_HINT}</p>
          )}

          <AuthInput
            icon="fa-lock"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primaryColor hover:bg-[#9c1e22] transition-colors text-white py-[14px] rounded-2xl font-semibold text-[15px] disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
