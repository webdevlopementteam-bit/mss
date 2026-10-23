import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mssLogo from "../assets/home/logo.png";
import { getProductById } from "../api/services";
import API from "../api/axios";
import { useShop, getProductId } from "../context/ShopContext";
import { toast } from "react-toastify";
import { setPageMeta, resetPageMeta } from "../utils/pageMeta";
import { ProductRail } from "../components/ui/ProductRail";
import { formatINR } from "../components/ui/productUtils";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const resolveImage = (img) => {
  if (!img) return "/no-image.png";
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

// ---- Image gallery: vertical thumbnail rail + main image (hover zoom,
// expand to full screen). Renders every image the admin uploaded. ----
const ImageGallery = ({ images = [], title, discount }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [lightbox, setLightbox] = useState(false);
  const gallery = images.length > 0 ? images : [""];
  const multiple = gallery.length > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === "Escape" && setLightbox(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

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
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[520px] shrink-0 md:w-[84px] p-1 md:p-1.5 md:rounded-2xl md:bg-white md:border md:border-gray-100">
          {gallery.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              onMouseEnter={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={`shrink-0 w-16 h-16 md:w-full md:h-[72px] rounded-xl overflow-hidden bg-[#F6F7F9] border-2 transition-all ${
                activeIndex === i ? "border-primaryColor shadow-sm" : "border-transparent hover:border-gray-300"
              }`}
            >
              <img src={resolveImage(img)} alt={`${title} thumbnail ${i + 1}`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/no-image.png"; }} className="w-full h-full object-contain p-1.5 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      <div
        className="group relative flex-1 rounded-2xl md:rounded-3xl overflow-hidden aspect-square cursor-zoom-in border border-gray-100 bg-gradient-to-br from-[#F4F7FB] via-white to-[#EEF3F8]"
        onMouseMove={handleMove}
        onMouseLeave={() => setZoom(null)}
      >
        <img
          src={resolveImage(gallery[activeIndex])}
          alt={title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/no-image.png";
          }}
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: "scale(1.9)" } : undefined}
          className="w-full h-full object-contain p-8 md:p-12 mix-blend-multiply transition-transform duration-200 ease-out"
        />

        {discount > 0 && (
          <span className="absolute left-4 top-4 bg-primaryColor !text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}

        {multiple &&
          ["prev", "next"].map((dir) => (
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

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="View full image"
          className="absolute right-4 bottom-4 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-105 transition"
        >
          <i className="fa-solid fa-expand text-sm !text-[#023350]"></i>
        </button>
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-[100] bg-[#021c2c]/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
        >
          <img
            src={resolveImage(gallery[activeIndex])}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-xl bg-white object-contain shadow-2xl"
          />
          <button type="button" aria-label="Close" className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <i className="fa-solid fa-xmark text-lg !text-white"></i>
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- Reviews ---------- */
const Stars = ({ value = 0, size = "text-sm" }) => (
  <span className="inline-flex gap-0.5" aria-label={`${value} out of 5`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <i
        key={n}
        className={`${size} ${
          value >= n ? "fa-solid fa-star" : value >= n - 0.5 ? "fa-solid fa-star-half-stroke" : "fa-regular fa-star"
        } !text-[#F5A623]`}
      ></i>
    ))}
  </span>
);

const ReviewsPanel = ({ productId, reviews, summary, onSaved, formOpen, setFormOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const myId = user?._id || user?.id;
  const mine = reviews.find((r) => myId && String(r.customerId) === String(myId));
  const [rating, setRating] = useState(mine?.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(mine?.comment || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRating(mine?.rating || 0);
    setComment(mine?.comment || "");
  }, [mine?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error("Please select a star rating");
    try {
      setSaving(true);
      await API.post(`/rating/product/${productId}`, { rating, comment });
      toast.success(mine ? "Your review has been updated" : "Thank you for your review!");
      setFormOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not submit review");
    } finally {
      setSaving(false);
    }
  };

  const openForm = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: location.pathname } } });
      return;
    }
    setFormOpen(true);
  };

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8">
      {/* Summary */}
      <div>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-extrabold leading-none !text-[#023350]">{summary.count ? summary.average.toFixed(1) : "–"}</span>
          <div className="pb-1">
            <Stars value={summary.average} />
            <p className="text-xs !text-gray-500 mt-1">
              {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = summary.breakdown?.[n] || 0;
            const pct = summary.count ? (c / summary.count) * 100 : 0;
            return (
              <div key={n} className="flex items-center gap-2 text-xs">
                <span className="w-3 !text-gray-600">{n}</span>
                <i className="fa-solid fa-star text-[10px] !text-[#F5A623]"></i>
                <span className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <span className="block h-full rounded-full bg-[#F5A623]" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-6 text-right !text-gray-500">{c}</span>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={openForm}
          className="mt-6 w-full h-11 rounded-xl border-2 border-primaryColor font-semibold !text-primaryColor hover:bg-primaryColor/5 transition"
        >
          {user ? (mine ? "Edit your review" : "Write a review") : "Login to write a review"}
        </button>
      </div>

      {/* Form + list */}
      <div>
        {formOpen && user && (
          <form onSubmit={submit} className="mb-6 rounded-2xl border border-gray-200 bg-[#FAFBFC] p-5">
            <p className="font-semibold !text-[#023350]">{mine ? "Update your review" : "Rate this product"}</p>
            <div className="mt-2 flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} star`}>
                  <i className={`text-2xl ${(hover || rating) >= n ? "fa-solid" : "fa-regular"} fa-star !text-[#F5A623]`}></i>
                </button>
              ))}
            </div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product (quality, packaging, delivery…)"
              className="mt-4 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm !text-gray-800 outline-none focus:border-primaryColor focus:ring-4 focus:ring-primaryColor/10"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="h-10 px-5 rounded-lg bg-primaryColor hover:bg-[#9e1d21] text-sm font-semibold !text-white transition disabled:opacity-60"
              >
                {saving ? "Submitting…" : "Submit review"}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="h-10 px-4 rounded-lg border border-gray-200 text-sm font-medium !text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center">
            <i className="fa-regular fa-comment-dots text-3xl !text-gray-300"></i>
            <p className="mt-3 font-semibold !text-gray-700">No reviews yet</p>
            <p className="text-sm !text-gray-500">Be the first to share your experience with this product.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reviews.map((r) => (
              <li key={r._id} className="py-4 first:pt-0">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-[#023350]/10 flex items-center justify-center text-sm font-bold !text-[#023350]">
                    {r.customerName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold !text-gray-800">{r.customerName}</p>
                    <div className="flex items-center gap-2">
                      <Stars value={r.rating} size="text-[11px]" />
                      <span className="text-xs !text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
                {r.comment && <p className="mt-2 text-sm leading-6 !text-gray-600 whitespace-pre-line">{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Rich-text from the admin editor often carries empty paragraphs and
// stacked <br>s (pasted text), which showed up as big vertical gaps.
const cleanDescriptionHtml = (html) =>
  String(html || "")
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br>")
    .trim();

const PREVIEW_LINES = 7;
const DESC_LINE_REM = 1.6; // keep in sync with .product-desc line-height (index.css)

/* Shows the first ~7 lines with a fade; "View more" appears only when the
 * text is actually longer than that (measured, not guessed). */
const ClampedDescription = ({ html }) => {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [html]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (expanded) return;
      setOverflows(el.scrollHeight > el.clientHeight + 4);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [html, expanded]);

  return (
    <div>
      <div className="relative">
        <div
          ref={ref}
          className="prose-description product-desc !text-gray-600 overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight: expanded ? "none" : `${PREVIEW_LINES * DESC_LINE_REM}rem` }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {!expanded && overflows && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primaryColor/30 text-sm font-semibold !text-primaryColor hover:bg-primaryColor/5 transition"
        >
          <span className="!text-inherit">{expanded ? "View less" : "View more"}</span>
          <i className={`fa-solid ${expanded ? "fa-chevron-up" : "fa-chevron-down"} text-[10px] !text-inherit`}></i>
        </button>
      )}
    </div>
  );
};

// Shown at the end of every product's description.
const MSS_ABOUT_TITLE = "MSS – Medical & Surgical Solutions | Trusted Online Medical Store in India.";
const MSS_ABOUT_TEXT =
  "MSS – Medical & Surgical Solutions is your trusted partner for high-quality healthcare products, surgical supplies, and medical essentials across India. We offer 100% genuine medical products at competitive prices, with convenient online ordering and fast, reliable delivery";

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
  ["fa-shield-heart", "100% Genuine Products", "Sourced from authorized brands only"],
  ["fa-truck-fast", "Pan-India Delivery", "Fast & reliable shipping"],
  ["fa-lock", "Secure Payments", "Razorpay protected checkout"],
  ["fa-rotate-left", "Easy Returns", "As per our return policy"],
  ["fa-headset", "Expert Support", "Call us anytime"],
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
  const [related, setRelated] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ count: 0, average: 0, breakdown: {} });
  const [reviewFormOpen, setReviewFormOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    setSelectedValues({});

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

    // Keywords: admin Meta Keywords, else the product's tags.
    const keywords = product.metaKeywords || (Array.isArray(product.tags) ? product.tags.join(", ") : "");

    setPageMeta({ title, description, keywords });

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

  // Published customer reviews for this product.
  const productKey = product ? getProductId(product) : null;
  const loadReviews = useCallback(() => {
    if (!productKey) return;
    API.get(`/rating/product/${productKey}`)
      .then((res) => {
        setReviews(res.data?.data || []);
        setReviewSummary(res.data?.summary || { count: 0, average: 0, breakdown: {} });
      })
      .catch(() => {
        setReviews([]);
        setReviewSummary({ count: 0, average: 0, breakdown: {} });
      });
  }, [productKey]);

  useEffect(() => {
    setActiveTab("details");
    setReviewFormOpen(false);
    loadReviews();
  }, [loadReviews]);

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
  const longDescriptionHtml = cleanDescriptionHtml(product.longDescription?.trim() || `<p>${product.description || ""}</p>`);
  const hasDescription = longDescriptionHtml.replace(/<[^>]*>/g, "").trim().length > 0;

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

  const openReviews = (withForm = false) => {
    setActiveTab("reviews");
    if (withForm) setReviewFormOpen(true);
    setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const companyLabel = product.company?.name || "";
  const brandLogo = product.brand?.image ? resolveImage(product.brand.image) : "";

  const TABS = [
    { key: "details", label: "Product Details", icon: "fa-file-lines" },
    hasSpecs && { key: "specs", label: "Specifications", icon: "fa-clipboard-list" },
    { key: "shipping", label: "Shipping & Returns", icon: "fa-truck-fast" },
    { key: "reviews", label: `Reviews (${reviewSummary.count})`, icon: "fa-star" },
  ].filter(Boolean);
  const currentTab = TABS.some((t) => t.key === activeTab) ? activeTab : "details";

  const SpecTable = ({ rows }) => (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0 even:bg-[#FAFBFC]">
              <td className="w-2/5 px-4 py-2.5 align-top font-medium !text-gray-500 border-r border-gray-100 bg-[#F6F8FB]">
                {row[0] || "—"}
              </td>
              <td className="px-4 py-2.5 align-top !text-gray-800 break-words">
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
  );

  return (
    <>
      {/* Breadcrumb */}
      <nav className="px-4 md:px-6 lg:px-side pt-4 text-[13px] flex items-center gap-2 flex-wrap">
        <Link to="/" className="!text-gray-500 hover:!text-primaryColor transition">
          <i className="fa-solid fa-house text-[12px] !text-inherit"></i>
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
        <span className="!text-gray-800 font-medium truncate max-w-[220px] md:max-w-md">{product.title}</span>
      </nav>

      <section className="px-4 md:px-6 lg:px-side pt-5 md:pt-6">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Gallery */}
          <div className="lg:sticky lg:top-6">
            <ImageGallery images={product.images} title={product.title} discount={isVariable && !selectedVariant ? 0 : discountPct} />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryLabel && (
                <span className="text-[11px] font-bold uppercase tracking-wide !text-white bg-[#1d4ed8] px-2.5 py-1 rounded-md">
                  {categoryLabel}
                </span>
              )}
              {companyLabel && (
                <span className="text-[11px] font-semibold uppercase tracking-wide !text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                  {companyLabel}
                </span>
              )}
            </div>

            <h1 className="text-[24px] md:text-[32px] font-bold mt-3 !text-[#023350] leading-tight">{product.title}</h1>

            {/* Rating */}
            <div className="mt-2.5 flex items-center gap-3 flex-wrap text-sm">
              <Stars value={reviewSummary.average} size="text-base" />
              {reviewSummary.count > 0 ? (
                <button type="button" onClick={() => openReviews(false)} className="!text-gray-600 hover:underline">
                  {reviewSummary.average.toFixed(1)} ({reviewSummary.count} {reviewSummary.count === 1 ? "review" : "reviews"})
                </button>
              ) : (
                <span className="!text-gray-500">No reviews yet</span>
              )}
              <button type="button" onClick={() => openReviews(true)} className="font-semibold !text-[#1d4ed8] hover:underline">
                Write a review
              </button>
            </div>

            {/* Status pills */}
            <div className="mt-4 flex items-center gap-2 flex-wrap text-[13px]">
              {stockBadge && (
                <span className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-lg ${stockBadge.cls}`}>
                  <i className="fa-solid fa-circle-check text-[12px] !text-inherit"></i>
                  {stockBadge.text}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-lg bg-[#F1F5FB] !text-[#023350]">
                <i className="fa-solid fa-shield-halved text-[12px] !text-[#023350]"></i> 100% Genuine
              </span>
              {product.codAvailable !== false && (
                <span className="inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-lg bg-[#F1F5FB] !text-[#023350]">
                  <i className="fa-solid fa-money-bill-wave text-[12px] !text-[#023350]"></i> COD Available
                </span>
              )}
              {sku && <span className="!text-gray-400 text-xs">SKU: {sku}</span>}
            </div>

            {/* Price card */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_-18px_rgba(2,51,80,0.35)] flex items-start justify-between gap-5">
              <div className="min-w-0">
                {isVariable && !selectedVariant ? (
                  <p className="text-lg font-semibold !text-gray-500">Select options to see price</p>
                ) : (
                  <>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[32px] md:text-[38px] font-extrabold leading-none !text-primaryColor">₹{formatINR(finalPrice)}</span>
                      {onSale && (
                        <>
                          <span className="text-base md:text-lg !text-gray-400 line-through">₹{formatINR(price)}</span>
                          <span className="bg-green-600 !text-white text-xs font-bold px-2 py-1 rounded-md">{discountPct}% OFF</span>
                        </>
                      )}
                    </div>
                    {onSale && <p className="mt-2 font-semibold !text-green-700">You save ₹{formatINR(price - salePrice)}</p>}
                    <p className="mt-1 text-xs !text-gray-500">
                      {gstPct > 0 ? `(+ ${gstPct}% GST applicable at checkout)` : "(Inclusive of all taxes)"}
                      {deliveryCharge > 0 && ` · Delivery ₹${formatINR(deliveryCharge)}`}
                    </p>
                  </>
                )}
              </div>
              {(brandLogo || product.brand?.name) && (
                <div className="shrink-0 text-right">
                  <p className="text-xs font-medium !text-gray-500 mb-1.5">Brand</p>
                  {brandLogo && (
                    <img
                      src={brandLogo}
                      alt={product.brand?.name || "Brand"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = "block";
                      }}
                      className="h-12 max-w-[130px] object-contain ml-auto"
                    />
                  )}
                  <p className="font-bold !text-[#023350]" style={{ display: brandLogo ? "none" : "block" }}>
                    {product.brand?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Variant selector */}
            {isVariable && attributeGroups.length > 0 && (
              <div className="mt-5 space-y-4">
                {attributeGroups.map((group) => (
                  <div key={group.attributeId}>
                    <p className="text-sm !text-gray-600 mb-2">
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
                            onClick={() => setSelectedValues((prev) => ({ ...prev, [group.attributeId]: value }))}
                            className={`min-w-[52px] px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                              active ? "border-primaryColor bg-primaryColor/5 !text-primaryColor" : "border-gray-200 !text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {!selectedVariant && <p className="text-sm font-medium !text-amber-700">This combination is not available.</p>}
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5">
              <p className="text-sm font-semibold !text-gray-900 mb-2">Quantity</p>
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center border border-gray-300 rounded-xl h-12 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-xl"
                    aria-label="Decrease quantity"
                  >
                    <i className="fa-solid fa-minus text-xs !text-gray-600"></i>
                  </button>
                  <span className="w-12 h-full flex items-center justify-center border-x border-gray-200 font-bold !text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-full flex items-center justify-center hover:bg-gray-50 rounded-r-xl"
                    aria-label="Increase quantity"
                  >
                    <i className="fa-solid fa-plus text-xs !text-gray-600"></i>
                  </button>
                </div>
                {product.packing && <span className="text-sm !text-gray-700">Pack: {product.packing}</span>}
                {Number(product.moq) > 1 && <span className="text-sm !text-gray-500">Min. order: {product.moq}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="h-[52px] rounded-xl border-2 border-primaryColor bg-white font-bold !text-primaryColor flex items-center justify-center gap-2 hover:bg-primaryColor/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-cart-plus !text-primaryColor"></i>
                <span className="!text-primaryColor">{isVariable && !selectedVariant ? "Select Options" : "Add to Cart"}</span>
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

            <div className="mt-4 flex items-center gap-8 text-sm">
              <button
                type="button"
                onClick={() => addToWishlist(isVariable ? { ...product, variants } : product)}
                className="inline-flex items-center gap-2 !text-gray-700 hover:!text-primaryColor transition"
              >
                <i className={`${isWishlisted ? "fa-solid" : "fa-regular"} fa-heart !text-primaryColor`}></i>
                <span className="!text-inherit">{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</span>
              </button>
              <button type="button" onClick={handleShare} className="inline-flex items-center gap-2 !text-gray-700 hover:!text-primaryColor transition">
                <i className="fa-solid fa-share-nodes !text-[#023350]"></i>
                <span className="!text-inherit">Share Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {TRUST_BADGES.map(([icon, title, sub]) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3.5 shadow-[0_6px_20px_-14px_rgba(2,51,80,0.35)]">
              <span className="shrink-0 w-11 h-11 rounded-full bg-primaryColor/[0.08] flex items-center justify-center">
                <i className={`fa-solid ${icon} !text-primaryColor`}></i>
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-bold leading-tight !text-[#023350]">{title}</p>
                <p className="text-[11.5px] leading-snug !text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div ref={tabsRef} className="mt-8 scroll-mt-6 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative shrink-0 flex items-center gap-2 px-5 md:px-7 py-4 text-sm md:text-[15px] font-semibold whitespace-nowrap transition-colors ${
                  currentTab === tab.key ? "!text-primaryColor" : "!text-gray-600 hover:!text-gray-900"
                }`}
              >
                <i className={`${tab.key === "reviews" ? "fa-regular" : "fa-solid"} ${tab.icon} text-[13px] !text-inherit`}></i>
                <span className="!text-inherit">{tab.label}</span>
                {currentTab === tab.key && <span className="absolute left-3 right-3 bottom-0 h-[3px] bg-primaryColor rounded-t" />}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-7">
            {currentTab === "details" && (
              <div className={`grid gap-8 ${hasSpecs ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-[22px] font-bold leading-snug !text-[#023350] mb-2">{product.title}</h2>
                  {hasDescription ? (
                    <ClampedDescription html={longDescriptionHtml} />
                  ) : (
                    <p className="text-sm !text-gray-500">No description available for this product.</p>
                  )}
                </div>
                {hasSpecs && (
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold !text-[#023350] mb-3">Key Specifications</h3>
                    <SpecTable rows={filledSpecRows.slice(0, 10)} />
                    {filledSpecRows.length > 10 && (
                      <button type="button" onClick={() => setActiveTab("specs")} className="mt-3 text-sm font-semibold !text-primaryColor hover:underline">
                        View all {filledSpecRows.length} specifications
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentTab === "specs" && hasSpecs && (
              <div className="max-w-4xl">
                <SpecTable rows={filledSpecRows} />
              </div>
            )}

            {currentTab === "shipping" && (
              <div className="grid md:grid-cols-2 gap-6 text-sm leading-6 !text-gray-600">
                <div>
                  <h3 className="font-bold !text-[#023350] mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-truck-fast !text-primaryColor"></i> Shipping
                  </h3>
                  <ul className="space-y-1.5 list-disc pl-5">
                    <li>Delivered across India with tracked courier shipping.</li>
                    <li>{deliveryCharge > 0 ? `Delivery charge for this product: ₹${formatINR(deliveryCharge)}.` : "No separate delivery charge on this product."}</li>
                    <li>{product.codAvailable === false ? "Cash on Delivery is not available for this product." : "Cash on Delivery available."}</li>
                    {gstPct > 0 && <li>GST of {gstPct}% is added at checkout.</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold !text-[#023350] mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-rotate-left !text-primaryColor"></i> Returns & Replacements
                  </h3>
                  <p>
                    Returns, replacements and cancellations are handled as per our{" "}
                    <Link to="/return-policy" className="font-semibold !text-primaryColor hover:underline">Exchange & Return Policy</Link>. For any
                    help with an order, please{" "}
                    <Link to="/contact" className="font-semibold !text-primaryColor hover:underline">contact us</Link>.
                  </p>
                </div>
              </div>
            )}

            {currentTab === "reviews" && (
              <ReviewsPanel
                productId={getProductId(product)}
                reviews={reviews}
                summary={reviewSummary}
                onSaved={loadReviews}
                formOpen={reviewFormOpen}
                setFormOpen={setReviewFormOpen}
              />
            )}
          </div>
        </div>

        {/* MSS banner — same on every product page */}
        <div className="mt-8 relative overflow-hidden rounded-2xl border border-[#d9e6f5] bg-gradient-to-r from-[#EAF2FC] via-[#F4F8FD] to-[#EAF2FC] p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="pointer-events-none absolute -left-10 -bottom-16 w-56 h-56 rounded-full bg-white/60 blur-2xl" />
          <div className="relative shrink-0 w-full md:w-[240px] h-24 md:h-28 rounded-xl bg-white/80 flex items-center justify-center p-4">
            <img
              src={brandLogo || mssLogo}
              alt={product.brand?.name || "MSS"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = mssLogo;
              }}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="relative">
            <p className="font-bold leading-snug text-base md:text-lg !text-[#023350]">{MSS_ABOUT_TITLE}</p>
            <p className="mt-2 text-sm leading-6 !text-gray-600">{MSS_ABOUT_TEXT}</p>
          </div>
        </div>
      </section>

      <div className="pb-14 md:pb-20">
        <ProductRail title="Related Products" viewAllTo="/shop" products={related} loading={relatedLoading} />
      </div>
    </>
  );
};

export default ProductDetails;
