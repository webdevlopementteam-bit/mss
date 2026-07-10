import React from "react";
import { blogsdata } from "../data";

export const Blogsection = () => {
  return (
    <>
      <section className="mt-10 md:mt-16 px-4 md:px-6 lg:px-side">
        {/* Heading */}
        <div className="text-center">
          <p className="font-semibold uppercase tracking-wider text-sm md:text-lg text-primaryColor">
            Our Blog
          </p>

          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-3">
            Our Latest News &{" "}
            <span className="text-primaryColor">Blog</span>
          </h3>
        </div>

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 mt-8 md:mt-10">
          {blogsdata.slice(0, 3).map((blogitem) => (
            <div key={blogitem.id}>
              <div className="border rounded-2xl p-4 md:p-5 group h-full hover:shadow-lg transition-all duration-300">
                {/* Image */}
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={blogitem.image}
                    alt={blogitem.name}
                    className="w-full h-[220px] md:h-[250px] object-cover rounded-2xl transition-all duration-500 group-hover:scale-110"
                  />

                  <p className="absolute bottom-4 right-0 py-1 px-3 md:px-4 rounded-l-3xl text-white bg-primaryColor text-xs md:text-sm">
                    <i className="fa-solid fa-calendar-days text-white"></i>{" "}
                    {blogitem.date}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 md:gap-6 py-3 border-b justify-start items-center text-sm md:text-base">
                  <div>
                    <i className="fa-regular fa-circle-user text-primaryColor"></i>{" "}
                    {blogitem.name}
                  </div>

                  <div>
                    <i className="fa-regular fa-comments text-primaryColor"></i>{" "}
                    {blogitem.comment}
                  </div>
                </div>

                {/* Title */}
                <h4 className="mt-3 text-lg md:text-xl font-semibold line-clamp-2 min-h-[56px]">
                  {blogitem.title}
                </h4>

                {/* Description */}
                <p className="mt-2 text-sm md:text-base text-black/60 line-clamp-3">
                  {blogitem.description}
                </p>

                {/* Button */}
                <button className="mt-5 md:mt-7 relative py-2 md:py-3 px-5 md:px-6 bg-primaryColor text-white rounded-xl md:rounded-2xl group/btn overflow-hidden">
                  <span className="relative z-10 text-sm md:text-base text-white">
                    Read More{" "}
                    <i className="fa-solid fa-arrow-right text-white"></i>
                  </span>

                  <div className="absolute inset-0 scale-0 opacity-0 transition-all duration-500 origin-center group-hover/btn:opacity-100 group-hover/btn:scale-100 rounded-xl md:rounded-2xl bg-secondaryColor"></div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Blogsection;