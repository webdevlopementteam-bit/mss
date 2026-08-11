import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import NextArrow from "../components/NextArrow";
import PrevArrow from "../components/PrevArrow";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const Category = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category?limit=30");
      const data = res.data.data || [];
      setCategories(data);
      setSelectedCategory(data[0]?.name || "");
    } catch (error) {
      console.log(error);
    }
  };

  fetchCategories();
}, []);

  // react-slick's infinite + variableWidth mode needs enough real slides to
  // build seamless clones; with too few categories it leaves a blank gap
  // mid-loop, so repeat the list until there's a comfortable buffer.
  const MIN_SLIDES_FOR_SEAMLESS_LOOP = 12;
  const displayCategories =
    categories.length > 0 && categories.length < MIN_SLIDES_FOR_SEAMLESS_LOOP
      ? Array.from(
          { length: Math.ceil(MIN_SLIDES_FOR_SEAMLESS_LOOP / categories.length) },
          () => categories
        ).flat()
      : categories;

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 2500,
    pauseOnHover: true,
    slidesToScroll: 1,
    variableWidth: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
  };

  return (
    <section className="mt-10 md:mt-14 lg:mt-16 overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-6 lg:px-side">
        <div className="relative inline-block">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#023350]">
            Top Category
          </h2>

          <span className="absolute left-0 -bottom-3 w-16 h-1 bg-primaryColor"></span>

          <div className="absolute left-0 -bottom-6 w-[180px] h-12 bg-primaryColor/10 rounded-b-3xl -z-10"></div>
        </div>
      </div>

      {/* Slider */}
      <div className="relative px-4 md:px-14 lg:px-20 mt-12">
        <Slider {...settings}>
          {displayCategories.map((category, index) => (
            <div key={`${category._id}-${index}`} className="px-2">
              <div
                onClick={() => {
                  setSelectedCategory(category.name);
                  navigate(`/shop?category=${category._id}`);
                }}
                className={`
                  w-[130px]
                  sm:w-[150px]
                  md:w-[170px]
                  lg:w-[180px]
                  min-h-[150px]
                  md:min-h-[200px]
                  rounded-[40px]
                  border-2
                  cursor-pointer
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  p-4
                  mt-2
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  ${
                    selectedCategory === category.name
                      ? "border-primaryColor shadow-lg"
                      : "border-primaryColor/20 hover:border-primaryColor"
                  }
                `}
              >
                {/* Icon */}
                <div className="border border-dashed border-primaryColor rounded-full p-2">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center">
                    <img
                      src={`${IMG_URL}/${category.image}`}
                      alt={category.name}
                      className="w-10 h-10 md:w-full md:h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110 p-1"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>
                </div>

                {/* Name */}
                <p className="mt-4 text-sm md:text-base font-semibold text-[#023350] leading-snug break-words">
                  {category.name}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Category;