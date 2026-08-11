import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import * as authService from "../../api/authService";
import { isValidMobile, isValidEmail, isValidPassword, PASSWORD_HINT } from "../../utils/validators";
import AuthShell from "./AuthShell";
import AuthInput from "./AuthInput";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!formData.name.trim()) next.name = "Full name is required";
    if (!isValidMobile(formData.mobile)) next.mobile = "Enter a valid 10-digit Indian mobile number";
    if (!isValidEmail(formData.email)) next.email = "Enter a valid email address";
    if (!isValidPassword(formData.password)) next.password = PASSWORD_HINT;
    if (formData.confirmPassword !== formData.password) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await authService.initiateRegistration({
        name: formData.name.trim(),
        mobile: formData.mobile,
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      toast.success(data.message || "OTP sent to your mobile number");
      navigate("/verify-mobile-otp", { state: { mobile: formData.mobile } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register to start ordering medical supplies"
      footer={
        <p className="text-sm text-[#64748b]">
          Already have an account?{" "}
          <Link to="/login" className="text-primaryColor font-semibold">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthInput
          icon="fa-user"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />

        <AuthInput
          icon="fa-mobile-screen"
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          maxLength={10}
          error={errors.mobile}
        />

        <AuthInput
          icon="fa-envelope"
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <AuthInput
          icon="fa-lock"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        {!errors.password && (
          <p className="text-[#94a3b8] text-xs -mt-3 ml-1">{PASSWORD_HINT}</p>
        )}

        <AuthInput
          icon="fa-lock"
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primaryColor hover:bg-[#9c1e22] transition-colors text-white py-[14px] rounded-2xl font-semibold text-[15px] disabled:opacity-70"
        >
          {loading ? "Sending OTP..." : "Register"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Signup;
