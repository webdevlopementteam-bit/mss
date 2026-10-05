import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import doctor from "../assets/home/doctor.png";
import API from "../api/axios";
import { ProductCard, ProductCardSkeleton } from "../components/ui/ProductCard";
import { SectionHeader } from "../components/ui/ProductRail";

const ALL = "__all__";
// 8 fill two rows of four on xl; below xl only the first 6 are shown.
const VISIBLE = 8;

const PROMO_POINTS = [
  ["fa-shield-heart", "100% genuine, sourced from authorised brands"],
  ["fa-boxes-stacked", "Bulk & institutional orders welcome"],
  ["fa-truck-fast", "Fast dispatch across India"],
];

export const Popularitem = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(ALL);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/product/section/popular")
      .then((res) => {
        const data = res.data?.data || [];
        setPopularProducts(data);

        // Tabs come ONLY from categories of products tagged "popular".
        const catMap = {};
        data.forEach((product) => {
          (product.category || []).forEach((c) => {
            const cat = typeof c === "object" ? c : { _id: c, name: c };
            if (cat?._id && !catMap[cat._id]) catMap[cat._id] = cat;
          });
        });
        setCategories(Object.values(catMap).slice(0, 6));
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = (
    selectedCategory === ALL
      ? popularProducts
      : popularProducts.filter((product) =>
          (product.category || []).some((c) => c === selectedCategory || c?._id === selectedCategory)
        )
  ).slice(0, VISIBLE);

  if (!loading && popularProducts.length === 0) return null;

  const tabs = [{ _id: ALL, name: "All" }, ...categories];

  return (
    <section className="px-4 md:px-6 lg:px-side mt-12 md:mt-20">
      <SectionHeader
        eyebrow="Best Sellers"
        title="Popular Products"
        subtitle="Our most-loved picks, sorted by category."
        viewAllTo="/shop"
        viewAllLabel="All Products"
      />

      {/* Segmented category tabs */}
      {categories.length > 1 && (
        <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 md:mx-0 md:px-0 mb-6 md:mb-8">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-[#F1F3F6] border border-gray-200/70">
            {tabs.map((category) => {
              const active = selectedCategory === category._id;
              return (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setSelectedCategory(category._id)}
                  className={`whitespace-nowrap px-4 md:px-5 py-2 rounded-lg text-[13px] md:text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-white shadow-[0_2px_8px_rgba(2,51,80,0.12)] !text-primaryColor"
                      : "!text-gray-500 hover:!text-[#023350]"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-6">
        {/* Promo strip — right of the products on desktop, below them on mobile */}
        <div className="relative order-2 overflow-hidden rounded-2xl bg-[#023350] p-5 md:p-6 flex flex-col">
          <div className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full bg-secondaryColor/30 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 bottom-10 w-40 h-40 rounded-full bg-primaryColor/30 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase !text-white">
              <i className="fa-solid fa-user-doctor text-[10px] !text-white"></i>
              Trusted Care
            </span>
            <h3 className="mt-3 text-lg md:text-xl font-bold leading-snug !text-white">
              Recommended by healthcare experts
            </h3>
            <ul className="mt-3 space-y-2">
              {PROMO_POINTS.map(([icon, text]) => (
                <li key={text} className="flex items-start gap-2.5 text-[13px] leading-snug !text-white/80">
                  <i className={`fa-solid ${icon} text-[12px] mt-0.5 !text-[#7fd1c3]`}></i>
                  <span className="!text-white/80">{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-primaryColor hover:bg-[#9e1d21] rounded-lg px-4 py-2.5 text-sm font-semibold !text-white transition-colors"
              >
                Shop Now <i className="fa-solid fa-arrow-right text-[11px] !text-white"></i>
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 rounded-lg px-4 py-2.5 text-sm font-semibold !text-white transition-colors"
              >
                Bulk Enquiry
              </Link>
            </div>
          </div>

          <img
            src={doctor}
            alt="Healthcare expert"
            className="relative mt-3 -mb-5 md:-mb-6 w-40 md:w-48 lg:w-full lg:max-w-[220px] lg:flex-1 lg:min-h-0 self-center object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
          />
        </div>

        {/* Products */}
        <div className="order-1 lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {loading
              ? Array.from({ length: VISIBLE }).map((_, i) => (
                  <div key={i} className={i >= 6 ? "hidden xl:block" : ""}>
                    <ProductCardSkeleton />
                  </div>
                ))
              : filteredProducts.map((product, i) => (
                  <div key={product._id} className={i >= 6 ? "hidden xl:block" : ""}>
                    <ProductCard product={product} compact />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Popularitem;
