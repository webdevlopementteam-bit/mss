import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category");

      setCategories(res.data.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading Categories...
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      {/* Heading */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold">
          Shop By Category
        </h1>

        <p className="text-gray-500 mt-2">
          Explore our product categories
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/category/${category._id}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden bg-gray-100">
              <img
                src={`${IMG_URL}/${category.image}`}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                onError={(e) => {
                  e.target.src = "/no-image.png";
                }}
              />
            </div>

            {/* Content */}
            <div className="p-4 text-center">
              <h3 className="font-semibold text-lg text-gray-800">
                {category.name}
              </h3>

              {category.description && (
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {category.description}
                </p>
              )}

              <button className="mt-4 px-4 py-2 rounded-lg bg-primaryColor text-white">
                View Products
              </button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryPage;