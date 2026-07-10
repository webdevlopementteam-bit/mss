import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useShop } from "../context/ShopContext";
import API from "../api/axios";
import { Link } from "react-router-dom";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ElegantArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    aria-label={direction === "next" ? "Next" : "Previous"}
    className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#C6272C]/70 shadow-[0_8px_20px_rgba(198,39,44,0.12)] hover:text-white hover:bg-primaryColor transition-all duration-300 absolute top-1/2 -translate-y-1/2 z-10 ${
      direction === "next" ? "right-0 md:-right-2" : "left-0 md:-left-2"
    }`}
  >
    <i
      className={`fa-solid ${
        direction === "next" ? "fa-chevron-right" : "fa-chevron-left"
      } text-[11px]`}
    ></i>
  </button>
);

export const TrendingItems = () => {
  const { addToCart, addToWishlist, wishlist } = useShop();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const res = await API.get("/product/section/trending");

        setProducts(res.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchTrendingProducts();
  }, []);

  const getImage = (product) => {
    const img = product.images?.[0];

    if (!img) return "/no-image.png";

    return img.startsWith("http")
      ? img
      : `${import.meta.env.VITE_IMAGE_BASE_URL}/${img}`;
  };

  // infinite needs total slides to exceed the largest slidesToShow value,
  // otherwise slick silently disables looping (this was the root cause)
  const canLoopDesktop = products.length > 4;

  const settings = {
    infinite: canLoopDesktop,
    speed: 700,
    autoplay: canLoopDesktop,
    autoplaySpeed: 3800,
    pauseOnHover: true,
    slidesToShow: 4.3,
    slidesToScroll: 1,
    swipeToSlide: true,
    arrows: true,
    nextArrow: <ElegantArrow direction="next" />,
    prevArrow: <ElegantArrow direction="prev" />,
    appendDots: (dots) => (
      <div className="!relative !mt-6">
        <ul className="flex justify-center gap-2 [&_li]:!w-2 [&_li]:!h-2 [&_li.slick-active_div]:!bg-primaryColor [&_li.slick-active_div]:!w-6 [&_li_div]:!w-2 [&_li_div]:!h-2 [&_li_div]:!rounded-full [&_li_div]:!bg-[#E9DDD4] [&_li_div]:transition-all [&_li_div]:duration-300">
          {dots}
        </ul>
      </div>
    ),
    customPaging: () => <div />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(3.3, products.length || 1),
          infinite: products.length > 3,
          autoplay: products.length > 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2.4, products.length || 1),
          infinite: products.length > 2,
          autoplay: products.length > 2,
          arrows: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: Math.min(1.4, products.length || 1),
          infinite: products.length > 1,
          autoplay: products.length > 1,
          arrows: false,
        },
      },
    ],
  };

  return (
    <section className="mt-10 md:mt-16 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-side flex flex-col items-center text-center mb-10 md:mb-10">
        <span className="text-[11px] md:text-xs font-semibold tracking-[0.3em] text-primaryColor/60 uppercase mb-3">
          Customer Favourites
        </span>
        <h2 className="text-[26px] md:text-[40px] font-bold text-[#2B2420] leading-tight">
          Trending Items
        </h2>
        <p className="mt-2 text-sm md:text-[15px] text-[#9A8F87] max-w-md">
          A gentle edit of the pieces everyone's adding to cart this week.
        </p>
      </div>

      {/* Slider */}
      <div className="relative px-4 md:px-10 lg:px-16 pb-2 [&_.slick-track]:!flex [&_.slick-track]:!items-stretch [&_.slick-slide]:!h-auto [&_.slick-slide>div]:!h-full">
        <Slider {...settings}>
          {products.map((product) => {
            const price = Number(product.price || 0);
            const salePrice = Number(product.salePrice || 0);

            const hasDiscount =
              !product.hasVariants && salePrice > 0 && price > 0 && salePrice < price;

            const discountPercentage = hasDiscount
              ? Math.round(((price - salePrice) / price) * 100)
              : 0;

            const rating = Number(product.rating || product.avgRating || 4);
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating - fullStars >= 0.5;

            return (
              <div key={product._id} className="h-full px-3 py-3">
                <div className="group relative h-full flex flex-col bg-[#FFFDFB] rounded-[32px] p-4 md:p-5 shadow-[0_10px_30px_rgba(198,39,44,0.06)] hover:shadow-[0_20px_45px_rgba(198,39,44,0.14)] transition-all duration-500 ease-out hover:-translate-y-1.5">

                  {/* Image */}
                  <div className="relative rounded-[24px] overflow-hidden aspect-square bg-gradient-to-br from-[#FBE9E7] via-[#FCF3EC] to-[#F7F0E8]">
                    {hasDiscount && (
                      <div className="absolute left-3.5 top-3.5 z-10">
                        <span className="bg-white/90 backdrop-blur text-primaryColor text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide">
                          {discountPercentage}% off
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => addToWishlist(product)}
                      aria-label="Add to wishlist"
                      className="absolute right-3.5 top-3.5 z-10 w-8 h-8 rounded-full bg-white/85 backdrop-blur flex items-center justify-center text-primaryColor/80 shadow-sm hover:bg-primaryColor hover:text-white transition-colors duration-300"
                    >
                      <i
                        className={`${
                          wishlist.some((item) => item._id === product._id)
                            ? "fa-solid"
                            : "fa-regular"
                        } fa-heart text-[12px]`}
                      ></i>
                    </button>

                    <img
                      src={getImage(product)}
                      alt={product.title}
                      className="w-full h-full object-contain p-7 transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                    />

                    <Link
                      to={`/product/${product.slug}`}
                      className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 bg-white/95 backdrop-blur text-[#2B2420] text-[11px] font-semibold py-2.5 rounded-full text-center shadow-sm hover:bg-white"
                    >
                      Quick View
                    </Link>
                  </div>

                  {/* Content */}
                  <div className="pt-4 px-1 flex flex-col flex-1">
                    <div className="flex gap-0.5 mb-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <i
                          key={i}
                          className={`text-[10px] text-[#E8B23D] ${
                            i < fullStars
                              ? "fa-solid fa-star"
                              : i === fullStars && hasHalfStar
                              ? "fa-solid fa-star-half-stroke"
                              : "fa-regular fa-star"
                          }`}
                        ></i>
                      ))}
                    </div>

                    <h3
                      className="font-semibold text-[14px] md:text-[15px] text-[#2B2420] leading-snug mb-3 overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {product.title}
                    </h3>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-baseline gap-2">
                        {product.hasVariants ? (
                          <span className="text-primaryColor font-bold text-base md:text-lg">
                            From ₹{product.minPrice ?? price}
                          </span>
                        ) : (
                          <>
                            <span className="text-primaryColor font-bold text-base md:text-lg">
                              ₹{salePrice || price}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-[#C7BAB1] line-through">
                                ₹{price}
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {product.hasVariants ? (
                        <Link
                          to={`/product/${product.slug}`}
                          aria-label="Select options"
                          className="w-9 h-9 rounded-full bg-[#FBE9E7] text-primaryColor flex items-center justify-center hover:bg-primaryColor hover:text-white transition-colors duration-300"
                        >
                          <i className="fa-solid fa-sliders text-[12px]"></i>
                        </Link>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          aria-label="Add to cart"
                          className="w-9 h-9 rounded-full bg-[#FBE9E7] text-primaryColor flex items-center justify-center hover:bg-primaryColor hover:text-white transition-colors duration-300"
                        >
                          <i className="fa-solid fa-bag-shopping text-[12px]"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>
    </section>
  );
};

export default TrendingItems;