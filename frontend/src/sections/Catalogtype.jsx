import React, { useEffect, useState } from "react";
import { popularProducts, products } from "../data";

import { useShop, getProductId } from "../context/ShopContext";
import API from "../api/axios";
import { Link } from "react-router-dom";
export const Catalogtype = () => {
  const [onSaleProducts, setOnSaleProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [onSaleRes, bestSellerRes, topRatedRes] = await Promise.all([
          API.get("/product/section/onsale"),
          API.get("/product/section/bestseller"),
          API.get("/product/section/toprated"),
        ]);

        setOnSaleProducts(onSaleRes.data?.data || []);
        setBestSellerProducts(bestSellerRes.data?.data || []);
        setTopRatedProducts(topRatedRes.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, []);
  const { addToCart } = useShop();
  const sections = [
    {
      title: "On Sale",
      products: onSaleProducts,
    },
    {
      title: "Best Seller",
      products: bestSellerProducts,
    },
    {
      title: "Top Rated",
      products: topRatedProducts,
    },
  ];

  return (
    <section className="px-4 md:px-6 lg:px-side mt-10 md:mt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
        {sections.map((section, index) => (
          <div
            key={index}
            className="border border-black/20 rounded-2xl p-4 md:p-5"
          >
            {/* Heading */}
            <h3 className="text-xl md:text-2xl font-semibold pb-3 relative border-b border-black/15 before:content-[''] before:absolute before:h-[2px] before:bottom-0 before:w-10 before:bg-primaryColor">
              {section.title}
            </h3>

            {/* Products */}
            <div className="mt-6">
              {section.products?.slice(0, 3).map((item) => (
                <div
                  key={getProductId(item)}
                  className="bg-primaryColor/10 hover:bg-primaryColor/20 transition-all duration-300 p-3 rounded-xl mb-4 flex items-center gap-3 relative group"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={
                        item.images?.[0]?.startsWith("http")
                          ? item.images[0]
                          : `${import.meta.env.VITE_IMAGE_BASE_URL}/${item.images?.[0]}`
                      }
                      alt={item.title}
                      className="w-20 h-20 md:w-24 md:h-24 object-contain bg-white p-2 rounded-xl border"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 pr-10">
                    <h4 className="font-semibold text-sm md:text-base line-clamp-2">
                      {item.title}
                    </h4>

                    <div className="flex gap-1 mt-2">
                      <i className="fa-solid fa-star text-[#FBA707] text-xs"></i>
                      <i className="fa-solid fa-star text-[#FBA707] text-xs"></i>
                      <i className="fa-solid fa-star text-[#FBA707] text-xs"></i>
                      <i className="fa-solid fa-star text-[#FBA707] text-xs"></i>
                      <i className="fa-regular fa-star text-[#FBA707] text-xs"></i>
                    </div>

                    <div className="mt-2">
  {item.hasVariants ? (
    <span className="text-primaryColor font-semibold text-sm md:text-lg">
      From ₹{item.minPrice ?? item.price}
    </span>
  ) : item.salePrice &&
  Number(item.salePrice) < Number(item.price) ? (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-gray-500 text-sm line-through">
        ₹{item.price}
      </span>

      <span className="text-primaryColor font-semibold text-sm md:text-lg">
        ₹{item.salePrice}
      </span>
    </div>
  ) : (
    <span className="text-primaryColor font-semibold text-sm md:text-lg">
      ₹{item.price}
    </span>
  )}
</div>
                  </div>

                  {/* Cart Button */}
                  <div className="absolute bottom-2 right-2">
                    {item.hasVariants ? (
                      <Link
                        to={`/product/${item.slug}`}
                        aria-label="Select options"
                        className="bg-primaryColor rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center cursor-pointer"
                      >
                        <i className="fa-solid fa-sliders text-white"></i>
                      </Link>
                    ) : (
                      <div
                        onClick={() => addToCart(item)}
                        className="bg-primaryColor rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center cursor-pointer"
                      >
                        <i className="fa-solid fa-bag-shopping text-white"></i>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Catalogtype;
