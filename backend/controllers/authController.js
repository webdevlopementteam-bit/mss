import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import PendingRegistration from "../models/pendingRegistrationModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import response from "../utils/response.js";
import { generateOtp, getOtpExpiry, isOtpValid } from "../utils/otp.js";
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_COOKIE_NAME,
  ADMIN_REFRESH_COOKIE_NAME,
} from "../utils/generateTokens.js";
import { sendOtpSms } from "../utils/fast2sms.js";
import { isValidMobile, isValidEmail, isValidPassword } from "../utils/validators.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;
const MAX_OTP_ATTEMPTS = 5;

const sanitize = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.mobileOTPHash;
  delete obj.resetPasswordOTPHash;
  delete obj.__v;
  return obj;
};

const issueTokens = (res, user) => {
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  // Admins get their own refresh cookie so their session can never collide
  // with a regular customer session in the same browser (see generateTokens.js).
  const cookieName = user.role === "admin" ? ADMIN_REFRESH_COOKIE_NAME : REFRESH_COOKIE_NAME;
  setRefreshTokenCookie(res, refreshToken, cookieName);
  return token;
};

// Flat response shape (not the generic response.success envelope) — the admin panel's
// pre-existing login page reads res.data.token/res.data.user directly, so every endpoint
// that logs a user in (google/register-verify-otp/login) must keep returning this exact shape.
const sendAuthResponse = (res, user, token, message = "Login successful") => {
  return res.status(200).json({
    success: true,
    message,
    token,
    expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    user: sanitize(user),
  });
};

const cooldownRemainingSeconds = (lastSentAt) => {
  if (!lastSentAt) return 0;
  const elapsed = (Date.now() - new Date(lastSentAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed));
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
      profileCompleted: false,
      profileImage: picture,
      role: "user",
    });
  }

  const token = issueTokens(res, user);

  return sendAuthResponse(res, user, token);
});

/* ==========================================
   REGISTRATION — STEP 1: validate + send mobile OTP
   Does NOT create a User yet; data is staged in PendingRegistration.
========================================== */
export const initiateRegistration = asyncHandler(async (req, res) => {
  const { name, mobile, email, password, confirmPassword } = req.body;

  if (!name?.trim()) {
    return response.error(res, "Name is required", 400);
  }
  if (!isValidMobile(mobile)) {
    return response.error(res, "Enter a valid 10-digit Indian mobile number", 400);
  }
  if (!isValidEmail(email)) {
    return response.error(res, "Enter a valid email address", 400);
  }
  if (!isValidPassword(password)) {
    return response.error(
      res,
      "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character",
      400
    );
  }
  if (password !== confirmPassword) {
    return response.error(res, "Passwords do not match", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { mobile }] });
  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      return response.error(res, "Email already registered", 409);
    }
    return response.error(res, "Mobile number already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  await PendingRegistration.findOneAndUpdate(
    { mobile },
    {
      name: name.trim(),
      email: normalizedEmail,
      mobile,
      passwordHash,
      otpHash,
      otpExpiry: getOtpExpiry(OTP_EXPIRY_MINUTES),
      otpAttempts: 0,
      otpLastSentAt: new Date(),
      createdAt: new Date(),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const sms = await sendOtpSms(mobile, otp);
  if (!sms.success) {
    return response.error(res, "Failed to send OTP. Please try again.", 502);
  }

  return response.success(res, { mobile }, "OTP sent to your mobile number", 201);
});

/* ==========================================
   REGISTRATION — STEP 2: verify OTP, create user, auto-login
========================================== */
export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  const pending = await PendingRegistration.findOne({ mobile }).select("+otpHash +passwordHash");

  if (!pending) {
    return response.error(res, "No pending registration found for this mobile number. Please register again.", 404);
  }

  if (pending.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return response.error(res, "Too many incorrect attempts. Please request a new OTP.", 429);
  }

  if (new Date(pending.otpExpiry).getTime() < Date.now()) {
    return response.error(res, "OTP expired. Please request a new one.", 400);
  }

  const isMatch = await bcrypt.compare(otp || "", pending.otpHash);
  if (!isMatch) {
    pending.otpAttempts += 1;
    await pending.save();
    return response.error(res, "Incorrect OTP", 400);
  }

  // Re-check uniqueness to close the race if someone else registered the
  // same email/mobile while this OTP was pending.
  const existingUser = await User.findOne({ $or: [{ email: pending.email }, { mobile: pending.mobile }] });
  if (existingUser) {
    await pending.deleteOne();
    return response.error(res, "This email or mobile number was just registered. Please log in instead.", 409);
  }

  let user;
  try {
    user = await User.create({
      name: pending.name,
      email: pending.email,
      mobile: pending.mobile,
      password: pending.passwordHash,
      authProvider: "email",
      emailVerified: true,
      mobileVerified: true,
      profileCompleted: false,
      role: "user",
    });
  } catch (err) {
    if (err.code === 11000) {
      return response.error(res, "This email or mobile number was just registered. Please log in instead.", 409);
    }
    throw err;
  }

  await pending.deleteOne();

  const token = issueTokens(res, user);

  return sendAuthResponse(res, user, token, "Mobile verified successfully");
});

/* ==========================================
   REGISTRATION — RESEND OTP
========================================== */
export const resendRegistrationOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const pending = await PendingRegistration.findOne({ mobile });
  if (!pending) {
    return response.error(res, "No pending registration found for this mobile number. Please register again.", 404);
  }

  const remaining = cooldownRemainingSeconds(pending.otpLastSentAt);
  if (remaining > 0) {
    return response.error(res, `Please wait ${remaining}s before requesting another OTP`, 429);
  }

  const otp = generateOtp();
  pending.otpHash = await bcrypt.hash(otp, 10);
  pending.otpExpiry = getOtpExpiry(OTP_EXPIRY_MINUTES);
  pending.otpAttempts = 0;
  pending.otpLastSentAt = new Date();
  await pending.save();

  const sms = await sendOtpSms(mobile, otp);
  if (!sms.success) {
    return response.error(res, "Failed to send OTP. Please try again.", 502);
  }

  return response.success(res, {}, "OTP resent to your mobile number");
});

/* ==========================================
   LOGIN — identifier (email or mobile) + password
========================================== */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  const query = isValidEmail(identifier)
    ? { email: identifier.trim().toLowerCase() }
    : { mobile: identifier?.trim() };

  const user = await User.findOne(query).select("+password");

  if (!user || !user.password) {
    return response.error(res, "Invalid credentials", 401);
  }

  if (!user.isActive) {
    return response.error(res, "Account disabled", 403);
  }

  const isMatch = await bcrypt.compare(password || "", user.password);
  if (!isMatch) {
    return response.error(res, "Invalid credentials", 401);
  }

  const token = issueTokens(res, user);

  return sendAuthResponse(res, user, token);
});

/* ==========================================
   FORGOT PASSWORD — send reset OTP to mobile
========================================== */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile });

  // Always respond generically to avoid user enumeration.
  if (user) {
    const remaining = cooldownRemainingSeconds(user.resetPasswordOTPLastSentAt);
    if (remaining <= 0) {
      const otp = generateOtp();
      user.resetPasswordOTPHash = await bcrypt.hash(otp, 10);
      user.resetPasswordOTPExpiry = getOtpExpiry(OTP_EXPIRY_MINUTES);
      user.resetPasswordOTPAttempts = 0;
      user.resetPasswordOTPLastSentAt = new Date();
      await user.save();
      await sendOtpSms(mobile, otp);
    }
  }

  return response.success(res, {}, "If that mobile number is registered, a reset code has been sent");
});

/* ==========================================
   FORGOT PASSWORD — resend OTP
========================================== */
export const resendPasswordResetOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile });
  if (user) {
    const remaining = cooldownRemainingSeconds(user.resetPasswordOTPLastSentAt);
    if (remaining > 0) {
      return response.error(res, `Please wait ${remaining}s before requesting another OTP`, 429);
    }
    const otp = generateOtp();
    user.resetPasswordOTPHash = await bcrypt.hash(otp, 10);
    user.resetPasswordOTPExpiry = getOtpExpiry(OTP_EXPIRY_MINUTES);
    user.resetPasswordOTPAttempts = 0;
    user.resetPasswordOTPLastSentAt = new Date();
    await user.save();
    await sendOtpSms(mobile, otp);
  }

  return response.success(res, {}, "If that mobile number is registered, a new code has been sent");
});

/* ==========================================
   VERIFY RESET OTP — issues a short-lived reset token
========================================== */
export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  const user = await User.findOne({ mobile }).select("+resetPasswordOTPHash");

  if (!user || !user.resetPasswordOTPHash || !user.resetPasswordOTPExpiry) {
    return response.error(res, "Invalid or expired OTP", 400);
  }

  if (user.resetPasswordOTPAttempts >= MAX_OTP_ATTEMPTS) {
    return response.error(res, "Too many incorrect attempts. Please request a new OTP.", 429);
  }

  if (new Date(user.resetPasswordOTPExpiry).getTime() < Date.now()) {
    return response.error(res, "OTP expired. Please request a new one.", 400);
  }

  const isMatch = await bcrypt.compare(otp || "", user.resetPasswordOTPHash);
  if (!isMatch) {
    user.resetPasswordOTPAttempts += 1;
    await user.save();
    return response.error(res, "Incorrect OTP", 400);
  }

  user.resetPasswordOTPHash = undefined;
  user.resetPasswordOTPExpiry = undefined;
  user.resetPasswordOTPAttempts = 0;
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

  if (!isValidPassword(newPassword)) {
    return response.error(
      res,
      "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character",
      400
    );
  }

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
   REFRESH ACCESS TOKEN (ADMIN PANEL)
   Separate endpoint + separate cookie from the customer-facing refreshToken
   above, so an admin session can never be silently swapped for whichever
   regular-customer session happens to be logged in in the same browser.
========================================== */
export const adminRefreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.[ADMIN_REFRESH_COOKIE_NAME];

  if (!token) {
    return response.error(res, "Not authenticated", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    clearRefreshTokenCookie(res, ADMIN_REFRESH_COOKIE_NAME);
    return response.error(res, "Session expired, please log in again", 401);
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive || user.role !== "admin") {
    clearRefreshTokenCookie(res, ADMIN_REFRESH_COOKIE_NAME);
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
  // Shared endpoint for both apps — clearing both cookie names is harmless
  // when only one was ever set.
  clearRefreshTokenCookie(res, REFRESH_COOKIE_NAME);
  clearRefreshTokenCookie(res, ADMIN_REFRESH_COOKIE_NAME);
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
      { mobile: { $regex: search, $options: "i" } },
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
