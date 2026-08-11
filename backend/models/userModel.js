import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },

    mobileOTPHash: {
      type: String,
      select: false,
    },
    mobileOTPExpiry: Date,
    mobileOTPAttempts: {
      type: Number,
      default: 0,
    },
    mobileOTPLastSentAt: Date,

    password: {
      type: String,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profileImage: String,

    authProvider: {
      type: String,
      enum: ["google", "email"],
      default: "email",
    },

    emailVerified: {
      type: Boolean,
      default: true,
    },

    resetPasswordOTPHash: {
      type: String,
      select: false,
    },
    resetPasswordOTPExpiry: Date,
    resetPasswordOTPAttempts: {
      type: Number,
      default: 0,
    },
    resetPasswordOTPLastSentAt: Date,

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // Profile fields (backed by the existing UserDashboard profile form)
    firstName: String,
    lastName: String,
    phone: String,
    organisation: String,
    address: String,
    city: String,
    state: String,
    zip: String,

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    permissions: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
