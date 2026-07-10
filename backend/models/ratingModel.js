import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 👈 future me user module se connect hoga
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // 👈 product module se connect hoga
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // ⭐ 1–5 stars
    },

    comment: {
      type: String,
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Optional: ek user ek product ko ek hi rating de
ratingSchema.index({ customer: 1, product: 1 }, { unique: true });

export default mongoose.model("Rating", ratingSchema);