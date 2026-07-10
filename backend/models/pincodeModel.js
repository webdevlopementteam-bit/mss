import mongoose from "mongoose";

const pincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    branchName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

pincodeSchema.index({ pincode: 1 }, { unique: true });

export default mongoose.model("Pincode", pincodeSchema);