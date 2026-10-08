import mongoose from "mongoose";

// One document per editable storefront area (About, FAQ, policies, contact
// details, SEO). `data` is free-form because every area has its own shape;
// the allowed keys are whitelisted in the controller.
const siteCmsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.model("SiteCMS", siteCmsSchema);
