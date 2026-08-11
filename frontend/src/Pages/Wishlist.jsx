import { useShop, getProductId } from "../context/ShopContext";
import { Link } from "react-router-dom";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;   // ✅ add this

const getImage = (item) => {
  const img = item.images?.[0] || item.image;
  if (!img) return null;
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

// Variant products have price/salePrice = 0 at the top level (real prices
// live on the variants) — items added from a listing card carry a
// server-computed minSalePrice, while items added from the product detail
// page instead carry the raw variants array, so fall back to computing it
// client-side from whichever shape is available.
const getWishlistPrice = (item) => {
  if (!item.hasVariants) {
    return item.salePrice || item.price || 0;
  }
  if (item.minSalePrice != null) return item.minSalePrice;
  if (Array.isArray(item.variants) && item.variants.length > 0) {
    const effective = item.variants.map((v) => (v.salePrice > 0 ? v.salePrice : v.price));
    return Math.min(...effective);
  }
  return item.minPrice ?? 0;
};

export default function Wishlist() {
  const { wishlist, removeFromWishlist, addToCart } = useShop();

  /* ── Empty state ── */
  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-[#FAFAF8]">
        <div className="text-center max-w-sm mx-auto">
          {/* Animated heart illustration */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-rose-50 animate-ping opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center shadow-sm">
              <svg className="w-11 h-11 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
            Nothing saved yet
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-10 leading-relaxed max-w-xs mx-auto">
            Tap the heart on any product to save it here for later.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2.5 bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-semibold text-sm hover:bg-gray-800 transition-all duration-200 shadow-lg shadow-gray-900/15"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">

      {/* ── Page header ── */}
      <div className="px-4 sm:px-6 lg:px-side pt-10 pb-8 sm:pt-12 sm:pb-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-primaryColor uppercase mb-2">
              Saved Items
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-none">
              Your Wishlist
            </h1>
          </div>

          {/* Count badge */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm mb-1">
            <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">
              {wishlist.length}
            </span>
            <span className="text-sm text-gray-400">
              {wishlist.length === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />
      </div>

      {/* ── Product grid ── */}
      <div className="px-4 sm:px-6 lg:px-side pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {wishlist.map((item) => {
            const image = getImage(item);
            const name = item.title ?? item.name;
            const price = getWishlistPrice(item);

            return (
              <div
                key={getProductId(item)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100/80"
                style={{ transform: "translateZ(0)" }}
              >
                {/* ── Image area ── */}
                <div className="relative overflow-hidden bg-[#F5F2EE]">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-44 sm:h-52 object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-44 sm:h-52 flex items-center justify-center">
                      <svg className="w-14 h-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                  )}

                  {/* Remove heart button */}
                  <button
                    onClick={() => removeFromWishlist(getProductId(item))}
                    className="absolute top-3 right-3 w-9 h-9 rounded-2xl bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-white hover:scale-110 transition-all duration-200"
                    aria-label="Remove from wishlist"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>

                  {/* Hover accent bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryColor scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </div>

                {/* ── Card body ── */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-[0.9rem] line-clamp-2 leading-snug tracking-tight">
                    {name}
                  </h3>

                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-primaryColor font-bold text-lg sm:text-xl tracking-tight">
                      {item.hasVariants && "From "}₹{price.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 min-h-[12px]" />

                  {/* Action buttons */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={() => {
                        addToCart(item);
                        removeFromWishlist(getProductId(item));
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 active:scale-[0.98] text-white py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      Move to Cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(getProductId(item))}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs text-gray-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-150 font-medium"
                      aria-label="Remove"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="mt-12 flex items-center justify-between">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150 font-medium group"
          >
            <span className="w-7 h-7 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors duration-150">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </span>
            Continue Shopping
          </Link>

          <button
            onClick={() => wishlist.forEach(item => removeFromWishlist(getProductId(item)))}
            className="text-xs text-gray-300 hover:text-rose-400 transition-colors duration-150 font-medium"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}