import { useRef } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { useViewportWidth } from "../../hooks/useViewportWidth";

export const SectionHeader = ({ eyebrow, title, subtitle, viewAllTo, viewAllLabel = "View All", children }) => (
  <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
    <div className="min-w-0">
      {eyebrow && (
        <p className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] !text-primaryColor mb-2">
          <span className="w-6 h-[2px] bg-primaryColor rounded-full"></span>
          {eyebrow}
        </p>
      )}
      <h2 className="text-[22px] md:text-[30px] font-bold !text-[#023350] leading-tight">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm md:text-[15px] !text-gray-500 max-w-xl">{subtitle}</p>}
    </div>

    <div className="flex items-center gap-3 shrink-0">
      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="group inline-flex items-center gap-1.5 text-[13px] md:text-sm font-semibold !text-[#023350] hover:!text-primaryColor transition-colors"
        >
          <span className="!text-inherit">{viewAllLabel}</span>
          <i className="fa-solid fa-arrow-right text-[11px] !text-inherit transition-transform group-hover:translate-x-1"></i>
        </Link>
      )}
      {children}
    </div>
  </div>
);

const NavButton = ({ dir, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={dir === "next" ? "Next" : "Previous"}
    className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:bg-[#023350] hover:border-[#023350] transition-colors duration-300 group/nav"
  >
    <i
      className={`fa-solid ${dir === "next" ? "fa-chevron-right" : "fa-chevron-left"} text-[11px] !text-[#023350] group-hover/nav:!text-white`}
    ></i>
  </button>
);

/* Horizontal product carousel with header-mounted arrows (the pattern used
 * by most large Indian e-commerce storefronts). Cards per view come from
 * useViewportWidth, not slick's `responsive` (unreliable here). */
export const ProductRail = ({ products, loading, emptyText, ...header }) => {
  const sliderRef = useRef(null);
  const count = products.length;

  const vw = useViewportWidth();
  const perView = vw < 640 ? 2 : vw < 1024 ? 3 : vw < 1280 ? 4 : 5;
  const loop = count > perView;

  const settings = {
    dots: false,
    arrows: false,
    infinite: loop,
    autoplay: loop && perView > 2,
    autoplaySpeed: 4500,
    pauseOnHover: true,
    speed: 550,
    slidesToShow: perView,
    slidesToScroll: 1,
    swipeToSlide: true,
  };

  const showNav = !loading && count > 2;

  // Home-page rails simply disappear when the admin has nothing tagged for them.
  if (!loading && count === 0 && !emptyText) return null;

  return (
    <section className="px-4 md:px-6 lg:px-side mt-12 md:mt-20">
      <SectionHeader {...header}>
        {showNav && (
          <div className="hidden sm:flex items-center gap-2 pl-3 ml-1 border-l border-gray-200">
            <NavButton dir="prev" onClick={() => sliderRef.current?.slickPrev()} />
            <NavButton dir="next" onClick={() => sliderRef.current?.slickNext()} />
          </div>
        )}
      </SectionHeader>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={i >= 2 ? (i >= 4 ? "hidden xl:block" : i >= 3 ? "hidden lg:block" : "hidden sm:block") : ""}>
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <p className="text-center !text-gray-400 py-10 border border-dashed border-gray-200 rounded-2xl">{emptyText}</p>
      ) : (
        <div className="-mx-1.5 md:-mx-2.5 [&_.slick-track]:!flex [&_.slick-track]:!ml-0 [&_.slick-slide]:!h-auto [&_.slick-slide>div]:!h-full">
          <Slider key={perView} ref={sliderRef} {...settings}>
            {products.map((product) => (
              <div key={product._id || product.id} className="h-full px-1.5 md:px-2.5 py-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </section>
  );
};

export default ProductRail;
