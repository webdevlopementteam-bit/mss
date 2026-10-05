import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useShop, getProductId } from "../context/ShopContext";
import { resolveImage, formatINR, getPricing } from "../components/ui/productUtils";

const SECTIONS = [
  {
    key: "onsale",
    title: "On Sale",
    tagline: "Limited-time price drops",
    icon: "fa-tags",
    accent: "bg-primaryColor",
    soft: "bg-primaryColor/[0.06]",
  },
  {
    key: "bestseller",
    title: "Best Sellers",
    tagline: "Most ordered by our customers",
    icon: "fa-fire-flame-curved",
    accent: "bg-[#E8890C]",
    soft: "bg-[#E8890C]/[0.07]",
  },
  {
    key: "toprated",
    title: "Top Rated",
    tagline: "Loved by professionals",
    icon: "fa-award",
    accent: "bg-secondaryColor",
    soft: "bg-secondaryColor/[0.07]",
  },
];

const ListRow = ({ item, rank }) => {
  const { addToCart } = useShop();
  const { isVariable, current, mrp, discount } = getPricing(item);
  const url = `/product/${item.slug || getProductId(item)}`;

  return (
    <div className="group flex items-center gap-3 md:gap-4 py-3.5 first:pt-0 last:pb-0">
      <Link
        to={url}
        className="relative shrink-0 w-[76px] h-[76px] md:w-[84px] md:h-[84px] rounded-xl bg-[#F6F7F9] overflow-hidden"
      >
        <img
          src={resolveImage(item.images?.[0])}
          alt={item.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/no-image.png";
          }}
          className="w-full h-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
        {rank && (
          <span className="absolute top-0 left-0 w-5 h-5 rounded-br-lg bg-[#023350] flex items-center justify-center text-[10px] font-bold !text-white">
            {rank}
          </span>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={url}>
          <h4
            className="text-[13.5px] md:text-sm font-semibold !text-gray-800 leading-snug overflow-hidden group-hover:!text-primaryColor transition-colors"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {item.title}
          </h4>
        </Link>
        <div className="mt-1.5 flex items-baseline flex-wrap gap-x-2">
          {isVariable && <span className="text-[11px] !text-gray-500">From</span>}
          <span className="text-[15px] font-bold !text-gray-900">₹{formatINR(current)}</span>
          {mrp > 0 && <span className="text-xs !text-gray-400 line-through">₹{formatINR(mrp)}</span>}
          {discount > 0 && <span className="text-xs font-semibold !text-green-600">{discount}% off</span>}
        </div>
      </div>

      {isVariable ? (
        <Link
          to={url}
          aria-label="Select options"
          className="shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primaryColor hover:border-primaryColor transition-colors group/btn"
        >
          <i className="fa-solid fa-sliders text-xs !text-gray-600 group-hover/btn:!text-white"></i>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => addToCart(item)}
          aria-label="Add to cart"
          className="shrink-0 w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-primaryColor hover:border-primaryColor transition-colors group/btn"
        >
          <i className="fa-solid fa-cart-plus text-xs !text-gray-600 group-hover/btn:!text-white"></i>
        </button>
      )}
    </div>
  );
};

const RowSkeleton = () => (
  <div className="flex items-center gap-4 py-3.5">
    <div className="w-[84px] h-[84px] rounded-xl bg-gray-100 animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-gray-100 rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
    </div>
  </div>
);

export const Catalogtype = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      SECTIONS.map((s) =>
        API.get(`/product/section/${s.key}`)
          .then((res) => [s.key, res.data?.data || []])
          .catch(() => [s.key, []])
      )
    )
      .then((entries) => setData(Object.fromEntries(entries)))
      .finally(() => setLoading(false));
  }, []);

  const visible = loading ? SECTIONS : SECTIONS.filter((s) => data[s.key]?.length);
  if (visible.length === 0) return null;

  return (
    <section className="px-4 md:px-6 lg:px-side mt-12 md:mt-20">
      <div
        className={`grid grid-cols-1 gap-5 lg:gap-6 ${
          visible.length >= 3 ? "md:grid-cols-2 xl:grid-cols-3" : visible.length === 2 ? "md:grid-cols-2" : ""
        }`}
      >
        {visible.map((section) => (
          <div
            key={section.key}
            className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col hover:shadow-[0_18px_40px_-20px_rgba(2,51,80,0.25)] transition-shadow duration-300"
          >
            {/* Header */}
            <div className={`flex items-center justify-between gap-3 px-5 py-4 ${section.soft} border-b border-gray-100`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-10 h-10 rounded-xl ${section.accent} flex items-center justify-center shrink-0 shadow-sm`}>
                  <i className={`fa-solid ${section.icon} !text-white text-[15px]`}></i>
                </span>
                <div className="min-w-0">
                  <h3 className="text-base md:text-lg font-bold !text-[#023350] leading-tight">{section.title}</h3>
                  <p className="text-xs !text-gray-500 truncate">{section.tagline}</p>
                </div>
              </div>
              <Link
                to="/shop"
                className="shrink-0 text-xs font-semibold !text-[#023350] hover:!text-primaryColor inline-flex items-center gap-1 transition-colors"
              >
                <span className="!text-inherit">View all</span>
                <i className="fa-solid fa-chevron-right text-[9px] !text-inherit"></i>
              </Link>
            </div>

            {/* Rows */}
            <div className="px-5 py-4 divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => <RowSkeleton key={i} />)
                : data[section.key].slice(0, 4).map((item, i) => (
                    <ListRow
                      key={getProductId(item)}
                      item={item}
                      rank={section.key === "bestseller" ? i + 1 : null}
                    />
                  ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Catalogtype;
