import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token",
      error: err.message,
    });
  }
};


// 🔒 REQUIRE COMPLETED PROFILE (e.g. before placing an order)
export const requireProfileComplete = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.profileCompleted) {
      return res.status(403).json({
        message: "Please complete your profile before placing an order.",
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// 🔥 PERMISSION CHECK
export const checkPermission = (permission) => {
  return (req, res, next) => {

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        message: "Permission denied",
      });
    }

    next();
  };
};