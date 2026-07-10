import express from "express";
import {
  createOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getSingleOrderAdmin,
} from "../controllers/orderController.js";

import {
  protect,
  checkPermission,
  requireProfileComplete,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
const router = express.Router();

router.post(
  "/create",
  protect,
  requireProfileComplete,
  upload.single("prescription"),
  createOrder
);

router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getSingleOrder);


router.put(
  "/cancel/:id",
  protect,
  cancelOrder
);

// Admin
router.get(
  "/admin/all",
  protect,
  checkPermission("manage_orders"),
  getAllOrders
);

router.get(
  "/admin/:id",
  protect,
  checkPermission("manage_orders"),
  getSingleOrderAdmin
);


router.put(
  "/admin/status/:id",
  protect,
  checkPermission("manage_orders"),
  updateOrderStatus
);

router.put(
  "/admin/payment/:id",
  protect,
  checkPermission("manage_orders"),
  updatePaymentStatus
);

export default router;
