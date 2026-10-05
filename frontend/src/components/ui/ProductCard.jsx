import { Link } from "react-router-dom";
import { useShop, getProductId } from "../../context/ShopContext";
import { resolveImage, formatINR, getPricing, getCategoryName } from "./productUtils";

/* Shared storefront product card — used by Trending, Featured and the
 * Related Products rail so every product grid on the site looks the same.
 * Heights stay equal inside sliders because the card is h-full + flex-col
 * and the price/CTA block is pushed to the bottom with mt-auto. */
export const ProductCard = ({ product, compact = false }) => {
  const { addToCart, addToWishlist, wishlist } = useShop();
  const pid = getProductId(product);
  const isWishlisted = wishlist.some((item) => getProductId(item) === pid);
  const { isVariable, current, mrp, discount } = getPricing(product);
  const category = getCategoryName(product);
  const brand = product.brand?.name;
  const outOfStock = !isVariable && product.quantity !== undefined && Number(product.quantity) <= 0;
  const url = `/product/${product.slug || pid}`;

  return (
    <div className="group relative h-full flex flex-col bg-white rounded-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-[0_18px_40px_-12px_rgba(2,51,80,0.22)]">
      {/* Media */}
      <div className={`relative ${compact ? "aspect-[5/4]" : "aspect-square"} bg-[#F6F7F9] overflow-hidden`}>
        <Link to={url} aria-label={product.title} className="block w-full h-full">
          <img
            src={resolveImage(product.images?.[0])}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/no-image.png";
            }}
            className={`w-full h-full object-contain ${compact ? "p-3 md:p-4" : "p-5 md:p-7"} mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105`}
          />
        </Link>

        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 pointer-events-none">
          {discount > 0 && (
            <span className="bg-primaryColor text-white text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-md leading-none">
              {discount}% OFF
            </span>
          )}
          {outOfStock && (
            <span className="bg-gray-800 text-white text-[10px] md:text-[11px] font-semibold px-2 py-1 rounded-md leading-none">
              Sold out
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => addToWishlist(product)}
          aria-label={isWishlisted ? "In wishlist" : "Add to wishlist"}
          className={`absolute right-2.5 top-2.5 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
            isWishlisted ? "bg-primaryColor" : "bg-white hover:bg-primaryColor group/wish"
          }`}
        >
          <i
            className={`fa-heart text-[12px] md:text-[13px] transition-colors ${
              isWishlisted
                ? "fa-solid !text-white"
                : "fa-regular !text-gray-500 group-hover/wish:!text-white"
            }`}
          ></i>
        </button>

        {/* Desktop hover quick-view strip */}
        <Link
          to={url}
          className="hidden lg:flex absolute inset-x-0 bottom-0 items-center justify-center gap-2 py-2.5 bg-[#023350]/90 backdrop-blur-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <i className="fa-regular fa-eye !text-white text-xs"></i>
          <span className="!text-white text-xs font-semibold tracking-wide">Quick View</span>
        </Link>
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${compact ? "p-3" : "p-3 md:p-4"}`}>
        {(brand || category) && (
          <p className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider !text-secondaryColor truncate mb-1">
            {brand || category}
          </p>
        )}

        <Link to={url}>
          <h3
            className="text-[13px] md:text-[14.5px] font-semibold !text-gray-800 leading-snug min-h-[2.6em] overflow-hidden hover:!text-primaryColor transition-colors"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {product.title}
          </h3>
        </Link>

        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <span className="inline-flex items-center gap-1 bg-secondaryColor rounded px-1.5 py-0.5">
              <span className="!text-white text-[10px] font-bold">{Number(product.rating).toFixed(1)}</span>
              <i className="fa-solid fa-star !text-white text-[8px]"></i>
            </span>
          </div>
        )}

        <div className={`mt-auto ${compact ? "pt-2" : "pt-3"}`}>
          <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
            {isVariable && <span className="text-[11px] !text-gray-500">From</span>}
            <span className="text-base md:text-lg font-bold !text-gray-900">₹{formatINR(current)}</span>
            {mrp > 0 && (
              <>
                <span className="text-[11px] md:text-xs !text-gray-400 line-through">₹{formatINR(mrp)}</span>
                <span className="text-[11px] md:text-xs font-semibold !text-green-600">
                  Save ₹{formatINR(mrp - current)}
                </span>
              </>
            )}
          </div>

          {isVariable ? (
            <Link
              to={url}
              className={`${compact ? "mt-2 h-9" : "mt-3 h-9 md:h-10"} w-full rounded-lg border border-primaryColor flex items-center justify-center gap-2 text-[12px] md:text-[13px] font-semibold !text-primaryColor hover:bg-primaryColor hover:!text-white transition-colors duration-300 group/cta`}
            >
              <i className="fa-solid fa-sliders text-[11px] !text-primaryColor group-hover/cta:!text-white"></i>
              <span className="!text-inherit">Select Options</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product)}
              className={`${compact ? "mt-2 h-9" : "mt-3 h-9 md:h-10"} w-full rounded-lg border border-primaryColor flex items-center justify-center gap-2 text-[12px] md:text-[13px] font-semibold !text-primaryColor hover:bg-primaryColor hover:!text-white transition-colors duration-300 disabled:border-gray-300 disabled:!text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed group/cta`}
            >
              <i className="fa-solid fa-cart-plus text-[12px] !text-inherit"></i>
              <span className="!text-inherit">{outOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="h-full flex flex-col bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
    <div className="aspect-square bg-gray-100 animate-pulse" />
    <div className="p-4 space-y-2.5">
      <div className="h-2.5 w-1/3 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse mt-4" />
      <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
    </div>
  </div>
);

export default ProductCard;
