import { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import API from "../api/axios";
import { useViewportWidth } from "../hooks/useViewportWidth";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const getImage = (img) => {
  if (!img) return "";
  return img.startsWith("http") ? img : `${import.meta.env.VITE_IMAGE_BASE_URL}${img}`;
};

/* "Peek" carousel: the active banner sits centre-stage while the previous
 * and next banners peek in from the sides, scaled down and dimmed (see
 * .hero-peek in index.css). Arrows float over the peeking edges. */
export const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    API.get("/cms/home")
      .then((res) => setBanners(res.data?.banners || []))
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  const multiple = banners.length > 1;
  const isMobile = useViewportWidth() < 768;

  const settings = {
    dots: false,
    arrows: false,
    infinite: multiple,
    centerMode: multiple,
    centerPadding: isMobile ? "5%" : "9%",
    speed: 750,
    cssEase: "cubic-bezier(0.65, 0, 0.35, 1)",
    autoplay: multiple,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  if (loading) {
    return (
      <section className="pt-4 md:pt-6">
        <div className="mx-[5%] md:mx-[9%] aspect-[16/7] sm:aspect-[16/6] rounded-2xl md:rounded-[28px] bg-gray-100 animate-pulse" />
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="relative pt-4 md:pt-6 overflow-hidden">
      {/* Soft brand glow behind the stage */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[85%] bg-[radial-gradient(60%_70%_at_50%_0%,rgba(51,135,121,0.14),transparent_70%)]" />

      <div className="relative hero-peek">
        <Slider key={isMobile ? "m" : "d"} ref={sliderRef} {...settings}>
          {banners.map((banner, index) => (
            <div key={index} className="px-1.5 md:px-3">
              <div className="hero-peek-card relative rounded-2xl md:rounded-[28px] overflow-hidden bg-gray-100 shadow-[0_25px_60px_-25px_rgba(2,51,80,0.45)]">
                <img
                  src={getImage(banner.image)}
                  alt={`Banner ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : undefined}
                  className="w-full aspect-[16/7] sm:aspect-[16/7] object-cover block"
                />
                <span className="hero-peek-veil absolute inset-0 bg-white/50 pointer-events-none" />
              </div>
            </div>
          ))}
        </Slider>

        {multiple &&
          ["prev", "next"].map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => (dir === "next" ? sliderRef.current?.slickNext() : sliderRef.current?.slickPrev())}
              aria-label={dir === "next" ? "Next banner" : "Previous banner"}
              className={`absolute top-1/2 -translate-y-1/2 -mt-3 z-10 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white shadow-[0_10px_30px_-8px_rgba(2,51,80,0.45)] flex items-center justify-center transition-all duration-300 hover:bg-primaryColor hover:scale-110 group/arrow ${
                dir === "next" ? "right-1 md:right-[5.5%]" : "left-1 md:left-[5.5%]"
              }`}
            >
              <i
                className={`fa-solid ${dir === "next" ? "fa-chevron-right" : "fa-chevron-left"} text-xs md:text-sm !text-[#023350] group-hover/arrow:!text-white`}
              ></i>
            </button>
          ))}
      </div>
    </section>
  );
};

export default Hero;
