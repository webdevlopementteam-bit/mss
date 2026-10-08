import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { ProductCard, ProductCardSkeleton } from "../components/ui/ProductCard";

const PAGE_SIZE = 12;

// Home-page blocks whose "View all" links open the shop filtered by
// ?section=... (products tagged in the admin panel's Home Sections field).
const SECTION_LABELS = {
  onsale: "On Sale",
  bestseller: "Best Sellers",
  toprated: "Top Rated",
  trending: "Trending Now",
  featured: "Featured Products",
  popular: "Popular Products",
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
  const section = SECTION_LABELS[searchParams.get("section")] ? searchParams.get("section") : "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const activeFilterCount =
    selectedCategories.length + selectedBrands.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (search ? 1 : 0) + (section ? 1 : 0);

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
    if (section) params.set("section", section);

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
  }, [selectedCategories, selectedBrands, minPrice, maxPrice, sort, search, section, page]);

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
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5">
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
    <section className="bg-[#F6F7F9] pb-12">
      <ScrollbarStyles />
      {/* Page header */}
      <div className="relative overflow-hidden bg-[#023350]">
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-secondaryColor/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-primaryColor/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />

        <div className="relative px-4 md:px-6 lg:px-side pt-8 md:pt-10 pb-6 md:pb-8">
          <nav className="text-xs mb-3 flex items-center gap-2">
            <Link to="/" className="!text-white/60 hover:!text-white transition">Home</Link>
            <i className="fa-solid fa-chevron-right text-[8px] !text-white/40"></i>
            <span className="!text-white font-medium">Shop</span>
          </nav>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="text-2xl md:text-[34px] font-bold !text-white leading-tight">
              {search
                ? `Results for "${search}"`
                : section
                ? SECTION_LABELS[section]
                : selectedCategories.length === 1
                ? categoryName(selectedCategories[0])
                : "All Products"}
            </h1>
            {!loading && (
              <span className="text-sm !text-white/70">
                <span className="font-bold !text-white">{totalProduct}</span> products
              </span>
            )}
          </div>

          {/* Quick category chips */}
          {categories.length > 0 && (
            <div className="mt-6 -mx-4 px-4 md:mx-0 md:px-0 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                type="button"
                onClick={() => updateFilters({ category: "" })}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold border transition ${
                  selectedCategories.length === 0
                    ? "bg-white border-white !text-[#023350]"
                    : "border-white/20 !text-white/80 hover:bg-white/10"
                }`}
              >
                All
              </button>
              {categories.slice(0, 14).map((c) => {
                const on = selectedCategories.includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => toggleCategory(c._id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold border transition ${
                      on ? "bg-primaryColor border-primaryColor !text-white" : "border-white/20 !text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-side py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap bg-white border border-gray-200/80 rounded-2xl px-4 py-3">
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
            {section && (
              <FilterChip label={SECTION_LABELS[section]} onRemove={() => updateFilters({ section: "" })} />
            )}
            {search && (
              <FilterChip label={`"${search}"`} onRemove={() => updateFilters({ search: "" })} />
            )}
          </div>
        )}

        <div className="grid lg:grid-cols-[250px_1fr] gap-6 xl:gap-8 items-start">
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
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                  {products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
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
