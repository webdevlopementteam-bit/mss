import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import response from "../utils/response.js";
import { generateOtp, getOtpExpiry, isOtpValid } from "../utils/otp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  ACCESS_TOKEN_EXPIRY_SECONDS,
} from "../utils/generateTokens.js";
import {
  sendVerificationOtpEmail,
  sendResendOtpEmail,
  sendForgotPasswordOtpEmail,
} from "../utils/sendEmail.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";

const sanitize = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.emailVerificationOTP;
  delete obj.emailVerificationOTPExpiry;
  delete obj.resetPasswordOTP;
  delete obj.resetPasswordOTPExpiry;
  delete obj.__v;
  return obj;
};

const issueTokens = (res, user) => {
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);
  return token;
};

// Flat response shape (not the generic response.success envelope) — the admin panel's
// pre-existing login page reads res.data.token/res.data.user directly, so every endpoint
// that logs a user in (google/verify-email-otp/login) must keep returning this exact shape.
const sendAuthResponse = (res, user, token, message = "Login successful") => {
  return res.status(200).json({
    success: true,
    message,
    token,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    user: sanitize(user),
  });
};

/* ==========================================
   GOOGLE OAUTH LOGIN / SIGNUP
========================================== */
export const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return response.error(res, "idToken is required", 400);
  }

  let payload;
  try {
    payload = await verifyGoogleToken(idToken);
  } catch (err) {
    return response.error(res, "Invalid Google token", 401);
  }

  const { sub, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });

  if (user) {
    if (!user.isActive) {
      return response.error(res, "Account disabled", 403);
    }
    if (!user.googleId) user.googleId = sub;
    if (!user.profileImage) user.profileImage = picture;
    user.emailVerified = true;
    await user.save();
  } else {
    user = await User.create({
      googleId: sub,
      email,
      name,
      authProvider: "google",
      emailVerified: true,
      profileImage: picture,
      profileCompleted: false,
      role: "user",
    });
  }

  const token = issueTokens(res, user);

  return sendAuthResponse(res, user, token);
});

/* ==========================================
   EMAIL + PASSWORD SIGNUP
========================================== */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });

  if (existing && existing.password) {
    return response.error(res, "Email already registered", 409);
  }
  if (existing && existing.authProvider === "google" && !existing.password) {
    return response.error(
      res,
      "This email is registered with Google. Please use Continue with Google.",
      409
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpExpiry = getOtpExpiry(10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: "email",
    emailVerified: false,
    emailVerificationOTP: otp,
    emailVerificationOTPExpiry: otpExpiry,
    role: "user",
  });

  await sendVerificationOtpEmail(user.email, otp);

  return response.success(
    res,
    { email: user.email },
    "OTP sent to your email",
    201
  );
});

/* ==========================================
   VERIFY EMAIL OTP (completes signup, logs in)
========================================== */
export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return response.error(res, "User not found", 404);
  }

  if (
    !isOtpValid(user.emailVerificationOTP, user.emailVerificationOTPExpiry, otp)
  ) {
    return response.error(res, "Invalid or expired OTP", 400);
  }

  user.emailVerified = true;
  user.emailVerificationOTP = undefined;
  user.emailVerificationOTPExpiry = undefined;
  await user.save();

  const token = issueTokens(res, user);

  return sendAuthResponse(res, user, token, "Email verified successfully");
});

/* ==========================================
   RESEND OTP (verify or reset)
========================================== */
export const resendOtp = asyncHandler(async (req, res) => {
  const { email, purpose } = req.body;

  if (!["verify", "reset"].includes(purpose)) {
    return response.error(res, "Invalid purpose", 400);
  }

  const user = await User.findOne({ email });

  if (purpose === "verify") {
    if (!user) {
      return response.error(res, "User not found", 404);
    }
    if (user.emailVerified) {
      return response.error(res, "Email already verified", 400);
    }
    const otp = generateOtp();
    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpiry = getOtpExpiry(10);
    await user.save();
    await sendResendOtpEmail(user.email, otp);
    return response.success(res, {}, "OTP resent to your email");
  }

  // purpose === "reset" — always respond generically to avoid user enumeration
  if (user && user.authProvider === "email") {
    const otp = generateOtp();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = getOtpExpiry(10);
    await user.save();
    await sendResendOtpEmail(user.email, otp);
  }
  return response.success(res, {}, "If that email exists, a new code has been sent");
});

/* ==========================================
   EMAIL + PASSWORD LOGIN
========================================== */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password) {
    return response.error(res, "Invalid email or password", 401);
  }

  if (!user.isActive) {
    return response.error(res, "Account disabled", 403);
  }

  if (user.authProvider === "email" && !user.emailVerified) {
    return response.error(res, "Please verify your email first", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return response.error(res, "Invalid email or password", 401);
  }

  const token = issueTokens(res, user);

  return sendAuthResponse(res, user, token);
});

/* ==========================================
   FORGOT PASSWORD — send reset OTP
========================================== */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user && user.authProvider === "email") {
    const otp = generateOtp();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpiry = getOtpExpiry(10);
    await user.save();
    await sendForgotPasswordOtpEmail(user.email, otp);
  }

  return response.success(
    res,
    {},
    "If that email exists, a reset code has been sent"
  );
});

/* ==========================================
   VERIFY RESET OTP — issues a short-lived reset token
========================================== */
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || !isOtpValid(user.resetPasswordOTP, user.resetPasswordOTPExpiry, otp)) {
    return response.error(res, "Invalid or expired OTP", 400);
  }

  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpiry = undefined;
  await user.save();

  const resetToken = jwt.sign(
    { id: user._id, purpose: "password_reset" },
    process.env.JWT_RESET_SECRET,
    { expiresIn: "10m" }
  );

  return response.success(res, { resetToken }, "OTP verified");
});

/* ==========================================
   RESET PASSWORD
========================================== */
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_RESET_SECRET);
  } catch (err) {
    return response.error(res, "Invalid or expired reset session", 401);
  }

  if (payload.purpose !== "password_reset") {
    return response.error(res, "Invalid reset token", 401);
  }

  const user = await User.findById(payload.id);
  if (!user) {
    return response.error(res, "User not found", 404);
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return response.success(res, {}, "Password updated successfully");
});

/* ==========================================
   REFRESH ACCESS TOKEN
========================================== */
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return response.error(res, "Not authenticated", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    clearRefreshTokenCookie(res);
    return response.error(res, "Session expired, please log in again", 401);
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) {
    clearRefreshTokenCookie(res);
    return response.error(res, "Session expired, please log in again", 401);
  }

  const newAccessToken = generateAccessToken(user);

  return response.success(res, {
    token: newAccessToken,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
  });
});

/* ==========================================
   LOGOUT
========================================== */
export const logout = asyncHandler(async (req, res) => {
  clearRefreshTokenCookie(res);
  return response.success(res, {}, "Logged out successfully");
});

/* ==========================================
   GET CURRENT USER
========================================== */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return response.error(res, "User not found", 404);
  }

  return response.success(res, sanitize(user));
});

/* ==========================================
   UPDATE PROFILE (existing UserDashboard profile form)
========================================== */
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    phone,
    organisation,
    address,
    city,
    state,
    zip,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      firstName,
      lastName,
      phone,
      organisation,
      address,
      city,
      state,
      zip,
      profileCompleted: true,
    },
    { new: true }
  );

  if (!user) {
    return response.error(res, "User not found", 404);
  }

  return response.success(res, sanitize(user), "Profile updated successfully");
});

/* ==========================================
   GET ALL USERS (admin — search, filter, pagination)
========================================== */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    search,
    authProvider,
    profileCompleted,
    emailVerified,
    page = 1,
    limit = 10,
  } = req.query;

  const filter = { role: "user" };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (authProvider) filter.authProvider = authProvider;
  if (profileCompleted !== undefined) {
    filter.profileCompleted = profileCompleted === "true";
  }
  if (emailVerified !== undefined) {
    filter.emailVerified = emailVerified === "true";
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  return response.success(res, {
    users,
    page: pageNum,
    limit: limitNum,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limitNum),
  });
});

/* ==========================================
   GET SINGLE USER
========================================== */
export const getSingleUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return response.error(res, "User not found", 404);
  }

  return response.success(res, sanitize(user));
});

/* ==========================================
   UPDATE USER ROLE
========================================== */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role, permissions } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return response.error(res, "User not found", 404);
  }

  if (user.permissions.includes("create_admin")) {
    return response.error(res, "Super admin cannot be modified", 403);
  }

  if (role) user.role = role;
  if (permissions) user.permissions = permissions;

  await user.save();

  return response.success(res, user);
});

/* ==========================================
   ENABLE / DISABLE USER
========================================== */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return response.error(res, "User not found", 404);
  }

  user.isActive = !user.isActive;
  await user.save();

  return response.success(
    res,
    {},
    `User ${user.isActive ? "enabled" : "disabled"} successfully`
  );
});

/* ==========================================
   DELETE USER
========================================== */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return response.error(res, "User not found", 404);
  }

  await user.deleteOne();

  return response.success(res, {}, "User deleted successfully");
});
