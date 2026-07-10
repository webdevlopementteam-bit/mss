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
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 px-4 lg:px-side mt-10 md:mt-16">
      {salesBanners.slice(0, 3).map((banner, index) => (
        <div
          key={index}
          style={{
            backgroundImage: `url(${getImage(banner.image)})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className={`px-4 md:px-6 py-10 md:py-32 rounded-2xl flex flex-col items-start justify-center ${
            index === 2 ? "col-span-2 lg:col-span-1" : ""
          }`}
        >
         
        </div>
      ))}
    </div>
  );
};