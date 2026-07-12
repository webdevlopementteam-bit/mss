import express from "express";
import {
  googleAuth,
  signup,
  verifyEmailOtp,
  resendOtp,
  login,
  forgotPassword,
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

// EMAIL SIGNUP + OTP VERIFICATION
router.post("/signup", validate.validateRequired(["name", "email", "password"]), signup);
router.post("/verify-email-otp", validate.validateRequired(["email", "otp"]), verifyEmailOtp);
router.post("/resend-otp", validate.validateRequired(["email", "purpose"]), resendOtp);

// EMAIL + PASSWORD LOGIN
router.post("/login", validate.validateRequired(["email", "password"]), login);

// FORGOT / RESET PASSWORD
router.post("/forgot-password", validate.validateRequired(["email"]), forgotPassword);
router.post("/verify-reset-otp", validate.validateRequired(["email", "otp"]), verifyResetOtp);
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
