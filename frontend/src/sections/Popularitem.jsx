import React, { useState, useEffect } from "react";
import doctor from "../assets/home/doctor.png";
import { useShop } from "../context/ShopContext";
import { Link } from "react-router-dom";
import API from "../api/axios";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const Popularitem = () => {
  const { addToCart, addToWishlist, wishlist } = useShop();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const res = await API.get("/product/section/popular");
        const data = res.data?.data || [];

        setPopularProducts(data);

        // ✅ derive categories ONLY from products that are tagged "popular"
        const catMap = {};

        data.forEach((product) => {
          (product.category || []).forEach((c) => {
            const cat = typeof c === "object" ? c : { _id: c, name: c };
            if (cat?._id && !catMap[cat._id]) {
              catMap[cat._id] = cat;
            }
          });
        });

        const derivedCategories = Object.values(catMap).slice(0, 6);

        setCategories(derivedCategories);
        setSelectedCategory(derivedCategories[0]?._id || "");
      } catch (error) {
        console.log(error);
      }
    };

    fetchPopularProducts();
  }, []);

  const getImage = (product) => {
    const img = product.images?.[0];

    if (!img) return "/no-image.png";

    return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
  };

  const filteredProducts = popularProducts
    .filter((product) =>
      (product.category || []).some(
        (c) => c === selectedCategory || c?._id === selectedCategory
      )
    )
    .slice(0, 4);

  return (
    <section className="px-4 md:px-6 lg:px-side mt-14 md:mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Products Section */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
            <div>
              <span className="text-[11px] md:text-xs font-semibold tracking-[0.3em] text-primaryColor/60 uppercase">
                Best Sellers
              </span>
              <h2 className="mt-2 text-[24px] md:text-[34px] font-bold text-[#2B2420] leading-tight">
                Popular Items
              </h2>
            </div>

            <Link to="/shop" className="group shrink-0">
              <button className="flex items-center gap-2 text-[#2B2420] font-semibold text-sm">
                <span className="border-b-2 border-[#2B2420] group-hover:border-primaryColor group-hover:text-primaryColor transition-colors duration-300 pb-0.5">
                  All Products
                </span>
                <span className="w-7 h-7 rounded-full bg-[#2B2420] group-hover:bg-primaryColor flex items-center justify-center transition-colors duration-300">
                  <i className="fa-solid fa-arrow-right text-white text-[10px] transition-transform duration-300 group-hover:translate-x-0.5"></i>
                </span>
              </button>
            </Link>
          </div>

          {/* Categories */}
          <div className="flex gap-2 md:gap-2.5 overflow-x-auto scrollbar-hide mt-7 pb-1">
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`font-semibold text-xs md:text-sm py-2.5 px-5 md:px-6 whitespace-nowrap rounded-full transition-all duration-300 border ${
                  selectedCategory === category._id
                    ? "bg-primaryColor text-white border-primaryColor shadow-[0_8px_18px_rgba(198,39,44,0.22)]"
                    : "bg-white text-[#8A7E76] border-[#EFE6DF] hover:border-primaryColor/40 hover:text-primaryColor"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Products Grid - horizontal list cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mt-8 md:mt-9">
            {filteredProducts.map((product) => {
              const price = Number(product.price || 0);
              const salePrice = Number(product.salePrice || 0);
              const discount =
                !product.hasVariants && salePrice > 0 && price > 0 && salePrice < price
                  ? Math.round(((price - salePrice) / price) * 100)
                  : null;

              return (
                <div
                  key={product._id}
                  className="group relative flex items-center gap-4 bg-white rounded-[22px] p-3.5 md:p-4 border border-[#F1E9E2] hover:border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(198,39,44,0.12)] transition-all duration-400 ease-out hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FBE9E7] to-[#F7F0E8]">
                    {discount && (
                      <span className="absolute left-1.5 top-1.5 z-10 bg-primaryColor text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                        -{discount}%
                      </span>
                    )}
                    <img
                      src={getImage(product)}
                      alt={product.title}
                      className="w-full h-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col self-stretch py-1">
                    {product.badge && (
                      <span
                        className={`self-start mb-1.5 text-white px-2 py-0.5 rounded-full uppercase text-[9px] font-bold tracking-wide ${
                          product.badge === "sale"
                            ? "bg-primaryColor"
                            : product.badge === "hot"
                            ? "bg-secondaryColor"
                            : product.badge === "10% off"
                            ? "bg-[#E8B23D]"
                            : "bg-sky-400"
                        }`}
                      >
                        {product.badge}
                      </span>
                    )}

                    <h3 className="font-semibold text-[13px] md:text-[15px] text-[#2B2420] leading-snug line-clamp-2 mb-1.5">
                      {product.title}
                    </h3>

                    <div className="flex gap-0.5 mb-auto">
                      <i className="fa-solid fa-star text-[#E8B23D] text-[10px]"></i>
                      <i className="fa-solid fa-star text-[#E8B23D] text-[10px]"></i>
                      <i className="fa-solid fa-star text-[#E8B23D] text-[10px]"></i>
                      <i className="fa-solid fa-star text-[#E8B23D] text-[10px]"></i>
                      <i className="fa-regular fa-star text-[#E8B23D] text-[10px]"></i>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-2">
                        {product.hasVariants ? (
                          <span className="text-primaryColor font-bold text-sm md:text-base">
                            From ₹{product.minSalePrice ?? product.minPrice ?? price}
                          </span>
                        ) : discount ? (
                          <>
                            <span className="text-primaryColor font-bold text-sm md:text-base">
                              ₹{salePrice}
                            </span>
                            <span className="text-[10px] text-[#C7BAB1] line-through">
                              ₹{price}
                            </span>
                          </>
                        ) : (
                          <span className="text-primaryColor font-bold text-sm md:text-base">
                            ₹{price}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/product/${product.slug}`}
                          className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#F7F0EC] text-[#8A7E76] flex items-center justify-center hover:bg-primaryColor hover:text-white transition-colors duration-300"
                          aria-label="Quick view"
                        >
                          <i className="fa-regular fa-eye text-[10px]"></i>
                        </Link>

                        <button
                          onClick={() => addToWishlist(product)}
                          aria-label="Add to wishlist"
                          className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#F7F0EC] text-[#8A7E76] flex items-center justify-center hover:bg-primaryColor hover:text-white transition-colors duration-300"
                        >
                          <i
                            className={`${
                              wishlist.some((item) => item._id === product._id)
                                ? "fa-solid"
                                : "fa-regular"
                            } fa-heart text-[10px]`}
                          ></i>
                        </button>

                        {product.hasVariants ? (
                          <Link
                            to={`/product/${product.slug}`}
                            aria-label="Select options"
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FBE9E7] text-primaryColor flex items-center justify-center hover:bg-primaryColor hover:text-white transition-colors duration-300"
                          >
                            <i className="fa-solid fa-sliders text-[10px]"></i>
                          </Link>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            aria-label="Add to cart"
                            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FBE9E7] text-primaryColor flex items-center justify-center hover:bg-primaryColor hover:text-white transition-colors duration-300"
                          >
                            <i className="fa-solid fa-bag-shopping text-[10px]"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Banner */}
        <div className="relative bg-gradient-to-b from-[#FBE9E7] via-[#FCF3EC] to-[#F7F0E8] flex flex-col justify-between rounded-[28px] min-h-[300px] md:min-h-[420px] p-6 md:p-7 overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-primaryColor/70 uppercase">
              Trusted Care
            </span>
            <h3 className="mt-2 text-lg md:text-xl font-bold text-[#2B2420] leading-snug max-w-[200px]">
              Recommended by healthcare experts
            </h3>
          </div>

          <img
            src={doctor}
            alt="doctor"
            className="relative z-10 w-44 md:w-60 lg:w-64 object-contain self-center mt-4"
          />
        </div>
      </div>
    </section>
  );
};

export default Popularitem;