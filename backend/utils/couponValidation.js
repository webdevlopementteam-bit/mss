import Coupon from "../models/couponModel.js";

// Wraps a validation failure with the HTTP status the original inline
// applyCoupon logic used to return for it, so callers can distinguish an
// expected "this coupon isn't valid" rejection from a genuinely unexpected
// error (which should still surface as a 500, not a 400/404).
const validationError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

// Single source of truth for coupon validation + discount calculation —
// used by both the public /coupon/apply preview endpoint and the
// authoritative server-side pricing in orderController.js, so a coupon can
// never be trusted from the client, only re-validated by its code.
// Throws a validationError (message is user-facing, .status is the intended
// HTTP status) on any expected failure.
export const validateCoupon = async ({ code, cartAmount, productIds = [], categoryIds = [] }) => {
  const coupon = await Coupon.findOne({ couponCode: code });

  if (!coupon) {
    throw validationError("Invalid coupon code", 404);
  }

  if (!coupon.isPublished) {
    throw validationError("Coupon not active", 400);
  }

  const now = new Date();

  if (coupon.validityTime.startDate > now) {
    throw validationError("Coupon not started yet", 400);
  }

  if (coupon.validityTime.endDate < now) {
    throw validationError("Coupon expired", 400);
  }

  if (cartAmount < coupon.minAmount) {
    throw validationError(`Minimum amount should be ₹${coupon.minAmount}`, 400);
  }

  if (coupon.applyOn === "CATEGORY") {
    const match = categoryIds.some((cat) =>
      coupon.categories.some((c) => c.toString() === cat.toString())
    );
    if (!match) {
      throw validationError("Coupon not valid for selected category", 400);
    }
  }

  if (coupon.applyOn === "PRODUCT") {
    const match = productIds.some((prod) =>
      coupon.products.some((p) => p.toString() === prod.toString())
    );
    if (!match) {
      throw validationError("Coupon not valid for selected product", 400);
    }
  }

  let discountAmount = 0;

  if (coupon.discountType === "FIXED") {
    discountAmount = coupon.discount;
  }

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (cartAmount * coupon.discount) / 100;
  }

  // Never let a discount exceed the amount it's discounting off of.
  discountAmount = Math.min(discountAmount, cartAmount);

  return { coupon, discountAmount };
};
