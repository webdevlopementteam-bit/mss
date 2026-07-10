import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    variants: {
      type: [String],
      required: true,
      validate: (v) => v.length > 0,
    },
  },
  {
    timestamps: true,
  },
);

attributeSchema.index({ title: 1 }, { unique: true });

export default mongoose.model("Attribute", attributeSchema);
