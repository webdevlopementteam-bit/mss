import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await API.get(
        "/product?page=1&limit=20&status=published"
      );

      setProducts(res.data.data || []);
    } catch (error) {
      console.error("Product fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-center text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Latest Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const image =
            product.images?.[0]
              ? product.images[0].startsWith("http")
                ? product.images[0]
                : `${IMG_URL.replace(/\/$/, "")}/${product.images[0]}`
              : "/no-image.png";

          return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.target.src = "/no-image.png";
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-gray-800 line-clamp-2 min-h-[48px]">
                  {product.title}
                </h3>

                {product.category?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {product.category[0]?.name}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {product.salePrice > 0 ? (
                    <>
                      <span className="text-lg font-bold text-red-600">
                        ₹{product.salePrice}
                      </span>

                      <span className="text-sm text-gray-400 line-through">
                        ₹{product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primaryColor">
                      ₹{product.price}
                    </span>
                  )}
                </div>

                <button className="w-full mt-4 py-2 rounded-lg bg-primaryColor text-white hover:opacity-90 transition">
                  View Product
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ProductGrid;