import express from "express";
import {
  googleAuth,
  initiateRegistration,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  forgotPassword,
  resendPasswordResetOtp,
  verifyResetOtp,
  resetPassword,
  refreshToken,
  adminRefreshToken,
  logout,
  getMe,
  updateProfile,

  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
  toggleUserStatus,
} from "../controllers/authController.js";

import { protect, checkPermission } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = express.Router();

// GOOGLE OAUTH
router.post("/google", googleAuth);

// MOBILE-OTP REGISTRATION
router.post(
  "/register/initiate",
  validate.validateRequired(["name", "mobile", "email", "password", "confirmPassword"]),
  initiateRegistration
);
router.post("/register/verify-otp", validate.validateRequired(["mobile", "otp"]), verifyRegistrationOtp);
router.post("/register/resend-otp", validate.validateRequired(["mobile"]), resendRegistrationOtp);

// LOGIN (email or mobile identifier)
router.post("/login", validate.validateRequired(["identifier", "password"]), login);

// FORGOT / RESET PASSWORD (mobile-based)
router.post("/forgot-password", validate.validateRequired(["mobile"]), forgotPassword);
router.post("/forgot-password/resend-otp", validate.validateRequired(["mobile"]), resendPasswordResetOtp);
router.post("/verify-reset-otp", validate.validateRequired(["mobile", "otp"]), verifyResetOtp);
router.post("/reset-password", validate.validateRequired(["resetToken", "newPassword"]), resetPassword);

// TOKEN LIFECYCLE
router.post("/refresh-token", refreshToken);
router.post("/admin/refresh-token", adminRefreshToken);
router.post("/logout", protect, logout);

// CURRENT USER / PROFILE
router.get("/me", protect, getMe);
router.put("/profile", protect, validate.validateRequired(["phone"]), updateProfile);

// GET ALL USERS (admin)
router.get("/users", protect, checkPermission("user_view"), getAllUsers);

// GET SINGLE USER
router.get("/user/:id", protect, checkPermission("user_view"), getSingleUser);

// UPDATE USER ROLE
router.put("/user/:id", protect, checkPermission("user_update"), updateUserRole);

router.put("/user-toggle/:id", protect, checkPermission("user_update"), toggleUserStatus);

// DELETE USER
router.delete("/user/:id", protect, checkPermission("user_delete"), deleteUser);

export default router;
