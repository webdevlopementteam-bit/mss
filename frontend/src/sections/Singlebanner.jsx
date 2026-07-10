import React from "react";
import banner from "../assets/home/banner.jpg";

export const Singlebanner = () => {
  return (
    <section className="px-4 md:px-6 lg:px-side mt-10 md:mt-16">
      <div
        style={{
          backgroundImage: `url(${banner})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        className="
          h-[220px]
          sm:h-[260px]
          md:h-[300px]
          lg:h-[340px]
          rounded-2xl
          md:rounded-3xl
          flex
          flex-col
          justify-center
          items-center
          text-center
          px-4
          md:px-8
          relative
          overflow-hidden
        "
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-sm md:text-lg font-semibold text-white">
            Mega Collections
          </p>

          <h4 className="mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Huge Sale Up To 40% Off
          </h4>

          <div className="mt-4 flex flex-col items-center gap-4">
            <span className="text-sm md:text-lg py-1 px-2 border-y-2 border-white text-white">
              at our outlet stores
            </span>

            <button className="relative overflow-hidden px-5 md:px-7 py-2 md:py-3 font-semibold text-white bg-secondaryColor rounded-full group">
              <span className="relative z-10 flex items-center gap-2">
                Shop Now
                <i className="fa-solid fa-arrow-right"></i>
              </span>

              <span className="absolute inset-0 rounded-full scale-0 opacity-0 bg-primaryColor group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-in-out"></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Singlebanner;