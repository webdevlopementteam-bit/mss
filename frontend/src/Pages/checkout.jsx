import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  useShop,
  getProductId,
  getCartLineId,
  getLineUnitPrice,
} from "../context/ShopContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as orderService from "../api/orderService";
import { loadRazorpayScript } from "../utils/loadRazorpay";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL; // ✅ add this

const getImage = (item) => {
  const img = item.images?.[0] || item.image;
  if (!img) return null;
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primaryColor focus:ring-2 focus:ring-primaryColor/10 transition-all duration-150 bg-white placeholder:text-gray-400 text-gray-800";

const StepHeader = ({ number, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primaryColor flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-primaryColor/30">
      <span className="text-white text-xs sm:text-sm font-bold">{number}</span>
    </div>
    <div>
      <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const Checkout = () => {
  const { cart, clearCart } = useShop();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [prescription, setPrescription] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + getLineUnitPrice(item) * item.quantity,
        0,
      ),
    [cart],
  );

  // Shipping and GST are per-product values set in the admin panel (Delivery
  // Charge, GST %) — not a flat storefront-wide fee. Delivery charge is a flat
  // handling fee per product line (not multiplied by quantity); GST is a
  // percentage applied to that line's subtotal. The backend recomputes both
  // authoritatively from the real product record at order-creation time —
  // these are just the matching estimate shown before the user places the order.
  const shipping = useMemo(
    () =>
      cart.reduce((acc, item) => acc + (Number(item.deliveryCharge) || 0), 0),
    [cart],
  );
  const gst = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc +
          (getLineUnitPrice(item) * item.quantity * (Number(item.gst) || 0)) /
            100,
        0,
      ),
    [cart],
  );
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal + shipping + gst - discount;
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Clear an applied coupon if the cart changes underneath it (e.g. an item
  // is removed) — the discount was validated against a specific subtotal and
  // shouldn't silently keep applying once that's no longer the real cart.
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;

    setApplyingCoupon(true);
    setCouponError("");

    try {
      const categories = cart.flatMap((item) =>
        Array.isArray(item.category)
          ? item.category.map((c) => c?._id || c)
          : [],
      );

      const { data } = await orderService.applyCoupon({
        code,
        cartAmount: subtotal,
        products: cart.map((item) => getProductId(item)),
        categories,
      });

      setAppliedCoupon({ code: data.coupon, discountAmount: data.discountAmount });
      toast.success(`Coupon "${data.coupon}" applied`);
    } catch (error) {
      setCouponError(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  // COD is a per-product setting (admin toggle at product-creation time) —
  // if ANY item in the cart disallows it, the whole order must be prepaid
  // (an order can't be half-COD, half-online).
  const codAvailable = useMemo(
    () => cart.every((item) => item.codAvailable !== false),
    [cart],
  );

  useEffect(() => {
    if (!codAvailable && paymentMethod === "cod") {
      setPaymentMethod("razorpay");
    }
  }, [codAvailable, paymentMethod]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF files are accepted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB");
      return;
    }
    setPrescription(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const validateForm = () => {
    const checks = [
      [!formData.fullName.trim(), "Please enter your full name"],
      [!formData.phone.trim(), "Please enter your mobile number"],
      [formData.phone.length !== 10, "Enter a valid 10-digit mobile number"],
      [!formData.email.trim(), "Please enter your email address"],
      [!formData.address.trim(), "Please enter your delivery address"],
      [!formData.city.trim(), "Please enter your city"],
      [!formData.state.trim(), "Please enter your state"],
      [!formData.pincode.trim(), "Please enter your pincode"],
      [!prescription, "Please upload your prescription to continue"],
    ];
    for (const [condition, message] of checks) {
      if (condition) {
        toast.error(message);
        return false;
      }
    }
    return true;
  };

  // Builds and submits the actual order — shared by both COD (called
  // directly) and Razorpay (called from the payment success handler, with
  // the three razorpay_* fields the backend verifies before trusting the
  // payment actually happened).
  const submitOrder = async (extraPaymentFields = {}) => {
    try {
      const formDataToSend = new FormData();

      // Customer Info
      formDataToSend.append(
        "customerInfo",
        JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        }),
      );

      // Address
      formDataToSend.append(
        "shippingAddress",
        JSON.stringify({
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          landmark: formData.landmark,
        }),
      );

      // Products — variantId (when present) lets the backend resolve the
      // authoritative variant price/name/sku instead of trusting the client.
      formDataToSend.append(
        "orderItems",
        JSON.stringify(
          cart.map((item) => ({
            product: getProductId(item),
            variantId: item.variant?._id,
            name: item.title,
            image: item.image,
            price: getLineUnitPrice(item),
            quantity: item.quantity,
          })),
        ),
      );

      formDataToSend.append("paymentMethod", paymentMethod);

      if (appliedCoupon?.code) {
        formDataToSend.append("couponCode", appliedCoupon.code);
      }

      Object.entries(extraPaymentFields).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Prescription
      formDataToSend.append("prescription", prescription);

      const { data } = await orderService.createOrder(formDataToSend);

      toast.success("Order placed successfully");
      // Navigate away first, then clear the cart — clearing it before navigating
      // left the cart empty while still on this page, which briefly showed the
      // "Nothing to checkout" empty state during the delay before the redirect.
      navigate(`/order-success/${data.order._id}`);
      clearCart();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error(
        "Unable to load the payment gateway. Please check your connection and try again.",
      );
      setLoading(false);
      return;
    }

    try {
      const orderItemsPayload = cart.map((item) => ({
        product: getProductId(item),
        variantId: item.variant?._id,
        quantity: item.quantity,
      }));

      const { data } =
        await orderService.createRazorpayOrder(orderItemsPayload, appliedCoupon?.code);

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Medical & Surgical Solutions",
        description: "Order Payment",
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#b52327" },
        handler: (response) => {
          submitOrder({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          // User closed the modal without paying — just unlock the button,
          // no error toast needed since nothing actually went wrong.
          ondismiss: () => setLoading(false),
        },
      });

      rzp.on("payment.failed", (resp) => {
        setLoading(false);
        toast.error(
          resp.error?.description || "Payment failed. Please try again.",
        );
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to initiate payment",
      );
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (paymentMethod === "cod" && !codAvailable) {
      toast.error(
        "Cash on Delivery is not available for the items in your cart",
      );
      return;
    }

    setLoading(true);

    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else {
      await submitOrder();
    }
  };
  const paymentOptions = [
    {
      value: "cod",
      label: "Cash on Delivery",
      desc: codAvailable
        ? "Pay when your order arrives"
        : "Not available for the items in your cart",
      disabled: !codAvailable,
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
          />
        </svg>
      ),
    },
    {
      value: "razorpay",
      label: "Pay Online",
      desc: "Cards, UPI & Net Banking via Razorpay",
      disabled: false,
      icon: (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
          />
        </svg>
      ),
    },
  ];

  /* ── Empty state ── */
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-xs mx-auto">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Nothing to checkout
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Add some products to your cart first.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-primaryColor text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md shadow-primaryColor/20"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-[#F8F9FB] min-h-screen py-8 sm:py-10">
      <div className="px-4 sm:px-6 lg:px-side">
        {/* ── Page header ── */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Secure Checkout
            </h1>
            <p className="text-gray-400 mt-1 text-xs flex items-center gap-1.5">
              <svg
                className="w-3 h-3 text-green-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
              256-bit SSL encrypted &amp; secure
            </p>
          </div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primaryColor transition-colors font-medium border border-gray-200 rounded-lg px-3 py-2 bg-white hover:border-primaryColor/30"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <span className="hidden sm:inline">Back to Cart</span>
            <span className="sm:hidden">Cart</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-7 items-start">
          {/* ── LEFT — form sections ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1 — Customer Info */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
              <StepHeader
                number="1"
                title="Customer Information"
                subtitle="We'll use this to confirm and update you on your order"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="e.g. Riya Sharma"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit number"
                    maxLength={10}
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Step 2 — Delivery Address */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
              <StepHeader
                number="2"
                title="Delivery Address"
                subtitle="Where should we send your order?"
              />
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Street Address
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    placeholder="House / Flat No., Street, Area"
                    value={formData.address}
                    onChange={handleChange}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g. Maharashtra"
                      value={formData.state}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="6-digit pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                      Landmark{" "}
                      <span className="normal-case font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Near school, temple, etc."
                      value={formData.landmark}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — Upload Prescription */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
              <StepHeader
                number="3"
                title={
                  <span className="flex items-center gap-2">
                    Upload Prescription
                    <span className="text-[10px] font-bold text-white bg-red-500 rounded-md px-1.5 py-0.5 tracking-wide">
                      REQUIRED
                    </span>
                  </span>
                }
                subtitle="A valid prescription is mandatory for dispensing medicines"
              />

              {!prescription ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 text-center
                    ${
                      dragOver
                        ? "border-primaryColor bg-primaryColor/5"
                        : "border-gray-200 hover:border-primaryColor/50 hover:bg-gray-50/70 bg-gray-50"
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                  />
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-200 ${dragOver ? "bg-primaryColor/10" : "bg-white border border-gray-200"}`}
                  >
                    <svg
                      className={`w-6 h-6 transition-colors ${dragOver ? "text-primaryColor" : "text-gray-400"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.6}
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {dragOver
                        ? "Drop it here"
                        : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG or PDF · Max 5 MB
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-primaryColor border border-primaryColor/30 bg-primaryColor/5 rounded-lg px-4 py-1.5 mt-1 hover:bg-primaryColor/10 transition-colors">
                    Choose File
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800 truncate">
                      {prescription.name}
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      {(prescription.size / 1024).toFixed(0)} KB · Prescription
                      uploaded
                    </p>
                  </div>
                  <button
                    onClick={() => setPrescription(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-green-100 text-green-500 hover:text-green-700 transition-colors flex-shrink-0"
                    title="Remove"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <p className="mt-3 text-[11px] text-gray-400 flex items-start gap-1.5">
                <svg
                  className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
                Your prescription is stored securely and only shared with our
                licensed pharmacists for verification.
              </p>
            </div>

            {/* Step 4 — Payment */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100">
              <StepHeader
                number="4"
                title="Payment Method"
                subtitle="Choose how you'd like to pay"
              />
              <div className="space-y-2">
                {paymentOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 sm:gap-4 rounded-xl p-3.5 border-2 transition-all duration-150 ${
                      opt.disabled
                        ? "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                        : paymentMethod === opt.value
                          ? "cursor-pointer border-primaryColor bg-primaryColor/5"
                          : "cursor-pointer border-gray-100 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      disabled={opt.disabled}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        !opt.disabled && paymentMethod === opt.value
                          ? "bg-primaryColor text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
                        paymentMethod === opt.value
                          ? "border-primaryColor"
                          : "border-gray-300"
                      }`}
                    >
                      {!opt.disabled && paymentMethod === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-primaryColor" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Mobile-only Place Order button */}
            <div className="lg:hidden">
              <button
                disabled={loading}
                onClick={handlePlaceOrder}
                className="w-full flex items-center justify-center gap-2 bg-primaryColor hover:opacity-90 active:scale-[0.98] text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primaryColor/25 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Placing Order..." : "Place Order"}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ── RIGHT — Order Summary ── */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-gray-100 lg:sticky lg:top-6 overflow-hidden">
              {/* Summary header */}
              <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 tracking-tight">
                  Order Summary
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
                </p>
              </div>

              {/* Items */}
              <div className="px-5 sm:px-6 py-4 space-y-3.5 max-h-64 overflow-y-auto">
                {cart.map((item) => {
                  const image = getImage(item);
                  const name = item.title ?? item.name;
                  const unitPrice = getLineUnitPrice(item);
                  const price = unitPrice * item.quantity;

                  return (
                    <div
                      key={getCartLineId(item, item.variant)}
                      className="flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#F5F2EE] flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="w-full h-full object-contain p-1.5"
                          />
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2">
                          {name}
                        </p>
                        {item.variant?.combination && (
                          <p className="text-[11px] text-gray-400">
                            {item.variant.combination}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Qty {item.quantity}
                          {item.quantity > 1 && (
                            <span className="ml-1">
                              · ₹{unitPrice.toLocaleString("en-IN")} each
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-gray-800 flex-shrink-0">
                        ₹{price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="px-5 sm:px-6 py-4 border-t border-gray-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-xs">
                      <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold text-green-700">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-green-600">applied</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs text-gray-400 hover:text-red-500 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Have a coupon code?"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        className={`${inputClass} py-2.5 text-xs`}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon || !couponInput.trim() || cart.length === 0}
                        className="shrink-0 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold disabled:opacity-40 transition-colors"
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-[11px] mt-1.5">{couponError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Price breakdown */}
              <div className="px-5 sm:px-6 pb-5 border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Subtotal</span>
                  <span className="text-gray-700 font-medium">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    <span className="text-gray-700 font-medium">
                      ₹{shipping}
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>GST</span>
                  <span className="text-gray-700 font-medium">
                    {gst > 0
                      ? `₹${gst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                      : "₹0"}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-gray-500 text-xs">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="text-green-600 font-medium">
                      -₹{discount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
                  <span className="text-gray-900 text-sm">Total</span>
                  <span className="text-primaryColor text-base">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* CTA — desktop */}
              <div className="px-5 sm:px-6 pb-5">
                <button
                  disabled={loading}
                  onClick={handlePlaceOrder}
                  className="hidden lg:flex w-full items-center justify-center gap-2 bg-primaryColor hover:opacity-90 active:scale-[0.98] text-white py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-md shadow-primaryColor/20 text-sm"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-px border-t border-gray-100 bg-gray-100">
                {[
                  { icon: "🛡️", text: "Secure Checkout" },
                  { icon: "💊", text: "Genuine Products" },
                  { icon: "🚚", text: "Pan India Delivery" },
                  { icon: "🎧", text: "24/7 Support" },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 bg-white px-3 py-2.5"
                  >
                    <span className="text-sm leading-none">{icon}</span>
                    <span className="text-[10px] text-gray-500 font-medium leading-tight">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
