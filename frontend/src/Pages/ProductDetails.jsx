import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../api/services";
import API from "../api/axios";
import { useShop, getProductId } from "../context/ShopContext";
import { toast } from "react-toastify";
import { setPageMeta, resetPageMeta } from "../utils/pageMeta";
import { ProductRail } from "../components/ui/ProductRail";
import { formatINR } from "../components/ui/productUtils";

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

// ---- Image gallery: thumbnail rail + main image with hover zoom. Renders
// every image the admin uploaded (product.images is an array). ----
const ImageGallery = ({ images = [], title, discount }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(null);
  const gallery = images.length > 0 ? images : [""];
  const multiple = gallery.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const go = (delta) => setActiveIndex((i) => (i + delta + gallery.length) % gallery.length);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-4">
      {multiple && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[560px] md:w-[84px] shrink-0 pb-1 md:pb-0 md:pr-1">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={`shrink-0 w-16 h-16 md:w-[80px] md:h-[80px] rounded-xl overflow-hidden bg-[#F6F7F9] border-2 transition-all ${
                activeIndex === i ? "border-primaryColor" : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={resolveImage(img)}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-contain p-1.5 mix-blend-multiply"
              />
            </button>
          ))}
        </div>
      )}

      <div
        className="group relative flex-1 bg-[#F6F7F9] rounded-2xl md:rounded-3xl overflow-hidden aspect-square cursor-zoom-in border border-gray-100"
        onMouseMove={handleMove}
        onMouseLeave={() => setZoom(null)}
      >
        <img
          src={resolveImage(gallery[activeIndex])}
          alt={title}
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: "scale(1.9)" } : undefined}
          className="w-full h-full object-contain p-8 md:p-12 mix-blend-multiply transition-transform duration-200 ease-out"
        />

        {discount > 0 && (
          <span className="absolute left-4 top-4 bg-primaryColor !text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-sm">
            {discount}% OFF
          </span>
        )}

        {multiple && (
          <>
            {["prev", "next"].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => go(dir === "next" ? 1 : -1)}
                aria-label={dir === "next" ? "Next image" : "Previous image"}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  dir === "next" ? "right-3" : "left-3"
                } w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity`}
              >
                <i className={`fa-solid ${dir === "next" ? "fa-chevron-right" : "fa-chevron-left"} text-xs !text-[#023350]`}></i>
              </button>
            ))}
            <span className="absolute right-4 bottom-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold !text-gray-700 shadow-sm">
              {activeIndex + 1} / {gallery.length}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// Splits the rich-text description so only the first two paragraphs are
// shown up front. Headings/lists that sit before the 2nd paragraph stay in
// the preview so it never starts or ends mid-thought.
const PREVIEW_PARAGRAPHS = 2;
const splitDescription = (html) => {
  if (typeof DOMParser === "undefined") return { preview: html, hasMore: false };
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const nodes = Array.from(doc.body.firstChild.childNodes).filter(
    (n) => n.nodeType === 1 || n.textContent.trim() !== ""
  );
  let paragraphs = 0;
  let cut = nodes.length;
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].nodeName === "P" && nodes[i].textContent.trim() !== "") paragraphs++;
    if (paragraphs === PREVIEW_PARAGRAPHS) {
      cut = i + 1;
      break;
    }
  }
  const toHtml = (n) => (n.nodeType === 1 ? n.outerHTML : n.textContent);
  return { preview: nodes.slice(0, cut).map(toHtml).join(""), hasMore: cut < nodes.length };
};

const PageSkeleton = () => (
  <section className="px-4 md:px-6 lg:px-side py-8 md:py-12">
    <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
      <div className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
      <div className="space-y-4">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-4/5 bg-gray-100 rounded animate-pulse" />
        <div className="h-8 w-3/5 bg-gray-100 rounded animate-pulse" />
        <div className="h-28 bg-gray-100 rounded-2xl animate-pulse mt-6" />
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse mt-6" />
      </div>
    </div>
  </section>
);

const TRUST_BADGES = [
  ["fa-shield-heart", "100% Genuine", "Sourced from authorised brands"],
  ["fa-truck-fast", "Fast Delivery", "Shipping across India"],
  ["fa-lock", "Secure Payment", "Encrypted checkout"],
  ["fa-headset", "Expert Support", "We're here to help"],
];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, wishlist } = useShop();
  const tabsRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedValues, setSelectedValues] = useState({});
  const [descExpanded, setDescExpanded] = useState(false);
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    setSelectedValues({});
    setDescExpanded(false);

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

  // Related products: same primary category, excluding the current product.
  useEffect(() => {
    if (!product) return;
    const pid = getProductId(product);
    const categoryId =
      product.defaultCategory?._id ||
      (Array.isArray(product.category) ? product.category[0]?._id || product.category[0] : null);

    if (!categoryId) {
      setRelated([]);
      setRelatedLoading(false);
      return;
    }

    let cancelled = false;
    setRelatedLoading(true);
    API.get(`/product?status=published&limit=12&category=${categoryId}`)
      .then((res) => {
        if (!cancelled) setRelated((res.data?.data || []).filter((p) => getProductId(p) !== pid));
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product]);

  const attributeGroups = useMemo(() => buildAttributeGroups(variants), [variants]);

  const selectedVariant = useMemo(
    () =>
      product?.hasVariants
        ? findMatchingVariant(variants, selectedValues, attributeGroups)
        : null,
    [product, variants, selectedValues, attributeGroups]
  );

  if (loading) return <PageSkeleton />;

  if (notFound || !product) {
    return (
      <div className="py-28 px-4 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-5">
          <i className="fa-solid fa-box-open text-3xl !text-gray-400"></i>
        </div>
        <h2 className="text-2xl font-bold !text-gray-800">Product not found</h2>
        <p className="!text-gray-500 mt-2">It may have been removed or the link is incorrect.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-6 bg-primaryColor px-6 py-3 rounded-xl font-semibold !text-white hover:bg-primaryColor/90 transition"
        >
          <i className="fa-solid fa-arrow-left text-sm !text-white"></i>
          <span className="!text-white">Back to Shop</span>
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
  const finalPrice = onSale ? salePrice : price;
  const isWishlisted = wishlist.some((item) => getProductId(item) === getProductId(product));
  const gstPct = Number(product.gst) || 0;
  const deliveryCharge = Number(product.deliveryCharge) || 0;

  // Admin-authored free-form spec sheet — per-variant for variable products,
  // per-product otherwise (see backend/models/{productModel,variantModel}.js).
  // This is the ONLY specifications source shown on the page — nothing here
  // is auto-derived from other product fields, so the card simply doesn't
  // render for a product the admin never filled in.
  const customSpecRows = (isVariable ? selectedVariant?.specifications : product.specifications) || [];
  const filledSpecRows = customSpecRows.filter((row) => row.some((cell) => cell && cell.trim() !== ""));
  const hasSpecs = filledSpecRows.length > 0;

  // Long-form rich text (Tiptap HTML) description; older products created
  // before this field existed fall back to the short description so the
  // Description card isn't blank just because it predates this feature.
  const longDescriptionHtml = product.longDescription?.trim() || `<p>${product.description || ""}</p>`;
  const hasDescription = longDescriptionHtml.replace(/<[^>]*>/g, "").trim().length > 0;

  const { preview: descriptionPreview, hasMore: descriptionHasMore } = splitDescription(longDescriptionHtml);
  const hasDetails = hasDescription || hasSpecs;

  const keyInfo = [
    product.brand?.name && ["fa-certificate", "Brand", product.brand.name],
    product.packing && ["fa-box", "Packing", product.packing],
    Number(product.moq) > 1 && ["fa-layer-group", "Min. order", `${product.moq} units`],
    ["fa-money-bill-wave", "Cash on Delivery", product.codAvailable === false ? "Not available" : "Available"],
  ].filter(Boolean);

  const stockBadge = (() => {
    if (isVariable && !selectedVariant) return null;
    if (!variantActive) return { cls: "bg-gray-100 !text-gray-600", dot: "bg-gray-400", text: "Currently unavailable" };
    if (!inStock) return { cls: "bg-red-50 !text-red-600", dot: "bg-red-500", text: "Out of stock" };
    if (stock <= 10) return { cls: "bg-amber-50 !text-amber-700", dot: "bg-amber-500", text: `Only ${stock} left` };
    return { cls: "bg-green-50 !text-green-700", dot: "bg-green-500", text: "In stock" };
  })();

  const handleAddToCart = () => {
    if (isVariable && !selectedVariant) {
      toast.error("Please select all options");
      return false;
    }
    if (!canAddToCart) {
      toast.error("This item is out of stock");
      return false;
    }
    addToCart(product, isVariable ? selectedVariant : undefined, quantity);
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) navigate("/checkout");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const scrollToTabs = () => tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      {/* Breadcrumb bar */}
      <div className="bg-[#F6F7F9] border-b border-gray-100">
        <nav className="px-4 md:px-6 lg:px-side py-3 text-[13px] flex items-center gap-2 flex-wrap">
          <Link to="/" className="!text-gray-500 hover:!text-primaryColor transition">
            <i className="fa-solid fa-house text-[11px] !text-inherit"></i>
          </Link>
          <i className="fa-solid fa-chevron-right text-[9px] !text-gray-400"></i>
          <Link to="/shop" className="!text-gray-500 hover:!text-primaryColor transition">Shop</Link>
          {categoryLabel && (
            <>
              <i className="fa-solid fa-chevron-right text-[9px] !text-gray-400"></i>
              <span className="!text-gray-500">{categoryLabel}</span>
            </>
          )}
          <i className="fa-solid fa-chevron-right text-[9px] !text-gray-400"></i>
          <span className="!text-gray-800 font-medium truncate max-w-[220px] md:max-w-sm">{product.title}</span>
        </nav>
      </div>

      <section className="px-4 md:px-6 lg:px-side pt-6 md:pt-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Gallery */}
          <div className="lg:sticky lg:top-6">
            <ImageGallery images={product.images} title={product.title} discount={isVariable && !selectedVariant ? 0 : discountPct} />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryLabel && (
                <span className="text-[11px] font-bold uppercase tracking-wider !text-secondaryColor bg-secondaryColor/10 px-2.5 py-1 rounded-md">
                  {categoryLabel}
                </span>
              )}
              {product.brand?.name && (
                <span className="text-[11px] font-semibold uppercase tracking-wider !text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                  {product.brand.name}
                </span>
              )}
            </div>

            <h1 className="text-[22px] md:text-[30px] font-bold mt-3 !text-gray-900 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mt-3 flex-wrap text-[13px]">
              {stockBadge && (
                <span className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-full ${stockBadge.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stockBadge.dot}`}></span>
                  {stockBadge.text}
                </span>
              )}
              {sku && (
                <span className="!text-gray-500">
                  SKU: <span className="font-medium !text-gray-700">{sku}</span>
                </span>
              )}
            </div>

            {/* Price card */}
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-[#F6F7F9] p-5">
              {isVariable && !selectedVariant ? (
                <p className="text-lg font-semibold !text-gray-500">Select options to see price</p>
              ) : (
                <>
                  <div className="flex items-end gap-3 flex-wrap">
                    <span className="text-3xl md:text-[38px] font-extrabold !text-gray-900 leading-none">
                      ₹{formatINR(finalPrice)}
                    </span>
                    {onSale && (
                      <>
                        <span className="text-base md:text-lg !text-gray-400 line-through leading-none pb-0.5">
                          MRP ₹{formatINR(price)}
                        </span>
                        <span className="bg-green-600 !text-white text-xs font-bold px-2 py-1 rounded-md leading-none">
                          {discountPct}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  {onSale && (
                    <p className="mt-2 text-sm font-semibold !text-green-700">
                      You save ₹{formatINR(price - salePrice)}
                    </p>
                  )}
                  <p className="mt-2 text-xs !text-gray-500">
                    {gstPct > 0 ? `+ ${gstPct}% GST applicable at checkout` : "Price inclusive of all taxes"}
                    {deliveryCharge > 0 && ` · Delivery charge ₹${formatINR(deliveryCharge)}`}
                  </p>
                </>
              )}
            </div>

            {product.description && (
              <div className="mt-5">
                <p className="!text-gray-600 text-[15px] leading-7 line-clamp-3">{product.description}</p>
                {hasDetails && (
                  <button
                    type="button"
                    onClick={scrollToTabs}
                    className="mt-1 text-sm font-semibold !text-primaryColor hover:underline"
                  >
                    View full details
                  </button>
                )}
              </div>
            )}

            {/* Variant selector */}
            {isVariable && attributeGroups.length > 0 && (
              <div className="mt-6 space-y-5">
                {attributeGroups.map((group) => (
                  <div key={group.attributeId}>
                    <p className="text-sm !text-gray-600 mb-2.5">
                      <span className="font-semibold !text-gray-900 capitalize">{group.displayName}:</span>{" "}
                      {selectedValues[group.attributeId] || "Select"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value) => {
                        const active = selectedValues[group.attributeId] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setSelectedValues((prev) => ({
                                ...prev,
                                [group.attributeId]: value,
                              }))
                            }
                            className={`min-w-[52px] px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                              active
                                ? "border-primaryColor bg-primaryColor/5 !text-primaryColor"
                                : "border-gray-200 !text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {isVariable && !selectedVariant && (
                  <p className="text-sm font-medium !text-amber-700">This combination is not available.</p>
                )}
              </div>
            )}

            {/* Quantity + actions */}
            <div className="mt-7">
              <p className="text-sm font-semibold !text-gray-900 mb-2.5">Quantity</p>
              <div className="flex flex-wrap items-stretch gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-xl h-[52px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-11 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition"
                    aria-label="Decrease quantity"
                  >
                    <i className="fa-solid fa-minus text-xs !text-gray-600"></i>
                  </button>
                  <span className="w-10 text-center font-bold !text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-11 h-full flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition"
                    aria-label="Increase quantity"
                  >
                    <i className="fa-solid fa-plus text-xs !text-gray-600"></i>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addToWishlist(isVariable ? { ...product, variants } : product)}
                  aria-label="Add to wishlist"
                  className={`w-[52px] h-[52px] flex items-center justify-center border-2 rounded-xl transition ${
                    isWishlisted ? "border-primaryColor bg-primaryColor/5" : "border-gray-200 hover:border-primaryColor"
                  }`}
                >
                  <i className={`${isWishlisted ? "fa-solid" : "fa-regular"} fa-heart !text-primaryColor`}></i>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="w-[52px] h-[52px] flex items-center justify-center border-2 border-gray-200 rounded-xl hover:border-gray-400 transition"
                >
                  <i className="fa-solid fa-share-nodes !text-gray-600"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="h-[52px] rounded-xl border-2 border-primaryColor bg-white font-bold !text-primaryColor flex items-center justify-center gap-2 hover:bg-primaryColor/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <i className="fa-solid fa-cart-plus !text-primaryColor"></i>
                  <span className="!text-primaryColor">
                    {isVariable && !selectedVariant ? "Select Options" : "Add to Cart"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canAddToCart}
                  className="h-[52px] rounded-xl bg-primaryColor font-bold flex items-center justify-center gap-2 shadow-[0_10px_25px_-10px_rgba(181,35,39,0.7)] hover:bg-[#9e1d21] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <i className="fa-solid fa-bolt !text-white"></i>
                  <span className="!text-white">Buy Now</span>
                </button>
              </div>
            </div>

            {/* Key info */}
            <div className="mt-7 grid grid-cols-2 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
              {keyInfo.map(([icon, label, value]) => (
                <div key={label} className="bg-white px-4 py-3 flex items-center gap-3">
                  <i className={`fa-solid ${icon} text-sm !text-secondaryColor w-4 text-center`}></i>
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide !text-gray-400">{label}</p>
                    <p className="text-sm font-semibold !text-gray-800 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST_BADGES.map(([icon, title, sub]) => (
                <div key={title} className="flex flex-col items-center text-center gap-1.5 rounded-xl bg-[#F6F7F9] px-2 py-3.5">
                  <span className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <i className={`fa-solid ${icon} text-sm !text-primaryColor`}></i>
                  </span>
                  <p className="text-xs font-bold !text-gray-800 leading-tight">{title}</p>
                  <p className="text-[10.5px] !text-gray-500 leading-tight">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specifications + Description — side by side (50/50) on desktop;
            on mobile specs come first, description below. If only one has
            content it spans the full width. */}
        {hasDetails && (
          <div
            ref={tabsRef}
            className={`mt-12 md:mt-16 scroll-mt-6 grid gap-5 lg:gap-6 items-start ${
              hasSpecs && hasDescription ? "lg:grid-cols-2" : ""
            }`}
          >
            {hasDescription && (
              <div className="order-2 lg:order-1 min-w-0 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 md:px-7 py-4 border-b border-gray-100 bg-[#FAFBFC]">
                  <span className="w-9 h-9 rounded-xl bg-primaryColor/10 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-align-left text-sm !text-primaryColor"></i>
                  </span>
                  <h2 className="text-lg md:text-xl font-bold !text-gray-900">Description</h2>
                </div>
                <div className="p-5 md:p-7">
                  <div
                    className="prose-description !text-gray-600 leading-8"
                    dangerouslySetInnerHTML={{
                      __html: descExpanded ? longDescriptionHtml : descriptionPreview,
                    }}
                  />
                  {descriptionHasMore && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded((v) => !v)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primaryColor/30 text-sm font-semibold !text-primaryColor hover:bg-primaryColor/5 transition"
                    >
                      <span className="!text-inherit">{descExpanded ? "View less" : "View more"}</span>
                      <i className={`fa-solid ${descExpanded ? "fa-chevron-up" : "fa-chevron-down"} text-[10px] !text-inherit`}></i>
                    </button>
                  )}
                </div>
              </div>
            )}

            {hasSpecs && (
              <div className="order-1 lg:order-2 min-w-0 bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 md:px-7 py-4 border-b border-gray-100 bg-[#FAFBFC]">
                  <span className="w-9 h-9 rounded-xl bg-secondaryColor/10 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-clipboard-list text-sm !text-secondaryColor"></i>
                  </span>
                  <h2 className="text-lg md:text-xl font-bold !text-gray-900">Specifications</h2>
                </div>
                <div className="p-5 md:p-7">
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm md:text-[15px] border-collapse">
                      <tbody>
                        {filledSpecRows.map((row, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0 even:bg-[#FAFBFC]">
                            <td className="w-2/5 px-4 md:px-5 py-3 align-top font-medium !text-gray-500 border-r border-gray-100">
                              {row[0] || "—"}
                            </td>
                            <td className="px-4 md:px-5 py-3 align-top font-semibold !text-gray-900 break-words">
                              {row
                                .slice(1)
                                .filter((cell) => cell && cell.trim() !== "")
                                .join(" · ") || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <div className="pb-14 md:pb-20">
        <ProductRail
          eyebrow="You may also like"
          title="Related Products"
          viewAllTo="/shop"
          products={related}
          loading={relatedLoading}
        />
      </div>
    </>
  );
};

export default ProductDetails;
