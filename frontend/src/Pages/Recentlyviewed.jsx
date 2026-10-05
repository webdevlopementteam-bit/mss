import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductId } from "../context/ShopContext";
import { PageHeader, EmptyState } from "../components/ui/PageHeader";
import { ProductCard } from "../components/ui/ProductCard";

const DAY_MS = 24 * 60 * 60 * 1000;

/* ── Relative time helper ── */
function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return "Yesterday";
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let viewed = [];
    try {
      viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    } catch {
      viewed = [];
    }
    const cutoff = Date.now() - DAY_MS;
    setProducts(
      viewed
        .filter((p) => p.viewedAt > cutoff)
        .sort((a, b) => b.viewedAt - a.viewedAt)
        .slice(0, 10)
    );
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("recentlyViewed");
    setProducts([]);
  };

  if (products.length === 0) {
    return (
      <div className="bg-[#F6F7F9]">
        <PageHeader title="Recently Viewed" icon="fa-clock-rotate-left" />
        <EmptyState
          icon="fa-eye"
          title="No recent browsing"
          text="Products you view will appear here for 24 hours, so you can easily pick up where you left off."
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F6F7F9] pb-14">
      <PageHeader
        title="Recently Viewed"
        icon="fa-clock-rotate-left"
        subtitle={`${products.length} ${products.length === 1 ? "product" : "products"} from the last 24 hours`}
      >
        <button
          type="button"
          onClick={clearHistory}
          className="inline-flex items-center gap-2 rounded-lg border border-white/25 hover:bg-white/10 px-4 py-2 text-sm font-semibold !text-white transition"
        >
          <i className="fa-regular fa-trash-can text-xs !text-white"></i>
          Clear history
        </button>
      </PageHeader>

      <div className="px-4 md:px-6 lg:px-side pt-6 md:pt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {products.map((product) => (
            <div key={getProductId(product)} className="group/rv relative">
              <ProductCard product={product} />
              {/* "Viewed … ago" tag pinned to the bottom-left of the square image area */}
              <div className="pointer-events-none absolute inset-x-0 top-0 aspect-square transition-opacity lg:group-hover/rv:opacity-0">
                <span className="absolute left-2.5 bottom-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 shadow-sm px-2 py-1">
                  <i className="fa-regular fa-clock text-[9px] !text-gray-500"></i>
                  <span className="text-[10px] font-semibold !text-gray-600 whitespace-nowrap">{timeAgo(product.viewedAt)}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold !text-[#023350] hover:!text-primaryColor transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-xs !text-inherit"></i>
          <span className="!text-inherit">Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
}
