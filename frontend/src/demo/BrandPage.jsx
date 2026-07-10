import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const BrandPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      const res = await API.get("/brand?limit=100");

      const publishedBrands =
        res.data.data?.filter((brand) => brand.isPublished) || [];

      setBrands(publishedBrands);
    } catch (error) {
      console.log("Brand Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading Brands...
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">
          Shop By Brand
        </h1>

        <p className="text-gray-500 mt-2">
          Explore products from trusted brands
        </p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {brands.map((brand) => (
          <Link
            key={brand._id}
            to={`/brand/${brand._id}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Logo */}
            <div className="aspect-square bg-gray-50 p-6 flex items-center justify-center overflow-hidden">
              <img
                src={`${IMG_URL}/${brand.image}`}
                alt={brand.name}
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-300"
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
            </div>

            {/* Brand Info */}
            <div className="p-4 text-center">
              <h3 className="font-semibold text-gray-800">
                {brand.name}
              </h3>

            
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BrandPage;