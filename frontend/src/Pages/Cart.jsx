import { Link } from "react-router-dom";
import { useShop, getCartLineId, getLineUnitPrice } from "../context/ShopContext";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;   // ✅ add this

const getImage = (item) => {
  const img = item.images?.[0] || item.image;
  if (!img) return null;
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useShop();

  const subtotal = cart.reduce(
    (total, item) => total + getLineUnitPrice(item) * item.quantity,
    0
  );
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  // Delivery charge is a flat per-product handling fee set in the admin panel
  // (not multiplied by quantity — it's the cost to ship that product type),
  // summed across the distinct products in the cart.
  const shipping = cart.reduce((total, item) => total + (Number(item.deliveryCharge) || 0), 0);
  const total = subtotal + shipping;

  /* ── Empty state ── */
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-xs mx-auto">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-8">Looks like you haven't added anything yet.</p>
          <Link
            to="/shop"
            className="inline-block bg-primaryColor text-white px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-md shadow-primaryColor/20"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-side py-8 sm:py-10">

      {/* ── Page header ── */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-xs sm:text-sm font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* ── Cart items list ── */}
        <div className="w-full flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {cart.map((item, index) => (
              <div
                key={getCartLineId(item, item.variant)}
                className={`p-4 sm:p-5 hover:bg-blue-50/40 transition-colors duration-150 ${
                  index !== cart.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Top row: image + name + remove */}
                <div className="flex items-start gap-3 sm:gap-4">

                  {/* Thumbnail */}
                  {getImage(item) ? (
  <img
    src={getImage(item)}
    alt={item.title ?? item.name}
    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0 bg-gray-100"
  />
) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primaryColor/10 to-primaryColor/20 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primaryColor/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                  )}

                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                      {item.title ?? item.name}
                    </h3>
                    {item.variant?.combination && (
                      <p className="text-gray-400 text-xs mt-0.5">{item.variant.combination}</p>
                    )}
                    <p className="text-primaryColor font-medium text-xs sm:text-sm mt-1">
                      ₹{getLineUnitPrice(item).toLocaleString("en-IN")} each
                    </p>
                  </div>

                  {/* Remove — top-right on mobile */}
                  <button
                    onClick={() => removeFromCart(getCartLineId(item, item.variant))}
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors duration-150 p-1 -mt-0.5"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Bottom row: stepper + subtotal */}
                <div className="flex items-center justify-between mt-3 pl-[calc(3.5rem+0.75rem)] sm:pl-[calc(4rem+1rem)]">

                  {/* Quantity stepper */}
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? removeFromCart(getCartLineId(item, item.variant))
                          : updateQuantity(getCartLineId(item, item.variant), item.quantity - 1)
                      }
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-red-500 hover:shadow-md transition-all duration-150 font-bold text-base sm:text-lg leading-none"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-6 sm:w-7 text-center font-semibold text-gray-800 text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(getCartLineId(item, item.variant), item.quantity + 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primaryColor hover:shadow-md transition-all duration-150 font-bold text-base sm:text-lg leading-none"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="font-bold text-gray-900 text-sm sm:text-base">
                    ₹{(getLineUnitPrice(item) * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Continue shopping */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primaryColor transition-colors duration-150 mt-4 sm:mt-5 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* ── Order summary ── */}
        {/* On mobile: full-width below items. On lg: fixed 320px sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span className="font-medium text-gray-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  <span className="font-medium text-gray-900">₹{shipping}</span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-lg sm:text-xl text-primaryColor">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="mt-5 sm:mt-6 flex items-center justify-center gap-2 w-full bg-primaryColor hover:opacity-90 text-white py-3.5 sm:py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-primaryColor/25 active:scale-[0.98] text-sm sm:text-base"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>

            {/* Trust badges — 3-col on mobile, row on desktop */}
            <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-2">
              {[
                {
                  label: "Secure",
                  icon: <path d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" />,
                },
                {
                  label: "Fast Delivery",
                  icon: (
                    <>
                      <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                      <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                      <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                    </>
                  ),
                },
                {
                  label: "Returns",
                  icon: <path fillRule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H7.5a.75.75 0 010-1.5h11.69l-3.22-3.22a.75.75 0 010-1.06zm-7.94 9a.75.75 0 010 1.06l-3.22 3.22H16.5a.75.75 0 010 1.5H4.81l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 0z" clipRule="evenodd" />,
                },
              ].map(({ label, icon }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 bg-gray-50 rounded-xl py-3 px-2">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    {icon}
                  </svg>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium text-center leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}