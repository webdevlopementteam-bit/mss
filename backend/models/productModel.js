import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand"
  },

  // Short description — shown near the price on the product detail page.
  description: {
    type: String,
    required: true
  },

  // Full rich-text (HTML from the Tiptap editor) description — shown in the
  // Description section below the specifications table. Only used when
  // hasVariants is false (variants don't carry their own long description).
  longDescription: {
    type: String,
    default: ""
  },

  // Free-form spec sheet: an array of rows, each row an array of cell
  // strings (e.g. [["Brand", "Sound Boss"], ["Type", "Audio & Video"]]).
  // Only used when hasVariants is false — variable products keep this on
  // each Variant document instead, since specs differ per variant.
  specifications: {
    type: [[String]],
    default: []
  },

  metaTitle: String,
  metaDescription: String,

  // images: {
  //   type: [String],
  //   required: true,
  //   validate: {
  //     validator: function (value) {
  //       return value.length > 0;
  //     },
  //     message: "At least one product image is required"
  //   }
  // },

  images: {
  type: [String],
  default: []
},

  fsn: {
    type: String,
    trim: true
  },

  hsn: Number,

  category: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }],

  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory"
  },

  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  salePrice: {
    type: Number,
    min: 0,
    validate: {
      validator: function (value) {
        if (!this.price) return true;
        return value <= this.price;
      }
    }
  },

  deliveryCharge: {
    type: Number,
    default: 0
  },

  gst: {
    type: Number,
    required: true,
    min: 0
  },

  quantity: {
    type: Number,
    default: 0
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true
  },

  referenceNo: String,

  moq: {
    type: Number,
    default: 1
  },

  packing: String,

  codAvailable: {
    type: Boolean,
    default: true
  },

  tags: {
    type: [String],
    default: []
  },

  hasVariants: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  homeSections: {
    type: [String],
    enum: [
      "trending",
      "featured",
      "popular",
      "bestseller",
      "toprated",
      "onsale"
    ],
    default: []
  }

}, { timestamps: true });

export default mongoose.model("Product", productSchema);
