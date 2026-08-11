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
      className="relative py-14 md:py-20 lg:py-24 overflow-hidden"
    >
      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 px-4 md:px-6 lg:px-side">
        {/* Heading */}
        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm md:text-base uppercase text-secondaryColor font-semibold tracking-[4px]">
            Testimonials
          </p>

          <h3 className="mt-3 text-2xl md:text-4xl text-white font-bold leading-tight">
            What Our Clients Say About Us
          </h3>

          <p className="mt-3 text-white/70 text-sm md:text-base">
            Real experiences from people who trust us
          </p>
        </div>

        {/* Slider */}
        <div className="relative mt-12">
          <Slider {...testimonialsettings}>
            {testimonials.map((test) => (
              <div key={test.id} className="px-3">
                <div
                  className="
                    w-[290px]
                    sm:w-[330px]
                    md:w-[370px]
                    lg:w-[340px]
                    bg-white
                    rounded-[28px]
                    md:rounded-[36px]
                    p-6
                    md:p-7
                    relative
                    min-h-[300px]
                    md:min-h-[330px]
                    flex
                    flex-col
                    shadow-lg
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:shadow-2xl
                  "
                >
                  {/* Big quote mark */}
                  <img
                    src={quotes}
                    alt=""
                    className="absolute top-6 right-6 w-10 md:w-12 opacity-10 pointer-events-none"
                  />

                  

                  {/* Comment */}
                  <p className="relative z-10 mt-4 text-sm md:text-[15px] text-black/70 leading-relaxed flex-grow">
                    "{test.comment}"
                  </p>

                  {/* Rating */}
                  <div className="relative z-10 flex gap-1">
                    {[...Array(5)].map((_, index) => (
                      <i
                        key={index}
                        className="fa-solid fa-star text-[#F0BD14] text-sm md:text-base"
                      ></i>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-black/10 my-5"></div>

                  {/* User Info */}
                  <div className="relative z-10 flex items-center gap-3">
                    <img
                      src={test.image}
                      alt={test.name}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-secondaryColor/30"
                    />

                    <div className="text-left">
                      <h4 className="text-black font-semibold text-sm md:text-base">
                        {test.name}
                      </h4>
                      <p className="text-primaryColor text-xs md:text-sm font-medium">
                        {test.role}
                      </p>
                    </div>
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