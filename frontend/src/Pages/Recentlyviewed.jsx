import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

/* ── Relative time helper ── */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return "Yesterday";
}

// ✅ Add near top of file, after getImage
const getDisplayPrice = (product) => {
  if (product.hasVariants) {
    // Prefer variants array if present (most reliable — true lowest price)
    const variantPrices = (product.variants || [])
      .map((v) => Number(v.salePrice || v.price || 0))
      .filter((p) => p > 0);

    if (variantPrices.length > 0) {
      return { display: `From ₹${Math.min(...variantPrices)}`, discount: null };
    }

    // Fallback to backend-computed minPrice if variants array not present
    const min = Number(product.minPrice || 0);
    if (min > 0) return { display: `From ₹${min}`, discount: null };

    return { display: "Price on selection", discount: null };
  }

  const price = Number(product.price || 0);
  const salePrice = Number(product.salePrice || 0);
  const hasDiscount = salePrice > 0 && salePrice < price;

  return {
    display: `₹${hasDiscount ? salePrice : price}`,
    mrp: hasDiscount ? price : null,
    discount: hasDiscount ? Math.round(((price - salePrice) / price) * 100) : null,
  };
};

/* ── Safe image resolver ── */
const getImage = (product) => {
  const img = product.images?.[0] || product.image;
  if (!img) return null;
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

/* ── Safe price resolver — handles variant products whose base
   price/salePrice are stored as 0 (real price lives on the variants) ── */
// const getPriceInfo = (product) => {
//   if (product.hasVariants) {
//     const min = Number(product.minPrice ?? product.price ?? 0);
//     return { display: `From ₹${min.toLocaleString("en-IN")}`, mrp: null, discount: null };
//   }

//   const price = Number(product.price || 0);
//   const salePrice = Number(product.salePrice || 0);
//   const hasDiscount = salePrice > 0 && salePrice < price;

//   return {
//     display: `₹${(hasDiscount ? salePrice : price).toLocaleString("en-IN")}`,
//     mrp: hasDiscount ? price.toLocaleString("en-IN") : null,
//     discount: hasDiscount ? Math.round(((price - salePrice) / price) * 100) : null,
//   };
// };

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const stripRef = useRef(null);

  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = viewed
      .filter((p) => p.viewedAt > oneDayAgo)
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 10);
    setProducts(recent);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const updateScrollIndicators = () => {
    const el = stripRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators, { passive: true });
    window.addEventListener("resize", updateScrollIndicators);
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators);
      window.removeEventListener("resize", updateScrollIndicators);
    };
  }, [products]);

  const scroll = (dir) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (products.length === 0) {
    return (
      <section className="px-4 sm:px-6 lg:px-side py-12">
        <SectionHeader count={0} />
        <div className="mt-6 flex items-center gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">No recent browsing</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
              Products you view will appear here for 24 hours.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="px-4 sm:px-6 lg:px-side flex items-end justify-between mb-7">
        <SectionHeader count={products.length} />

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-900 hover:border-gray-900 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-900 hover:border-gray-900 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-4 w-10 sm:w-16 z-10 transition-opacity duration-200"
          style={{
            background: "linear-gradient(to right, #ffffff 0%, transparent 100%)",
            opacity: canScrollLeft ? 1 : 0,
          }}
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-4 w-10 sm:w-20 z-10 transition-opacity duration-200"
          style={{
            background: "linear-gradient(to left, #ffffff 0%, transparent 100%)",
            opacity: canScrollRight ? 1 : 0,
          }}
        />

        <div
          ref={stripRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-side scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} visible={visible} />
          ))}
        </div>
      </div>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </section>
  );
}

function SectionHeader({ count }) {
  return (
    <div>
      <p className="text-[11px] font-bold tracking-[0.2em] text-primaryColor uppercase mb-1.5">
        Your Trail
      </p>
      <div className="flex items-center gap-3">
        <h2 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 tracking-tight leading-none">
          Recently Viewed
        </h2>
        {count > 0 && (
          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Last 24h
          </span>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product, index, visible }) {
  const image = getImage(product);
const { display, mrp, discount } = getDisplayPrice(product);
  const ago = timeAgo(product.viewedAt);
  const href = `/product/${product.slug || product.id}`;

  return (
    <Link
      to={href}
      className="group relative flex-none w-[168px] sm:w-[200px] bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: `opacity .4s ease ${index * 60}ms, transform .4s ease ${index * 60}ms, box-shadow .3s ease, border-color .3s ease`,
      }}
    >
      {/* Image zone */}
      <div className="relative aspect-square bg-[#F7F5F2] overflow-hidden">
        {discount ? (
          <span className="absolute top-2 left-2 z-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">
            {discount}% OFF
          </span>
        ) : (
          <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-md px-1.5 py-1 shadow-sm">
            <svg className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-[9px] font-semibold text-gray-500 leading-none">{ago}</span>
          </span>
        )}

        {image ? (
          <img
            src={image}
            alt={product.title || "Product"}
            className="w-full h-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.08]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1">
        <h3 className="text-[12px] sm:text-[13px] font-medium text-gray-700 line-clamp-2 leading-snug min-h-[2.5em] group-hover:text-gray-900 transition-colors">
          {product.title}
        </h3>

        <div className="flex items-baseline gap-1.5 mt-2">
          <p className="text-gray-900 font-bold text-[14px] sm:text-[15px] tracking-tight">
            {display}
          </p>
          {mrp && <p className="text-[11px] text-gray-400 line-through">₹{mrp}</p>}
        </div>
      </div>

      {/* Bottom accent line on hover */}
      <div className="h-[3px] bg-primaryColor scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  );
}