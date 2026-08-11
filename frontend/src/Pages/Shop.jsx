import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { useShop } from "../context/ShopContext";
import { toast } from "react-toastify";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;
const PAGE_SIZE = 12;

const resolveImage = (img) => {
  if (!img) return "/no-image.png";
  return img.startsWith("http") ? img : `${IMG_URL.replace(/\/$/, "")}/${img}`;
};

// Reads a comma-separated id list out of the URL (e.g. ?category=a,b) into
// an array — the single source of truth for "which checkboxes are checked".
const parseCsv = (value) => (value ? value.split(",").filter(Boolean) : []);

// ---------------- Sidebar filter group ----------------
const FilterCheckboxGroup = ({ title, options, selected, onToggle }) => {
  if (!options.length) return null;
  return (
    <div className="border-b border-slate-100 py-5">
      <h3 className="font-semibold text-slate-800 mb-3 text-sm tracking-wide uppercase">
        {title}
      </h3>
      <div className="filter-scroll space-y-1 max-h-56 overflow-y-auto pr-2">
        {options.map((opt) => {
          const checked = selected.includes(opt._id);
          return (
            <label
              key={opt._id}
              className="flex items-center gap-2.5 text-sm py-1.5 px-2 -mx-2 rounded-lg cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <span
                className={`w-4.5 h-4.5 shrink-0 rounded-md border flex items-center justify-center transition ${
                  checked
                    ? "bg-primaryColor border-primaryColor"
                    : "border-slate-300 bg-white"
                }`}
              >
                {checked && <i className="fa-solid fa-check !text-white text-[10px]"></i>}
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(opt._id)}
                className="sr-only"
              />
              <span className="truncate">{opt.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

// ---------------- Active filter chip ----------------
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full shadow-sm">
    {label}
    <button
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
    >
      <i className="fa-solid fa-xmark !text-slate-500 text-[9px]"></i>
    </button>
  </span>
);

// Thin, unobtrusive scrollbar for the filter lists — replaces the default
// chunky browser scrollbar that shows up on the Category/Brand option lists.
const ScrollbarStyles = () => (
  <style>{`
    .filter-scroll {
      scrollbar-width: thin;
      scrollbar-color: #dbe1e8 transparent;
    }
    .filter-scroll::-webkit-scrollbar {
      width: 5px;
    }
    .filter-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .filter-scroll::-webkit-scrollbar-thumb {
      background-color: #dbe1e8;
      border-radius: 999px;
    }
    .filter-scroll::-webkit-scrollbar-thumb:hover {
      background-color: #b9c2cc;
    }
  `}</style>
);

// ---------------- Product card ----------------
const ProductCard = ({ product, addToCart, addToWishlist }) => {
  const image = resolveImage(product.images?.[0]);
  const hasSecondImage = !!product.images?.[1];
  const onSale =
    !product.hasVariants && product.salePrice > 0 && product.salePrice < product.price;
  const discountPct = onSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const outOfStock = !product.hasVariants && Number(product.quantity) <= 0;

  const handleQuickAdd = (e) => {
    // Variant products should just navigate to the product page (the "View
    // Options" label), so let the Link's default click-through happen.
    if (product.hasVariants) return;

    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error("This item is out of stock");
      return;
    }
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToWishlist(product);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative bg-slate-50/70 aspect-[4/5] overflow-hidden">
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {onSale && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {discountPct}% OFF
            </span>
          )}
          {outOfStock && (
            <span className="bg-slate-900/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className="group/wish absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm hover:scale-110 transition"
        >
          <i className="fa-regular fa-heart text-xs !text-slate-400 group-hover/wish:!text-rose-500 transition-colors"></i>
        </button>

        <img
          src={image}
          alt={product.title}
          className={`w-full h-full object-contain p-6 transition-all duration-500 ${
            hasSecondImage ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
          }`}
          onError={(e) => {
            e.target.src = "/no-image.png";
          }}
        />
        {hasSecondImage && (
          <img
            src={resolveImage(product.images[1])}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-contain p-6 opacity-0 group-hover:opacity-100 transition-all duration-500"
          />
        )}

        {/* Slide-up add-to-cart bar */}
        <button
          onClick={handleQuickAdd}
          disabled={outOfStock}
          className="absolute left-0 right-0 bottom-0 translate-y-full group-hover:translate-y-0 bg-slate-900 text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-2 transition-transform duration-300 disabled:bg-slate-400"
        >
          <i
            className={`fa-solid ${product.hasVariants ? "fa-arrow-right" : "fa-cart-plus"} text-[11px]`}
            style={{ color: "#ffffff" }}
          ></i>
          {product.hasVariants ? "View Options" : outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {product.category?.length > 0 && (
          <span className="text-[10px] font-semibold tracking-wider uppercase text-primaryColor/80 mb-1.5">
            {product.category[0]?.name}
          </span>
        )}

        <h3 className="font-semibold text-slate-800 text-sm leading-5 h-10 overflow-hidden">
          {product.title}
        </h3>

        <div className="flex items-center gap-1.5 mt-2">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-1.5 py-0.5 rounded">
            4.5 <i className="fa-solid fa-star !text-emerald-700 text-[9px]"></i>
          </span>
          <span className="text-[11px] text-slate-400">24 ratings</span>
        </div>

        <div className="mt-auto pt-3 flex items-baseline gap-2 flex-wrap">
          {product.hasVariants ? (
            <>
              <span className="text-[11px] text-slate-400">From</span>
              <span className="text-primaryColor font-bold text-base">
                ₹{product.minSalePrice ?? product.minPrice ?? product.price}
              </span>
            </>
          ) : onSale ? (
            <>
              <span className="text-primaryColor font-bold text-base">₹{product.salePrice}</span>
              <span className="text-slate-400 text-xs line-through">₹{product.price}</span>
              <span className="text-emerald-600 text-[11px] font-semibold">{discountPct}% off</span>
            </>
          ) : (
            <span className="text-primaryColor font-bold text-base">₹{product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

// ---------------- Skeleton card ----------------
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="aspect-[4/5] bg-slate-100" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 w-14 bg-slate-100 rounded-full" />
      <div className="h-3.5 w-full bg-slate-100 rounded" />
      <div className="h-3.5 w-2/3 bg-slate-100 rounded" />
      <div className="h-4 w-16 bg-slate-100 rounded mt-1" />
    </div>
  </div>
);

// ---------------- Pagination with numbered pages ----------------
const Pagination = ({ page, totalPages, onChange }) => {
  const pages = useMemo(() => {
    const delta = 1;
    const range = [];
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift("...");
    if (page + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return [...new Set(range)];
  }, [page, totalPages]);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primaryColor hover:text-primaryColor transition"
      >
        <i className="fa-solid fa-chevron-left !text-slate-600 text-xs"></i>
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
              p === page
                ? "bg-primaryColor text-white shadow-sm shadow-primaryColor/30"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-primaryColor hover:text-primaryColor transition"
      >
        <i className="fa-solid fa-chevron-right !text-slate-600 text-xs"></i>
      </button>
    </div>
  );
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, addToWishlist } = useShop();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProduct, setTotalProduct] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Local text state for the price inputs — only committed to the URL (and
  // therefore the actual filter) when "Apply" is clicked, so the product
  // list doesn't refetch on every keystroke.
  const [minPriceInput, setMinPriceInput] = useState(searchParams.get("minPrice") || "");
  const [maxPriceInput, setMaxPriceInput] = useState(searchParams.get("maxPrice") || "");

  const selectedCategories = useMemo(() => parseCsv(searchParams.get("category")), [searchParams]);
  const selectedBrands = useMemo(() => parseCsv(searchParams.get("brand")), [searchParams]);
  const sort = searchParams.get("sort") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const activeFilterCount =
    selectedCategories.length + selectedBrands.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (search ? 1 : 0);

  // Fetch the filter option lists once — a high limit since these endpoints
  // are paginated (default 10) and the sidebar needs the full set.
  useEffect(() => {
    API.get("/category?limit=200").then((res) => setCategories(res.data.data || [])).catch(() => {});
    API.get("/brand?limit=200").then((res) => setBrands(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    params.set("status", "published");
    if (selectedCategories.length) params.set("category", selectedCategories.join(","));
    if (selectedBrands.length) params.set("brand", selectedBrands.join(","));
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);

    API.get(`/product?${params.toString()}`)
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalProduct(res.data.totalProduct || 0);
      })
      .catch((error) => console.error("Product fetch error:", error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategories, selectedBrands, minPrice, maxPrice, sort, search, page]);

  // Every filter change resets back to page 1 and updates the URL (shareable
  // + back/forward navigable), except updatePage which intentionally keeps
  // everything else as-is.
  const updateFilters = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete("page");
    setSearchParams(next);
  };

  const updatePage = (newPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (id) => {
    const next = selectedCategories.includes(id)
      ? selectedCategories.filter((c) => c !== id)
      : [...selectedCategories, id];
    updateFilters({ category: next.join(",") });
  };

  const toggleBrand = (id) => {
    const next = selectedBrands.includes(id)
      ? selectedBrands.filter((b) => b !== id)
      : [...selectedBrands, id];
    updateFilters({ brand: next.join(",") });
  };

  const applyPriceRange = () => {
    updateFilters({ minPrice: minPriceInput, maxPrice: maxPriceInput });
  };

  const clearAllFilters = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchParams({});
  };

  const categoryName = (id) => categories.find((c) => c._id === id)?.name || "Category";
  const brandName = (id) => brands.find((b) => b._id === id)?.name || "Brand";

  const sidebarContent = (
    <div className="bg-white rounded-3xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <i className="fa-solid fa-sliders !text-primaryColor text-sm"></i>
          Filters
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-primaryColor hover:underline"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <FilterCheckboxGroup
        title="Category"
        options={categories}
        selected={selectedCategories}
        onToggle={toggleCategory}
      />

      <FilterCheckboxGroup
        title="Brand"
        options={brands}
        selected={selectedBrands}
        onToggle={toggleBrand}
      />

      <div className="py-5">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm tracking-wide uppercase">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
            <input
              type="number"
              min="0"
              placeholder="Min"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-sm outline-none focus:border-primaryColor transition"
            />
          </div>
          <span className="text-slate-300">—</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
            <input
              type="number"
              min="0"
              placeholder="Max"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full border border-slate-200 rounded-lg pl-6 pr-3 py-2 text-sm outline-none focus:border-primaryColor transition"
            />
          </div>
        </div>
        <button
          onClick={applyPriceRange}
          className="mt-3 w-full bg-primaryColor text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition"
        >
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <section className="bg-[#FAFBFC]">
      <ScrollbarStyles />
      {/* Page banner */}
      <div className="bg-gradient-to-r from-primaryColor/[0.06] to-transparent border-b border-slate-100">
        <div className="container mx-auto px-4 md:px-8 lg:px-36 py-8">
          <nav className="text-xs text-slate-400 mb-2 flex items-center gap-2">
            <Link to="/" className="hover:text-primaryColor transition">Home</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium">Shop</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {search ? `Search results for "${search}"` : "All Products"}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-36 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <p className="text-sm text-slate-500">
            {loading ? "Searching…" : (
              <>
                <span className="font-semibold text-slate-700">{totalProduct}</span> products found
              </>
            )}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              <i className="fa-solid fa-sliders !text-slate-700"></i>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primaryColor text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-9 py-2.5 text-sm text-slate-700 outline-none focus:border-primaryColor transition cursor-pointer"
              >
                <option value="">Sort: Newest</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
              <i className="fa-solid fa-chevron-down !text-slate-400 text-[10px] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {selectedCategories.map((id) => (
              <FilterChip key={id} label={categoryName(id)} onRemove={() => toggleCategory(id)} />
            ))}
            {selectedBrands.map((id) => (
              <FilterChip key={id} label={brandName(id)} onRemove={() => toggleBrand(id)} />
            ))}
            {(minPrice || maxPrice) && (
              <FilterChip
                label={`₹${minPrice || 0} – ₹${maxPrice || "∞"}`}
                onRemove={() => updateFilters({ minPrice: "", maxPrice: "" })}
              />
            )}
            {search && (
              <FilterChip label={`"${search}"`} onRemove={() => updateFilters({ search: "" })} />
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr] gap-8 items-start">
          {/* Sidebar — desktop */}
          <aside className="filter-scroll hidden lg:block lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            {sidebarContent}
          </aside>

          {/* Sidebar — mobile drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-xs bg-[#F8F9FB] overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800">Filters</span>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"
                  >
                    <i className="fa-solid fa-xmark !text-slate-700"></i>
                  </button>
                </div>
                {sidebarContent}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="mt-4 w-full bg-primaryColor text-white text-sm font-semibold py-3 rounded-xl"
                >
                  Show {totalProduct} results
                </button>
              </div>
            </div>
          )}

          {/* Product grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <i className="fa-solid fa-magnifying-glass !text-slate-300 text-xl"></i>
                </div>
                <p className="text-lg font-semibold text-slate-700">No products found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting or clearing your filters.
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-5 bg-primaryColor text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      addToCart={addToCart}
                      addToWishlist={addToWishlist}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination page={page} totalPages={totalPages} onChange={updatePage} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;