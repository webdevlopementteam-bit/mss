import express from "express";
import {
  createRating,
  getAllRating,
  getOneRating,
  updateRating,
  deleteRating,
} from "../controllers/ratingController.js";
import { getProductReviews, upsertMyReview } from "../controllers/productReviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// STOREFRONT — product page reviews (declared before "/:id")
router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, upsertMyReview);

// CREATE
router.post("/", createRating);

// GET ALL
router.get("/", getAllRating);

// GET ONE
router.get("/:id", getOneRating);

// UPDATE
router.put("/:id", updateRating);

// DELETE
router.delete("/:id", deleteRating);

export default router;