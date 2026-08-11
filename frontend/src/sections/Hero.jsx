import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import API from "../api/axios";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await API.get("/cms/home");
        const data = res.data;
        setBanners(data?.banners || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const carouselsettings = {
    dots: true,
    infinite: banners.length > 1,
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

  if (loading) {
    return (
      <section className="overflow-hidden">
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 mt-4">
          <div className="w-full aspect-[16/7] sm:aspect-[16/6] rounded-xl bg-gray-200 animate-pulse" />
        </div>
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="overflow-hidden">
      <Slider {...carouselsettings}>
        {banners.map((banner, index) => (
          <div key={index}>
            <div className="container mx-auto px-4 sm:px-8 lg:px-16 mt-2 md:mt-4">
              <img
                src={getImage(banner.image)}
                alt={`Banner ${index + 1}`}
                className="w-full aspect-[16/7] sm:aspect-[16/6] object-cover rounded-lg md:rounded-xl"
              />
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Hero;