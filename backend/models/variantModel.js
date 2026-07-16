import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  combination: {
    type: String, // "6F-2MM"
    required: true
  },

  attributes: [
    {
      attributeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attribute",
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  ],

  price: {
    type: Number,
    required: true
  },

  salePrice: {
    type: Number
  },

  quantity: {
    type: Number,
    default: 0
  },

  // sku: {
  //   type: String,
  //   trim: true,
  //   unique: true,
  //   sparse: true
  // },

  isActive: {
    type: Boolean,
    default: true
  },

  image: {
    type: String
  }

}, { timestamps: true });

variantSchema.index({ productId: 1, combination: 1 }, { unique: true });
export default mongoose.model("Variant", variantSchema);