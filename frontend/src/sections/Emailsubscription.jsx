import React from "react";
import subscriptionbanner from "../assets/home/subscriptionbanner.avif";

export const Emailsubscription = () => {
  return (
    <>
      <section className="px-4 md:px-6 lg:px-side mt-10 md:mt-16">
        <div
          className="relative overflow-hidden rounded-2xl md:rounded-3xl py-10 md:py-14 lg:py-16 px-4"
          style={{
            backgroundImage: `url(${subscriptionbanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl uppercase text-white font-semibold">
              Get{" "}
              <span className="text-yellow-400 tracking-widest">
                20%
              </span>{" "}
              Off Discount Coupon
            </p>

            <p className="text-white text-sm md:text-lg mt-2">
              By Subscribe Our Newsletter
            </p>

            {/* Form */}
            <div className="mt-6 md:mt-8 w-full max-w-[650px]">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-center">
                <input
                  type="email"
                  placeholder="Your Email Address"
                  className="
                    w-full
                    py-3 md:py-4
                    px-5 md:px-7
                    rounded-full
                    outline-none
                    border-none
                    text-sm md:text-base
                  "
                />

                <button
                  className="
                    relative
                    overflow-hidden
                    group
                    w-full
                    sm:w-auto
                    sm:-ml-32
                    px-6
                    md:px-8
                    py-3
                    md:py-3.5
                    rounded-full
                    bg-secondaryColor
                    font-semibold
                  "
                >
                  <span className="relative z-10 text-white whitespace-nowrap">
                    Subscribe{" "}
                    <i className="fa-regular fa-paper-plane text-white"></i>
                  </span>

                  <div className="absolute inset-0 scale-0 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 bg-primaryColor rounded-full"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Emailsubscription;