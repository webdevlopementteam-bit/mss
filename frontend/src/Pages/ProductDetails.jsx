import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api/services";
import { useShop, getProductId } from "../context/ShopContext";
import { toast } from "react-toastify";
import { setPageMeta, resetPageMeta } from "../utils/pageMeta";

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

// ---- Image gallery: main image + thumbnail rail. Renders every image the
// admin uploaded (product.images is an array), not just the first one. ----
const ImageGallery = ({ images = [], title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const gallery = images.length > 0 ? images : [""];

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible md:w-20 shrink-0">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition ${
                activeIndex === i
                  ? "border-primaryColor"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={resolveImage(img)}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 bg-primaryColor/5 rounded-3xl overflow-hidden aspect-square">
        <img
          src={resolveImage(gallery[activeIndex])}
          alt={title}
          className="w-full h-full object-contain p-6 md:p-10 transition-opacity duration-200"
        />

        {gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {gallery.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === i ? "w-5 bg-primaryColor" : "w-1.5 bg-primaryColor/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
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
  const [activeTab, setActiveTab] = useState("description");

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

  // SEO: use the admin-entered Meta Title / Meta Description when present,
  // falling back to the product's own title/description so every product
  // page still gets a meaningful <title> and meta description tag.
  useEffect(() => {
    if (!product) return;

    const title = product.metaTitle || product.title;
    const rawDescription = product.metaDescription || product.description;
    const description = rawDescription ? rawDescription.slice(0, 160) : undefined;

    setPageMeta({ title, description });

    return () => resetPageMeta();
  }, [product]);

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
    return (
      <div className="py-32 text-center">
        <div className="inline-block w-8 h-8 border-2 border-primaryColor border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Product not found</h2>
        <p className="text-gray-400 mt-2">It may have been removed or the link is incorrect.</p>
        <Link
          to="/shop"
          className="inline-block mt-6 bg-primaryColor text-white px-6 py-3 rounded-xl font-medium"
        >
          Back to Shop
        </Link>
      </div>
    );
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
  const onSale = salePrice > 0 && salePrice < price;
  const discountPct = onSale ? Math.round(((price - salePrice) / price) * 100) : 0;

  // ================= FULL SPEC TABLE =================
  const categoryNames = Array.isArray(product.category)
    ? product.category.map((c) => c.name).filter(Boolean).join(", ")
    : "";

  const totalStock = isVariable
    ? variants.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0)
    : Number(product.quantity || 0);

  const rangeLabel = (values) => {
    if (!values.length) return "—";
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };

  const priceDisplay = isVariable
    ? rangeLabel(variants.map((v) => v.price).filter((p) => p != null))
    : `₹${product.price}`;

  const salePriceDisplay = isVariable
    ? rangeLabel(variants.map((v) => v.salePrice).filter((p) => p > 0))
    : product.salePrice
    ? `₹${product.salePrice}`
    : "—";

  const specRows = [
    ["Brand", product.brand?.name],
    ["Company", product.company?.name],
    ["Category", categoryNames],
    ["Subcategory", product.subcategory?.name],
    ["Packing", product.packing],
    ["Reference No.", product.referenceNo],
    ["HSN Code", product.hsn],
    ["FSN", product.fsn],
    ["Price", priceDisplay],
    ["Sale Price", salePriceDisplay],
    ["Stock", `${totalStock} unit${totalStock === 1 ? "" : "s"}`],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  const specIcons = {
    Brand: "fa-copyright",
    Company: "fa-building",
    Category: "fa-layer-group",
    Subcategory: "fa-tag",
    Packing: "fa-box",
    "Reference No.": "fa-hashtag",
    "HSN Code": "fa-barcode",
    FSN: "fa-fingerprint",
    Price: "fa-indian-rupee-sign",
    "Sale Price": "fa-tags",
    Stock: "fa-warehouse",
  };

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
    <section className="py-8 md:py-12">
      <div className="px-4 md:px-6 lg:px-side">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-primaryColor transition">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primaryColor transition">Shop</Link>
          {categoryLabel && (
            <>
              <span>/</span>
              <span className="text-gray-500">{categoryLabel}</span>
            </>
          )}
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Image gallery */}
          <ImageGallery images={product.images} title={product.title} />

          {/* Product info */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {categoryLabel && (
                <span className="bg-primaryColor text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                  {categoryLabel}
                </span>
              )}
              {product.brand?.name && (
                <span className="border border-gray-200 text-gray-500 px-4 py-1 rounded-full text-xs font-medium">
                  {product.brand.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mt-4 text-gray-900 leading-snug">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <i key={i} className="fa-solid fa-star text-yellow-400 text-sm"></i>
                ))}
                <i className="fa-regular fa-star text-yellow-400 text-sm"></i>
              </div>
              {sku && <span className="text-xs text-gray-400 ml-2">SKU: {sku}</span>}
            </div>

            {isVariable && !selectedVariant ? (
              <h2 className="text-xl font-semibold text-gray-400 mt-6">
                Select options to see price
              </h2>
            ) : (
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                <h2 className="text-3xl md:text-4xl font-bold text-primaryColor">
                  ₹{onSale ? salePrice : price}
                </h2>
                {onSale && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{price}</span>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {discountPct}% off
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Variant selector */}
            {isVariable && attributeGroups.length > 0 && (
              <div className="mt-7 space-y-5">
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

            <p className="text-gray-600 mt-7 leading-7 line-clamp-4">
              {product.description}
            </p>

            {/* Quantity + actions */}
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  className="w-11 h-11 text-gray-600 hover:text-primaryColor transition"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 text-gray-600 hover:text-primaryColor transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 min-w-[160px] bg-primaryColor text-white px-8 py-3.5 rounded-xl font-semibold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isVariable && !selectedVariant ? "Select Options" : "Add To Cart"}
              </button>

              <button
                onClick={() => addToWishlist(isVariable ? { ...product, variants } : product)}
                aria-label="Add to wishlist"
                className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl text-gray-500 hover:text-primaryColor hover:border-primaryColor transition"
              >
                <i className="fa-regular fa-heart"></i>
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {[
                ["fa-shield-heart", "Genuine Medical Products"],
                ["fa-truck-fast", "Fast Delivery Across India"],
                ["fa-lock", "Secure Checkout"],
                ["fa-headset", "Customer Support Available"],
              ].map(([icon, text]) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-3.5 py-3"
                >
                  <i className={`fa-solid ${icon} text-green-600 text-sm shrink-0`}></i>
                  <span className="text-xs text-gray-700 font-medium leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Specifications */}
        <div className="mt-14 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab header */}
          <div className="flex border-b border-gray-100 px-6 md:px-8">
            {[
              ["description", "Description"],
              ["specifications", "Specifications"],
            ].map(([key, label]) =>
              key === "specifications" && specRows.length === 0 ? null : (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative py-5 mr-8 text-sm md:text-base font-semibold transition ${
                    activeTab === key ? "text-primaryColor" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {label}
                  {activeTab === key && (
                    <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primaryColor rounded-full" />
                  )}
                </button>
              )
            )}
          </div>

          {/* Tab content */}
          <div className="p-6 md:p-8">
            {activeTab === "description" && (
              <p className="text-gray-600 leading-8 whitespace-pre-line">
                {product.description}
              </p>
            )}

            {activeTab === "specifications" && specRows.length > 0 && (
              <dl className="grid sm:grid-cols-2 gap-3">
                {specRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center gap-3.5 bg-gray-50 rounded-xl px-4 py-3.5"
                  >
                    <span className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                      <i className={`fa-solid ${specIcons[label] || "fa-circle-info"} text-primaryColor text-sm`}></i>
                    </span>
                    <div className="min-w-0">
                      <dt className="text-xs text-gray-400">{label}</dt>
                      <dd className="font-semibold text-gray-800 truncate">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ProductDetails;