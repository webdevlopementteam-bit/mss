import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import API from "../api/axios"; // apna API instance

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const Hero = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await API.get("/cms/home");

        // API response check kar lena
        const data = res.data;

        setBanners(data?.banners || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBanners();
  }, []);

  const carouselsettings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: false,
  };

  const getImage = (img) => {
    if (!img) return "";

    return img.startsWith("http")
      ? img
      : `${import.meta.env.VITE_IMAGE_BASE_URL}${img}`;
  };

  return (
    <section className="overflow-hidden">
      <Slider {...carouselsettings}>
        {banners.map((banner, index) => (
          <div key={index}>
            <div className="container mx-auto px-16 mt-4 w-full h-[180px] sm:h-[250px] md:h-[350px] lg:h-[450px] xl:h-[570px]">
              <img
                src={getImage(banner.image)}
                alt={`Banner ${index + 1}`}
                className="w-full h-full object-cover rounded-xl mt-2"
              />
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};