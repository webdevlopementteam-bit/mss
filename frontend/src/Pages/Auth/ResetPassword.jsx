import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useLocation, Link } from "react-router-dom";
import * as authService from "../../api/authService";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await authService.verifyResetOtp({ email, otp });
      setResetToken(data.data.resetToken);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

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

  if (!email) return null;

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="text-gray-500 mt-2">
            {step === 1
              ? `Enter the code sent to ${email}`
              : "Create your new password"}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
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
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-xl p-3 outline-none"
              minLength={6}
              required
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-xl p-3 outline-none"
              minLength={6}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ResetPassword;
