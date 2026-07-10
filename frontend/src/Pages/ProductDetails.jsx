import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../api/services";
import { useShop, getProductId } from "../context/ShopContext";
import { toast } from "react-toastify";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const resolveImage = (img) => {
  if (!img) return "";
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

// Groups the flat variants array into one entry per attribute (e.g. Size,
// Color) with the distinct values actually offered across all variants.
const buildAttributeGroups = (variants) => {
  const groups = {};
  for (const v of variants) {
    for (const a of v.attributes || []) {
      const attrId = a.attributeId?._id || a.attributeId;
      const attrName = a.attributeId?.displayName || a.attributeId?.title || "Option";
      if (!groups[attrId]) {
        groups[attrId] = { attributeId: attrId, displayName: attrName, values: [] };
      }
      if (!groups[attrId].values.includes(a.value)) {
        groups[attrId].values.push(a.value);
      }
    }
  }
  return Object.values(groups);
};

// Finds the variant whose attribute set exactly matches the current selection.
const findMatchingVariant = (variants, selectedValues, attributeGroups) => {
  if (attributeGroups.some((g) => !selectedValues[g.attributeId])) return null;
  return (
    variants.find((v) => {
      if ((v.attributes || []).length !== attributeGroups.length) return false;
      return v.attributes.every((a) => {
        const attrId = a.attributeId?._id || a.attributeId;
        return selectedValues[attrId] === a.value;
      });
    }) || null
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, addToWishlist } = useShop();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedValues, setSelectedValues] = useState({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getProductById(id)
      .then(({ data }) => {
        if (cancelled) return;
        const p = data.data.product;
        const v = data.data.variants || [];
        setProduct(p);
        setVariants(v);

        if (p.hasVariants && v.length > 0) {
          // Default-select the lowest-price variant so a price is always visible.
          const cheapest = [...v].sort((a, b) => (a.price || 0) - (b.price || 0))[0];
          const initial = {};
          for (const a of cheapest.attributes || []) {
            initial[a.attributeId?._id || a.attributeId] = a.value;
          }
          setSelectedValues(initial);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const pid = getProductId(product);
    const existing = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
    const filtered = existing.filter((item) => getProductId(item) !== pid);
    const updated = [{ ...product, viewedAt: Date.now() }, ...filtered];

    localStorage.setItem("recentlyViewed", JSON.stringify(updated.slice(0, 20)));
  }, [product]);

  const attributeGroups = useMemo(() => buildAttributeGroups(variants), [variants]);

  const selectedVariant = useMemo(
    () =>
      product?.hasVariants
        ? findMatchingVariant(variants, selectedValues, attributeGroups)
        : null,
    [product, variants, selectedValues, attributeGroups]
  );

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (notFound || !product) {
    return <div className="py-20 text-center">Product not found</div>;
  }

  const categoryLabel =
    product.defaultCategory?.name ||
    (Array.isArray(product.category) ? product.category[0]?.name : "") ||
    "";

  const isVariable = product.hasVariants;
  const price = isVariable ? selectedVariant?.price : product.price;
  const salePrice = isVariable ? selectedVariant?.salePrice : product.salePrice;
  const stock = isVariable ? selectedVariant?.quantity : product.quantity;
  const sku = isVariable ? selectedVariant?.sku : product.sku;
  const variantActive = isVariable ? selectedVariant?.isActive !== false : true;
  const inStock = isVariable ? (selectedVariant ? stock > 0 : false) : stock > 0;
  const canAddToCart = isVariable ? !!selectedVariant && variantActive && stock > 0 : stock > 0;

  const handleAddToCart = () => {
    if (isVariable && !selectedVariant) {
      toast.error("Please select all options");
      return;
    }
    if (!canAddToCart) {
      toast.error("This item is out of stock");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart(product, isVariable ? selectedVariant : undefined);
    }
  };

  return (
    <section className="py-10">
      <div className="px-4 md:px-6 lg:px-side">
        <div className="grid lg:grid-cols-2 gap-10">

          {/* Product Image */}
          <div className="bg-primaryColor/5 rounded-3xl p-8">
            <img
              src={resolveImage(product.images?.[0])}
              alt={product.title}
              className="w-full h-[400px] object-contain"
            />
          </div>

          {/* Product Info */}
          <div>
            {categoryLabel && (
              <span className="bg-primaryColor text-white px-4 py-1 rounded-full text-sm uppercase">
                {categoryLabel}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mt-4">
              {product.title}
            </h1>

            <div className="flex gap-1 mt-4">
              <i className="fa-solid fa-star text-yellow-400"></i>
              <i className="fa-solid fa-star text-yellow-400"></i>
              <i className="fa-solid fa-star text-yellow-400"></i>
              <i className="fa-solid fa-star text-yellow-400"></i>
              <i className="fa-regular fa-star text-yellow-400"></i>
            </div>

            {isVariable && !selectedVariant ? (
              <h2 className="text-2xl font-semibold text-gray-400 mt-5">
                Select options to see price
              </h2>
            ) : (
              <div className="flex items-center gap-3 mt-5">
                <h2 className="text-4xl font-bold text-primaryColor">
                  ₹{salePrice > 0 && salePrice < price ? salePrice : price}
                </h2>
                {salePrice > 0 && salePrice < price && (
                  <span className="text-lg text-gray-400 line-through">₹{price}</span>
                )}
              </div>
            )}

            {sku && (
              <p className="text-xs text-gray-400 mt-1">SKU: {sku}</p>
            )}

            {/* Variant selector */}
            {isVariable && attributeGroups.length > 0 && (
              <div className="mt-6 space-y-4">
                {attributeGroups.map((group) => (
                  <div key={group.attributeId}>
                    <p className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                      {group.displayName}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const active = selectedValues[group.attributeId] === value;
                        return (
                          <button
                            key={value}
                            onClick={() =>
                              setSelectedValues((prev) => ({
                                ...prev,
                                [group.attributeId]: value,
                              }))
                            }
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${
                              active
                                ? "bg-primaryColor text-white border-primaryColor"
                                : "border-gray-300 text-gray-700 hover:border-primaryColor"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {selectedVariant && !inStock && (
                  <p className="text-red-500 font-medium text-sm">Out of stock</p>
                )}
                {selectedVariant && variantActive === false && (
                  <p className="text-red-500 font-medium text-sm">Currently unavailable</p>
                )}
              </div>
            )}

            <p className="text-gray-600 mt-6 leading-7">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                className="w-10 h-10 rounded-full bg-gray-200"
              >
                -
              </button>

              <span className="font-bold text-xl">
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full bg-gray-200"
              >
                +
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="bg-primaryColor text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isVariable && !selectedVariant ? "Select Options" : "Add To Cart"}
              </button>

              <button
                onClick={() => {
                  addToWishlist(product);
                }}
                className="border border-primaryColor text-primaryColor px-8 py-4 rounded-xl font-semibold"
              >
                Add To Wishlist
              </button>
            </div>

            {/* Trust */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mt-10">
              <div className="space-y-2">
                <p>
                  ✓ Genuine Medical Products
                </p>

                <p>
                  ✓ Fast Delivery Across India
                </p>

                <p>
                  ✓ Secure Checkout
                </p>

                <p>
                  ✓ Customer Support Available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16 bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">
            Product Description
          </h2>

          <p className="text-gray-600 leading-8">
            {product.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
