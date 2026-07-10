import React from "react";
import banner1 from "../assets/home/banner1.jpg";
import banner2 from "../assets/home/banner2.png";
import banner3 from "../assets/home/banner3.jpg";

export const Gallery = () => {
  const galleryImages = [
    { image: banner1, large: true },
    { image: banner2, large: false },
    { image: banner3, large: false },
    { image: banner2, large: false },
    { image: banner3, large: false },
    { image: banner1, large: true },
  ];

  return (
    <>
      {/* Heading */}
      <div className="px-4 md:px-6 lg:px-side mt-10 md:mt-16  text-center">
        <p className="font-semibold uppercase tracking-wider text-sm md:text-lg text-primaryColor">
          Our Gallery
        </p>

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mt-3">
          Let's Check Our Photo{" "}
          <span className="text-primaryColor">Gallery</span>
        </h3>
      </div>

      {/* Gallery */}
      <div className="px-4 md:px-6 lg:px-side my-8 md:my-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-7">
          {galleryImages.map((item, index) => (
            <div
              key={index}
              className={`
                group
                relative
                overflow-hidden
                rounded-2xl
                md:rounded-3xl
                ${
                  item.large
                    ? "col-span-2 lg:col-span-2"
                    : "col-span-1"
                }
              `}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={`gallery-${index}`}
                className="
                  w-full
                  h-[180px]
                  sm:h-[220px]
                  md:h-[260px]
                  lg:h-[320px]
                  object-cover
                  transition-transform
                  duration-700
                  group-hover:scale-110
                "
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-secondaryColor/0 group-hover:bg-secondaryColor/30 transition-all duration-500">
                <div className="absolute inset-0 bg-secondaryColor/0 group-hover:bg-secondaryColor/20 transition-all duration-700"></div>
              </div>

              {/* Hover Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white flex items-center justify-center">
                  <i className="fa-solid fa-plus text-primaryColor text-lg md:text-xl"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Gallery;