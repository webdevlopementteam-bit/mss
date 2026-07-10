import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);
  const [visible, setVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const stripRef = useRef(null);

  /* ── Load from localStorage ── */
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = viewed
      .filter((p) => p.viewedAt > oneDayAgo)
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 10);
    setProducts(recent);
    // Trigger stagger animation after mount
    requestAnimationFrame(() => setVisible(true));
  }, []);

  /* ── Scroll shadow indicators ── */
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
    el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  /* ── Nothing to show ── */
  if (products.length === 0) {
    return (
      <section className="px-4 sm:px-6 lg:px-side py-10">
        <SectionHeader count={0} />
        <div className="mt-6 flex items-center gap-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2EE] flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
    <section className="py-10 bg-[#FAFAF8]">
      {/* ── Header row ── */}
      <div className="px-4 sm:px-6 lg:px-side flex items-end justify-between mb-6">
        <SectionHeader count={products.length} />

        {/* Nav arrows — desktop only */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
            aria-label="Scroll left"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 disabled:opacity-30 disabled:pointer-events-none transition-all duration-150"
            aria-label="Scroll right"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Scroll strip wrapper (fade masks) ── */}
      <div className="relative">
        {/* Left fade */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-16 z-10 transition-opacity duration-200"
          style={{
            background: "linear-gradient(to right, #FAFAF8 0%, transparent 100%)",
            opacity: canScrollLeft ? 1 : 0,
          }}
        />
        {/* Right fade */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-20 z-10 transition-opacity duration-200"
          style={{
            background: "linear-gradient(to left, #FAFAF8 0%, transparent 100%)",
            opacity: canScrollRight ? 1 : 0,
          }}
        />

        {/* Scrollable strip */}
        <div
          ref={stripRef}
          className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-side scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              visible={visible}
            />
          ))}
        </div>
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

/* ── Section header ── */
function SectionHeader({ count }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-primaryColor uppercase mb-1.5">
        Your Trail
      </p>
      <div className="flex items-center gap-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-none">
          Recently Viewed
        </h2>
        {count > 0 && (
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            Last 24h
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Product card ── */
function ProductCard({ product, index, visible }) {
  const image = product.images?.[0] || product.image;
  const price = (product.salePrice ?? product.price).toLocaleString("en-IN");
  const ago = timeAgo(product.viewedAt);

  return (
    <div
      className="group relative flex-none w-44 sm:w-52 bg-white rounded-3xl overflow-hidden border border-gray-100/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 0.4s ease ${index * 60}ms, transform 0.4s ease ${index * 60}ms, box-shadow 0.3s ease`,
      }}
    >
      {/* Image zone */}
      <div className="relative bg-[#F5F2EE] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-44 sm:h-48 object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-44 sm:h-48 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2}
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}

        {/* Timestamp chip */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl px-2 py-1 shadow-sm">
          <svg className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="text-[10px] font-semibold text-gray-500 leading-none">{ago}</span>
        </div>

        {/* Hover accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primaryColor scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>

      {/* Card body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-snug tracking-tight">
          {product.title}
        </h3>
        <p className="text-primaryColor font-bold text-base sm:text-lg mt-1.5 tracking-tight">
          ₹{price}
        </p>

        {/* View again CTA — appears on hover */}
        <Link to={`/product/${product.id}`} className="my-3 overflow-hidden">
        
            <button className="w-full flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-colors duration-150">
              
              View Product
            </button>
        
        </Link>
      </div>
    </div>
  );
}