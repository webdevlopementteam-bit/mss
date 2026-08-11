import mongoose from "mongoose";

// Holds registration data + hashed OTP until mobile verification succeeds.
// Not part of the real User collection ("DO NOT create user immediately").
// The TTL index auto-deletes abandoned/expired signups 10 minutes after creation.
const pendingRegistrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: {
    type: String,
    index: true,
  },
  passwordHash: String,

  otpHash: String,
  otpExpiry: Date,
  otpAttempts: {
    type: Number,
    default: 0,
  },
  otpLastSentAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // seconds
  },
});

export default mongoose.model("PendingRegistration", pendingRegistrationSchema);
