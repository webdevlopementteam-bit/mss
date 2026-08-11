import React, { useEffect, useState } from "react";
import API from "../api/axios";

export const Productbanner = () => {
  const [salesBanners, setSalesBanners] = useState([]);

  useEffect(() => {
    const fetchSalesBanners = async () => {
      try {
        const res = await API.get("/cms/home");

        // agar response data ke andar aa raha ho
        setSalesBanners(res.data?.salesBanners || []);

        // agar response { data: {...} } ho to:
        // setSalesBanners(res.data?.data?.salesBanners || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchSalesBanners();
  }, []);

  const getImage = (img) => {
    if (!img) return "";

    return img.startsWith("http")
      ? img
      : `${import.meta.env.VITE_IMAGE_BASE_URL}${img}`;
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 px-4 sm:px-6 md:px-8 lg:px-side mt-8 sm:mt-10 md:mt-16">
      {salesBanners.slice(0, 3).map((banner, index) => (
        <div
          key={index}
          style={{
            backgroundImage: `url(${getImage(banner.image)})`,
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
          className={`px-4 sm:px-5 md:px-6 py-8 sm:py-12 md:py-20 lg:py-32 rounded-xl sm:rounded-2xl min-h-[160px] sm:min-h-[220px] md:min-h-[320px] flex flex-col items-start justify-center ${
            index === 2 ? "xs:col-span-2 lg:col-span-1" : ""
          }`}
        >

        </div>
      ))}
    </div>
  );
};