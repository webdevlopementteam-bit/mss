import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Shop = () => {
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
    <section className="container mx-auto px-36 py-10">
    
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
  to={`/product/${product.slug}`}
  className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
>
  {/* Image */}
  <div className="relative bg-gradient-to-b from-sky-50 to-white p-6">
    {!product.hasVariants && product.salePrice > 0 &&
      product.salePrice < product.price && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
          {Math.round(
            ((product.price - product.salePrice) /
              product.price) *
              100
          )}
          % OFF
        </span>
      )}

    <img
      src={image}
      alt={product.title}
      className="w-full h-52 object-contain group-hover:scale-105 transition duration-300"
      onError={(e) => {
        e.target.src = "/no-image.png";
      }}
    />
  </div>

  {/* Content */}
  <div className="p-5">
    {product.category?.length > 0 && (
      <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primaryColor/10 text-primaryColor mb-3">
        {product.category[0]?.name}
      </span>
    )}

    <h3 className="font-semibold text-slate-800 text-[15px] leading-6 h-12 overflow-hidden">
      {product.title}
    </h3>

    <div className="flex items-center gap-1 mt-3">
      <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
      <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
      <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
      <i className="fa-solid fa-star text-yellow-400 text-sm"></i>
      <i className="fa-regular fa-star text-yellow-400 text-sm"></i>
    </div>

    <div className="mt-4 flex items-center justify-between">
      <div>
        {product.hasVariants ? (
          <p className="text-primaryColor font-bold text-xl">
            From ₹{product.minPrice ?? product.price}
          </p>
        ) : product.salePrice > 0 &&
        product.salePrice < product.price ? (
          <>
            <p className="text-gray-400 text-sm line-through">
              ₹{product.price}
            </p>

            <p className="text-primaryColor font-bold text-xl">
              ₹{product.salePrice}
            </p>
          </>
        ) : (
          <p className="text-primaryColor font-bold text-xl">
            ₹{product.price}
          </p>
        )}
      </div>

      <div className="w-11 h-11 rounded-full bg-primaryColor flex items-center justify-center text-white group-hover:scale-110 transition">
        <i className="fa-solid fa-arrow-right"></i>
      </div>
    </div>
  </div>
</Link>
          );
        })}
      </div>
    </section>
  );
};

export default Shop;