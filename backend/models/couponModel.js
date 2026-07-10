import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponImage: {
      type: String,
      default: "",
    },

    couponName: {
      type: String,
      required: true,
      trim: true,
    },

    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // 🔥 SCOPE TYPE
    applyOn: {
      type: String,
      enum: ["ALL", "CATEGORY", "PRODUCT"],
      required: true,
    },

    // 🔥 CATEGORY TARGET
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // 🔥 PRODUCT TARGET
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // 🔥 VALIDITY
    validityTime: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },

    // 🔥 DISCOUNT
    discountType: {
      type: String,
      enum: ["FIXED", "PERCENTAGE"],
      required: true,
    },

    discount: {
      type: Number,
      required: true,
    },

    minAmount: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Coupon", couponSchema);
