import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import API from "../api/axios";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import NextArrow from "../components/NextArrow";
import PrevArrow from "../components/PrevArrow";

export const Instagrammedion = () => {
  const [instagramPosts, setInstagramPosts] = useState([]);

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        const res = await API.get("/cms/home");
        setInstagramPosts(res.data?.instagramPosts || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchInstagramPosts();
  }, []);

  const getImage = (img) => {
    if (!img) return "";

    return img.startsWith("http")
      ? img
      : `${import.meta.env.VITE_IMAGE_BASE_URL}${img}`;
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    autoplay: true,
    autoplaySpeed: 3000,
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

  if (instagramPosts.length === 0) {
    return null;
  }

  return (
    <section className="my-10 md:my-16 overflow-hidden">
      {/* Heading */}
      <div className="px-4 md:px-6 lg:px-side text-center">
        <h4 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Instagram <span className="text-primaryColor">@Medion</span>
        </h4>
      </div>

      {/* Slider */}
      <div className="relative px-4 md:px-14 lg:px-20 mt-8 md:mt-10">
        <Slider {...settings}>
          {instagramPosts.map((post) => (
            <div key={post._id} className="px-2">
              <a
                href={post.link || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  block
                  w-[180px]
                  sm:w-[220px]
                  md:w-[260px]
                  lg:w-[280px]
                  rounded-xl
                  md:rounded-2xl
                  overflow-hidden
                  group
                  cursor-pointer
                  relative
                "
              >
                {/* Image */}
                <img
                  src={getImage(post.image)}
                  alt="instagram-post"
                  className="
                    w-full
                    h-[220px]
                    sm:h-[260px]
                    md:h-[320px]
                    lg:h-[340px]
                    object-contain
                    transition-all
                    duration-700
                    group-hover:scale-110
                  "
                />

                {/* Overlay */}
                <div
                  className="
                    absolute
                    inset-0
                    bg-black/0
                    group-hover:bg-black/40
                    transition-all
                    duration-500
                  "
                ></div>

                {/* Instagram Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="
                      bg-primaryColor
                      rounded-full
                      p-3
                      md:p-4
                      opacity-0
                      scale-50
                      group-hover:opacity-100
                      group-hover:scale-100
                      transition-all
                      duration-500
                    "
                  >
                    <i className="fa-brands fa-instagram text-xl md:text-2xl text-white"></i>
                  </span>
                </div>
              </a>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Instagrammedion;
