import React from "react";
import testimonialbanner from "../assets/home/testimonialbanner.png";
import quotes from "../assets/home/quote.png";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { testimonials } from "../data";

export const Testimonial = () => {
  const testimonialsettings = {
    dots: true,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    arrows: false,
    slidesToScroll: 1,
    variableWidth: true,
  };

  return (
    <section
      style={{
        backgroundImage: `url(${testimonialbanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
      className="py-12 md:py-16 lg:py-20 overflow-hidden"
    >
      <div className="px-4 md:px-6 lg:px-side">
        {/* Heading */}
        <div className="text-center">
          <p className="text-sm md:text-lg uppercase text-white font-semibold tracking-[4px]">
            Testimonials
          </p>

          <h3 className="mt-3 text-2xl md:text-3xl lg:text-4xl text-white font-semibold">
            What Our Client Say&apos;s About Us
          </h3>
        </div>

        {/* Slider */}
        <div className="relative mt-10">
          <Slider {...testimonialsettings}>
            {testimonials.map((test) => (
              <div key={test.id} className="px-2 md:px-3">
                <div
                  className="
                    w-[280px]
                    sm:w-[320px]
                    md:w-[360px]
                    lg:w-[320px]
                    bg-white
                    rounded-3xl
                    md:rounded-[40px]
                    p-4
                    md:p-6
                    lg:p-7
                    relative
                    min-h-[320px]
                    md:min-h-[360px]
                    flex
                    flex-col
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-2xl
                  "
                >
                  {/* Quote Background */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `url(${quotes})`,
                      backgroundSize: "35%",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition:
                        "calc(100% - 20px) calc(100% - 20px)",
                      opacity: 0.12,
                    }}
                  />

                  {/* User Info */}
                  <div className="relative z-10 flex items-center gap-3 bg-secondaryColor rounded-2xl md:rounded-full p-3">
                    <img
                      src={test.image}
                      alt={test.name}
                      className="
                        w-14
                        h-14
                        md:w-20
                        md:h-20
                        rounded-full
                        object-cover
                        flex-shrink-0
                      "
                    />

                    <div className="text-left">
                      <h4 className="text-white font-semibold text-sm md:text-lg lg:text-md">
                        {test.name}
                      </h4>

                      <p className="text-blue-900 text-xs md:text-sm lg:text-base font-semibold">
                        {test.role}
                      </p>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="relative z-10 mt-5 text-sm md:text-base text-black/70 leading-relaxed flex-grow">
                    {test.comment}
                  </p>

                  {/* Rating */}
                  <div className="relative z-10 mt-5 flex justify-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <i
                        key={index}
                        className="fa-solid fa-star text-secondaryColor text-sm md:text-base"
                      ></i>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;