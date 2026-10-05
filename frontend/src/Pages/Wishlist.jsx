import { useShop, getProductId } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { PageHeader, EmptyState } from "../components/ui/PageHeader";
import { formatINR } from "../components/ui/productUtils";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

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

  if (wishlist.length === 0) {
    return (
      <div className="bg-[#F6F7F9]">
        <PageHeader title="My Wishlist" icon="fa-heart" />
        <EmptyState
          icon="fa-heart"
          title="Nothing saved yet"
          text="Tap the heart on any product to save it here for later."
          cta="Explore Products"
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F6F7F9] pb-14">
      <PageHeader
        title="My Wishlist"
        icon="fa-heart"
        subtitle={`${wishlist.length} saved ${wishlist.length === 1 ? "item" : "items"}`}
      >
        <button
          type="button"
          onClick={() => wishlist.forEach((item) => removeFromWishlist(getProductId(item)))}
          className="inline-flex items-center gap-2 rounded-lg border border-white/25 hover:bg-white/10 px-4 py-2 text-sm font-semibold !text-white transition"
        >
          <i className="fa-regular fa-trash-can text-xs !text-white"></i>
          Clear all
        </button>
      </PageHeader>

      <div className="px-4 md:px-6 lg:px-side pt-6 md:pt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {wishlist.map((item) => {
            const id = getProductId(item);
            const name = item.title ?? item.name;
            const price = getWishlistPrice(item);
            const url = `/product/${item.slug || id}`;
            const mrp = !item.hasVariants && item.salePrice > 0 && item.salePrice < item.price ? item.price : 0;

            return (
              <div
                key={id}
                className="group relative flex flex-col bg-white rounded-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-[0_18px_40px_-12px_rgba(2,51,80,0.22)]"
              >
                <Link to={url} className="relative block aspect-square bg-[#F6F7F9] overflow-hidden">
                  <img
                    src={getImage(item) || "/no-image.png"}
                    alt={name}
                    onError={(e) => {
                      e.currentTarget.src = "/no-image.png";
                    }}
                    className="w-full h-full object-contain p-5 md:p-7 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => removeFromWishlist(id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-2.5 top-2.5 w-8 h-8 md:w-9 md:h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition group/rm"
                >
                  <i className="fa-solid fa-xmark text-sm !text-gray-500 group-hover/rm:!text-red-500"></i>
                </button>

                <div className="flex flex-col flex-1 p-3 md:p-4">
                  <Link to={url}>
                    <h3 className="text-[13px] md:text-[14.5px] font-semibold !text-gray-800 leading-snug line-clamp-2 min-h-[2.6em] hover:!text-primaryColor transition-colors">
                      {name}
                    </h3>
                  </Link>
                  <div className="mt-auto pt-3 flex items-baseline gap-2 flex-wrap">
                    {item.hasVariants && <span className="text-[11px] !text-gray-500">From</span>}
                    <span className="text-base md:text-lg font-bold !text-gray-900">₹{formatINR(price)}</span>
                    {mrp > 0 && <span className="text-xs !text-gray-400 line-through">₹{formatINR(mrp)}</span>}
                  </div>

                  {item.hasVariants ? (
                    <Link
                      to={url}
                      className="mt-3 h-9 md:h-10 w-full rounded-lg bg-[#023350] hover:bg-primaryColor flex items-center justify-center gap-2 text-[12px] md:text-[13px] font-semibold !text-white transition-colors"
                    >
                      <i className="fa-solid fa-sliders text-[11px] !text-white"></i>
                      Select Options
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(item);
                        removeFromWishlist(id);
                      }}
                      className="mt-3 h-9 md:h-10 w-full rounded-lg bg-[#023350] hover:bg-primaryColor flex items-center justify-center gap-2 text-[12px] md:text-[13px] font-semibold !text-white transition-colors"
                    >
                      <i className="fa-solid fa-cart-arrow-down text-[11px] !text-white"></i>
                      Move to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
