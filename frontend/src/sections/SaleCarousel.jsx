import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import productbanner from "../assets/home/productbanner.png";

export const SaleCarousel = () => {
  const carouselsettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <>
      <div className="bg-primaryColor/20 px-4 md:px-8 lg:px-side py-10 md:py-14 lg:py-20 mt-10 md:mt-16 relative overflow-hidden before:content-[''] before:absolute before:w-48 md:before:w-96 before:h-48 md:before:h-96 before:bg-primaryColor/10 before:rounded-full before:-top-20 md:before:-top-40 before:-left-10 md:before:left-0 after:hidden lg:after:block after:content-['DEAL'] after:absolute after:-right-32 after:text-[170px] after:font-bold after:top-1/4 after:text-primaryColor/20 after:-rotate-90">
        <Slider {...carouselsettings}>
          {[1, 2, 3].map((item) => (
            <div key={item}>
              <div className="flex flex-col-reverse lg:flex-row justify-between items-center gap-6 lg:gap-10 lg:pr-24">
                {/* Content */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <h4 className="uppercase text-sm md:text-lg lg:text-2xl font-semibold tracking-widest text-secondaryColor">
                    Weekly Deal
                  </h4>

                  <h3 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-semibold">
                    Best Deal For This Week
                  </h3>

                  <p className="mt-3 text-sm md:text-base text-black/80 tracking-wide">
                    There are many variations of passages available but the
                    majority have suffered alteration in some form by injected
                    humour, or randomised words which don't look even slightly
                    believable.
                  </p>
                     <div className="md:hidden w-full lg:w-auto flex justify-center">
                  <img
                    src={productbanner}
                    alt="productbanner"
                    className="w-full max-w-[280px] sm:max-w-[400px] md:max-w-[600px] lg:w-[600px] lg:h-[350px] h-auto object-cover"
                  />
                </div>
                  {/* Countdown */}
                  <div className="grid grid-cols-4 gap-2 md:gap-3 mt-5">
                    <div className="bg-white rounded-xl md:rounded-2xl p-2 flex flex-col items-center justify-center">
                      <h2 className="text-secondaryColor text-xl md:text-3xl lg:text-5xl font-semibold">
                        1
                      </h2>
                      <p className="uppercase font-semibold text-[10px] md:text-xs lg:text-sm">
                        Day
                      </p>
                    </div>

                    <div className="bg-white rounded-xl md:rounded-2xl p-2 flex flex-col items-center justify-center">
                      <h2 className="text-secondaryColor text-xl md:text-3xl lg:text-5xl font-semibold">
                        7
                      </h2>
                      <p className="uppercase font-semibold text-[10px] md:text-xs lg:text-sm">
                        Hours
                      </p>
                    </div>
                 
                    <div className="bg-white rounded-xl md:rounded-2xl p-2 flex flex-col items-center justify-center">
                      <h2 className="text-secondaryColor text-xl md:text-3xl lg:text-5xl font-semibold">
                        59
                      </h2>
                      <p className="uppercase font-semibold text-[10px] md:text-xs lg:text-sm">
                        Minutes
                      </p>
                    </div>

                    <div className="bg-white rounded-xl md:rounded-2xl p-2 flex flex-col items-center justify-center">
                      <h2 className="text-secondaryColor text-xl md:text-3xl lg:text-5xl font-semibold">
                        45
                      </h2>
                      <p className="uppercase font-semibold text-[10px] md:text-xs lg:text-sm">
                        Seconds
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <button className="relative overflow-hidden px-5 md:px-6 py-2 md:py-3 mt-6 lg:mt-7 font-semibold text-white bg-secondaryColor/70 rounded-xl group mx-auto lg:mx-0 block">
                    <span className="relative z-10 text-white transition-colors duration-300">
                      Shop Now{" "}
                      <i className="fa-solid fa-arrow-right text-white"></i>
                    </span>

                    <span className="absolute inset-0 rounded-xl scale-0 opacity-0 bg-primaryColor group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-in-out"></span>
                  </button>
                </div>

                {/* Image */}
                <div className="hidden md:block">
                               <img
                                 src={productbanner}
                                 alt="productbanner"
                                 className="w-[600px] h-[350px]"
                               />
                             </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </>
  );
};

export default SaleCarousel;