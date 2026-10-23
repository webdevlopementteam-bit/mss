import mongoose from "mongoose";
import Rating from "../models/ratingModel.js";
import Product from "../models/productModel.js";

// Public review list + summary for one product (storefront product page).
// GET /api/rating/product/:productId
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    const reviews = await Rating.find({ product: productId, isPublished: true })
      .populate("customer", "name firstName lastName")
      .sort({ createdAt: -1 })
      .lean();

    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    reviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
      total += r.rating;
    });

    res.json({
      success: true,
      summary: {
        count: reviews.length,
        average: reviews.length ? Math.round((total / reviews.length) * 10) / 10 : 0,
        breakdown,
      },
      data: reviews.map((r) => {
        const c = r.customer || {};
        const name = c.name || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Customer";
        return {
          _id: r._id,
          rating: r.rating,
          comment: r.comment || "",
          createdAt: r.createdAt,
          customerId: c._id,
          customerName: name,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logged-in customer writes (or updates) their review for a product.
// POST /api/rating/product/:productId   body: { rating: 1-5, comment }
export const upsertMyReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || "").trim().slice(0, 2000);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    const exists = await Product.exists({ _id: productId });
    if (!exists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const review = await Rating.findOneAndUpdate(
      { customer: req.user.id, product: productId },
      { $set: { rating, comment }, $setOnInsert: { customer: req.user.id, product: productId, isPublished: true } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
