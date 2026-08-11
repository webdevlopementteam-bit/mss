import React, { useEffect, useState } from "react";
import API from "../api/axios";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BrandArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    aria-label={direction === "next" ? "Next" : "Previous"}
    className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#2B2420]/60 shadow-[0_8px_20px_rgba(43,36,32,0.08)] hover:text-[#2B2420] hover:shadow-[0_8px_20px_rgba(43,36,32,0.14)] transition-all duration-300 absolute top-1/2 -translate-y-1/2 z-10 ${
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

export const Popularbrands = () => {
  const [brands, setBrands] = useState([]);

  // Tracks mobile-width viewport so slidesToShow can be forced directly,
  // instead of relying only on react-slick's own breakpoint matching
  // (which was not reliably kicking in on similar sliders elsewhere).
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await API.get("/brand?limit=30&isPublished=true");
        setBrands(res.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBrands();
  }, []);

  const getImage = (img) => {
    if (!img) return "";

    return img.startsWith("http")
      ? img
      : `${import.meta.env.VITE_IMAGE_BASE_URL}/${img}`;
  };

  const mobileSlidesToShow = Math.min(2, brands.length || 1);

  const settings = {
    dots: false,
    infinite: isMobile ? brands.length > 2 : brands.length > 6,
    speed: 700,
    autoplay: true,
    autoplaySpeed: 2800,
    pauseOnHover: true,
    slidesToShow: isMobile ? mobileSlidesToShow : 6.3,
    slidesToScroll: isMobile ? 2 : 1,
    swipeToSlide: !isMobile,
    arrows: !isMobile,
    nextArrow: <BrandArrow direction="next" />,
    prevArrow: <BrandArrow direction="prev" />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 4.3 } },
      { breakpoint: 1024, settings: { slidesToShow: 3.3, arrows: false } },
      {
        breakpoint: 640,
        settings: {
          // exactly 2 brands visible on mobile
          slidesToShow: mobileSlidesToShow,
          slidesToScroll: 2,
          arrows: false,
        },
      },
    ],
  };

  return (
    <section className="mt-14 md:mt-24 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-side flex flex-col items-center text-center mb-9 md:mb-12">
        <span className="text-[11px] md:text-xs font-semibold tracking-[0.3em] text-secondaryColor uppercase mb-3">
          Shop By Brand
        </span>
        <h2 className="text-[24px] md:text-[36px] font-bold text-[#2B2420] leading-tight">
          Popular Brands
        </h2>
        <span className="mt-3 w-10 h-[2px] bg-[#B08A4E]/50 rounded-full"></span>
      </div>

      {/* Slider */}
      <div className="relative px-3 sm:px-4 md:px-10 lg:px-16 overflow-hidden h-[168px] sm:h-[178px] md:h-[208px]">
        <Slider key={isMobile ? "mobile" : "desktop"} {...settings}>
          {brands.map((brand) => (
            <div key={brand._id} className="px-1.5 sm:px-2.5">
              <div className="group relative bg-white rounded-2xl md:rounded-[22px] py-4 sm:py-5 md:py-6 px-3 sm:px-4 flex flex-col items-center justify-center h-[150px] sm:h-[160px] md:h-[190px] border border-[#EFE6DF] shadow-[0_4px_16px_rgba(43,36,32,0.04)] hover:border-[#E3D2B5] hover:shadow-[0_16px_34px_rgba(43,36,32,0.1)] transition-all duration-400 ease-out hover:-translate-y-1.5 cursor-pointer">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl md:rounded-2xl bg-[#FAF7F3] flex items-center justify-center overflow-hidden">
                  <img
                    src={getImage(brand.image)}
                    alt={brand.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl object-contain transition-transform duration-400 ease-out group-hover:scale-110"
                  />
                </div>

                <p className="mt-3 sm:mt-4 text-center text-[11px] sm:text-xs md:text-sm font-semibold text-[#2B2420] leading-tight line-clamp-2">
                  {brand.name}
                </p>

                <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 group-hover:w-8 h-[2px] bg-[#B08A4E] transition-all duration-400 ease-out rounded-full"></span>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Popularbrands;