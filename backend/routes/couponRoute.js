import express from "express";
import upload from "../middleware/upload.js";
import {
  createCoupon,
  getAllCoupons,
  getOneCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE
router.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "coupons";
    next();
  },
  upload.single("couponImage"),
  createCoupon
);

// GET ALL
router.get("/", getAllCoupons);

// GET ONE
router.get("/:id", getOneCoupon);

// UPDATE
router.put(
  "/:id",
  (req, res, next) => {
    req.uploadFolder = "coupons";
    next();
  },
  upload.single("couponImage"),
  updateCoupon
);

router.post("/apply", applyCoupon);

// DELETE
router.delete("/:id", deleteCoupon);

export default router;