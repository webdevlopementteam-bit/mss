import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;
const Toggle = ({ value, onChange }) => (
  <button
    onClick={onChange}
    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
      value ? "bg-green-500" : "bg-gray-600"
    }`}
  >
    <div
      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
        value ? "translate-x-6" : ""
      }`}
    />
  </button>
);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [variants, setVariants] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [currentVariant, setCurrentVariant] = useState([]);
  const [confirmVariantDelete, setConfirmVariantDelete] = useState(false);
  const [backupBasic, setBackupBasic] = useState({
    price: "",
    salePrice: "",
    quantity: "",
  });

  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sort, setSort] = useState("");
  const [status, setStatus] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [form, setForm] = useState({
    title: "",
    description: "",
    brand: "",
    category: [],
    price: "",
    quantity: "",
    ref: "",
    hsn: "",
    gst: "",
    tags: [],
    moq: "",
    packing: "",
    metaTitle: "",
    metaDescription: "",
    deliveryCharge: "",
    images: [],
    preview: [],
    homeSections: [],
    codAvailable: true,
    isPublished: true,
    hasVariants: false,
    selectedAttributes: [],
  });

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      brand: "",
      category: [],
      price: "",
      quantity: "",
      ref: "",
      hsn: "",
      gst: "",
      tags: [],
      moq: "",
      packing: "",
      metaTitle: "",
      metaDescription: "",
      deliveryCharge: "",
      images: [],
      preview: [],
      codAvailable: true,
      isPublished: true,
      hasVariants: false,
      selectedAttributes: [],
    });

    setVariants([]);
    setCurrentVariant([]);
    setEditId(null);
  };

  const fetchAttributes = async () => {
    const res = await API.get("/attribute");
    setAttributes(res.data.data || []);
  };
  useEffect(() => {
    fetchAttributes();
  }, []);
  // ================= FETCH =================
  const fetchAll = async () => {
    let url = `/product?page=${page}&limit=10`;

    const params = [];

    if (search.trim()) params.push(`search=${search}`);
    if (selectedCategory) params.push(`category=${selectedCategory}`);
    if (sort) params.push(`sort=${sort}`);
    if (status) params.push(`status=${status}`);

    if (params.length > 0) {
      url += `&${params.join("&")}`;
    }

    const [p, b, c, a] = await Promise.all([
      API.get(url),
      API.get("/brand"),
      API.get("/category"),
      API.get("/attribute"),
    ]);

    setProducts(p.data.data || []);
    setTotalPages(p.data.totalPages || 1);
    setBrands(b.data.data || []);
    setCategories(c.data.data || []);
    setAttributes(a.data.data || []);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAll();
    }, 300);

    return () => clearTimeout(delay);
  }, [search, selectedCategory, sort, status, page]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, sort, status]);

  const handleImage = (e) => {
    const files = Array.from(e.target.files);

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...files],
      preview: [
        ...(prev.preview || []),
        ...files.map((f) => URL.createObjectURL(f)),
      ],
    }));
  };

  // Price/stock for variant products are now computed server-side (see
  // getAllProduct's aggregation) and returned directly on each product —
  // no more N+1 per-product fetch needed here.
  const formatRange = (min, max) => {
    if (min === undefined || min === null || isNaN(min)) return "—";
    return min === max ? `₹${min}` : `₹${min} - ₹${max}`;
  };

  const getPriceRange = (p) => {
    if (!p.hasVariants) return `₹${p.price}`;
    return formatRange(p.minPrice, p.maxPrice);
  };

  const getSalePriceRange = (p) => {
    if (!p.hasVariants) return p.salePrice ? `₹${p.salePrice}` : "—";
    if (!p.minSalePrice) return "—";
    return formatRange(p.minSalePrice, p.maxSalePrice);
  };

  const getTotalStock = (p) => {
    if (!p.hasVariants) return Number(p.quantity || 0);
    return Number(p.totalStock || 0);
  };

  const getStatus = (p) => {
    const stock = getTotalStock(p);

    if (stock === 0) {
      return (
        <span className="bg-red-600/20 text-red-600 px-3 py-1 text-xs rounded-xl">
          Sold Out
        </span>
      );
    }

    return (
      <span className="bg-green-600/20 text-green-600 px-3 py-1 text-xs rounded-xl">
        Selling
      </span>
    );
  };

  // ================= SUBMIT =================

  const handleSubmit = async () => {
    try {
      const fd = new FormData();

      if (!form.hasVariants) {
        const price = Number(form.price);
        const sale = Number(form.salePrice);
        console.log(price, sale);
        if (form.salePrice && sale > price) {
          toast.error("Sale price must be ≤ price");
          return;
        }
      }

      if (form.hsn) {
        if (!/^\d{8}$/.test(form.hsn)) {
          toast.error("HSN must be exactly 8 digits");
          return;
        }
      }

      // ================= BASIC LOOP =================
      Object.keys(form).forEach((k) => {
        if (k === "category") {
          form.category.forEach((c) => fd.append("category", c));
        } else if (k === "tags") {
          form.tags.forEach((t) => fd.append("tags", t));
        } else if (
          [
            "images",
            "existingImages",
            "preview",
            "selectedAttributes",
            "price",
            "salePrice",
            "quantity",
            "gst",
            "moq",
            "deliveryCharge",
            "hasVariants",
            "homeSections", // ✅ ADD THIS
          ].includes(k)
        ) {
          return;
        } else if (k !== "defaultCategory") {
          fd.append(k, form[k]);
        }
      });
      fd.append(
  "homeSections",
  JSON.stringify(
    form.homeSections || []
  )
);

      // ================= NUMBERS FIX =================
      // ✅ FIX HASVARIANTS TYPE
      fd.append("hasVariants", form.hasVariants ? "true" : "false");
      if (!form.hasVariants) {
        fd.append("price", Number(form.price || 0));
        if (!form.hasVariants && form.salePrice !== "") {
          fd.append("salePrice", Number(form.salePrice));
        }
        fd.append("quantity", Number(form.quantity || 0));
      }
      fd.append("gst", Number(form.gst || 0));
      fd.append("moq", Number(form.moq || 0));
      fd.append("deliveryCharge", Number(form.deliveryCharge || 0));

      if (form.defaultCategory) {
        fd.append("defaultCategory", form.defaultCategory);
      }

      // ================= IMAGES FIX =================

      // OLD IMAGES (edit ke time)
      if (form.existingImages?.length) {
        form.existingImages.forEach((img) => fd.append("existingImages", img));
      }

      // NEW IMAGES
      if (form.images?.length) {
        form.images.forEach((img) => fd.append("images", img));
      }

      // ================= HSN VALIDATION =================

      // ================= API CALL =================

      // ================= VARIANT VALIDATION =================
      if (form.hasVariants) {
        if (!variants.length) {
          toast.error("Please add at least one variant");
          return;
        }

        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];

          if (!v.price || !v.quantity || !v.sku) {
            toast.error(`Variant ${i + 1}: fill price, quantity & SKU`);
            return;
          }

          if (Number(v.price) <= 0) {
            toast.error(`Variant ${i + 1}: price must be > 0`);
            return;
          }

          if (Number(v.quantity) < 0) {
            toast.error(`Variant ${i + 1}: invalid quantity`);
            return;
          }

          if (v.salePrice && Number(v.salePrice) > Number(v.price)) {
            toast.error(`Variant ${i + 1}: sale price must be ≤ price`);
            return;
          }
        }
      }

      // ================= VARIANTS (same request as the product — atomic) =================
      if (form.hasVariants) {
        fd.append("variants", JSON.stringify(variants));
      }

      const res = editId
        ? await API.put(`/product/${editId}`, fd)
        : await API.post("/product", fd);

      // ================= SUCCESS =================
      toast.success("Product Saved");

      resetForm();
      setShow(false);
      fetchAll();
    } catch (err) {
      let msg = "Something went wrong";

      const errorMsg = err?.response?.data?.message || "";

      // number error
      if (errorMsg.includes("Cast to Number failed")) {
        const field = errorMsg.split(":")[1]?.trim()?.split(" ")[0];
        msg = `${field?.toUpperCase() || "Field"} must be a number`;
      }

      // required error
      else if (errorMsg.includes("required")) {
        const field = errorMsg.split(":")[1]?.trim()?.split(" ")[0];
        msg = `${field?.toUpperCase() || "Field"} is required`;
      } else if (errorMsg) {
        msg = errorMsg;
      }

      toast.error(msg);
    }
  };

  const handleEdit = async (p) => {
    setEditId(p._id);

    const res = await API.get(`/product/${p._id}`);

    const product = res.data.data.product;
    const variantData = res.data.data.variants || [];

    setForm({
      ...product,

      // 🔥 FIXES
      category: product.category?.map((c) => c._id) || [],
      defaultCategory: product.defaultCategory?._id || "", // ✅ MAIN FIX
      brand: product.brand?._id || "",

      price: product.price?.toString() || "",
      salePrice: product.salePrice?.toString() || "",
      quantity: product.quantity?.toString() || "",
      gst: product.gst?.toString() || "",
      moq: product.moq?.toString() || "",
      deliveryCharge: product.deliveryCharge?.toString() || "",
      hsn: product.hsn?.toString() || "",
      homeSections:product.homeSections || [],
      existingImages: product.images || [],
      preview: product.images?.map((img) => `${IMG_URL}/${img}`) || [],
    });

    // ✅ FIX VARIANTS FORMAT — attributeId comes back populated (a full
    // Attribute object) from GET /product/:id; flatten it back to a plain id
    // string so it round-trips correctly when this variant set is re-submitted.
    const formatted = variantData.map((v) => ({
      ...v,
      sku: v.sku || "",
      isActive: v.isActive !== false,
      attributes: v.attributes.map((a) => ({
        attributeId: a.attributeId?._id || a.attributeId,
        value: a.value,
      })),
    }));

    setVariants([...formatted]); // force replace

    setShow(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    await API.delete(`/product/${id}`);
    toast.success("Deleted");
    fetchAll();
  };

  const handleBulkDelete = async () => {
    try {
      await API.delete("/product/bulk", {
        data: { ids: selectedProducts },
      });

      toast.success("Products deleted");

      setSelectedProducts([]);
      setBulkDeleteConfirm(false);
      fetchAll();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6 pt-20 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl text-white">Products</h1>
        <div className="flex gap-3">
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer">
            Import CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const fd = new FormData();
                fd.append("file", file);

                try {
                  await API.post("/product/import/csv", fd);
                  toast.success("Imported");
                  fetchAll();
                } catch {
                  toast.error("Import failed");
                }
              }}
            />
          </label>
          <button
            onClick={() => {
              window.open(`${API.defaults.baseURL}/product/export/csv`);
            }}
            className="px-4 py-2 bg-green-600 rounded-lg text-white"
          >
            Export CSV
          </button>
          <button
            onClick={() => {
              if (!selectedProducts.length) {
                toast.error("Select at least one product");
                return;
              }
              setBulkDeleteConfirm(true);
            }}
            className={`px-4 py-2 rounded-lg ${
              selectedProducts.length
                ? "bg-red-600 text-white"
                : "bg-gray-400 text-black"
            }`}
          >
            Delete Selected
          </button>
          <button
            onClick={() => {
              setShow(true);
              resetForm();
              setActiveTab("basic");
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br 
      from-[var(--primary)] to-[var(--primary-container)] transition"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {bulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f131c] border border-white/10 rounded-2xl p-6 w-[350px] shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-2">
              Delete Products
            </h2>

            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to delete {selectedProducts.length}{" "}
              products?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setBulkDeleteConfirm(false);
                  setSelectedProducts([]);
                }}
                className="px-4 py-2 rounded-lg bg-white/10 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex gap-3">
        {/* SEARCH */}
        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-[#0f131c] border border-white/10 text-white w-[350px]"
        />

        {/* CATEGORY FILTER */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="pl-4 pr-14 py-2 rounded-lg bg-[#0f131c] border border-white/10 text-white"
        >
          <option value="" className="text-white">
            All Categories
          </option>
          {categories.map((c) => (
            <option key={c._id} value={c._id} className="text-white">
              {c.name}
            </option>
          ))}
        </select>

        {/* PRICE SORT */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="pl-4 pr-14 py-2 rounded-lg bg-[#0f131c] border border-white/10 text-white"
        >
          <option value="" className="text-white">
            Sort by Price
          </option>
          <option value="low" className="text-white">
            Low → High
          </option>
          <option value="high" className="text-white">
            High → Low
          </option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="pl-4 pr-14 rounded-lg bg-[#0f131c] border border-white/10 text-white"
        >
          <option value="" className="text-white">
            All Status
          </option>
          <option value="published" className="text-white">
            Published
          </option>
          <option value="unpublished" className="text-white">
            Unpublished
          </option>
          <option value="selling" className="text-white">
            Selling
          </option>
          <option value="outofstock" className="text-white">
            Out of Stock
          </option>
        </select>

        {/* SEARCH BUTTON */}
        <button
          onClick={() => fetchAll()}
          className="px-6 py-2 bg-red-500 rounded-lg text-white"
        >
          Apply
        </button>

        <button
          onClick={() => {
            setSearch("");
            setSelectedCategory("");
            setSort("");
            setStatus("");

            setTimeout(() => {
              fetchAll();
            }, 0);
          }}
          className="px-6 py-2 bg-gray-600 rounded-lg text-white"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}

      <div className="bg-[#0f131c] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-white/60 border-b border-white/10">
            <tr>
              <th className="p-4 text-white text-left">
                <input
                  type="checkbox"
                  checked={
                    products.length > 0 &&
                    selectedProducts.length === products.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts(products.map((p) => p._id));
                    } else {
                      setSelectedProducts([]);
                    }
                  }}
                />
              </th>
              <th className="p-4 text-left text-white">Product</th>
              <th className="p-4 text-left text-white">Category</th>
              <th className="p-4 text-left text-white">Price</th>
              <th className="p-4 text-left text-white">Sale Price</th>
              <th className="p-4 text-left text-white">Stock</th>
              <th className="p-4 text-left text-white">Status</th>
              <th className="p-4 text-left text-white">Published</th>
              <th className="p-4 text-left text-white">Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => {
              console.log("TITLE:", p.title);
              console.log("IMAGES:", p.images);
              console.log("FIRST IMAGE:", p.images?.[0]);
              console.log("----------------------");
              return (
                <tr
                  key={p._id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  {/* PRODUCT */}
                  <td className="p-4 text-white">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(p._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProducts([...selectedProducts, p._id]);
                        } else {
                          setSelectedProducts(
                            selectedProducts.filter((id) => id !== p._id),
                          );
                        }
                      }}
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3 text-white">
                    <img
  src={
    p.images?.[0]
      ? p.images[0].startsWith("http")
        ? p.images[0]
        : `${IMG_URL.replace(/\/$/, "")}/${p.images[0]}`
      : "/no-image.png"
  }
  onError={(e) => (e.target.src = "/no-image.png")}
  className="w-12 h-12 rounded-lg object-cover border border-white/10"
/>
                    <span className="text-white">{p.title}</span>
                  </td>

                  {/* CATEGORY */}
                  <td className="p-4 text-white">
                    {p.category?.map((c) => c.name).join(", ") || "—"}
                  </td>

                  {/* PRICE */}
                  <td className="p-4 text-white">{getPriceRange(p)}</td>

                  <td className="p-4 text-white">{getSalePriceRange(p)}</td>

                  <td className="p-4 text-white">
                    {getTotalStock(p)}
                  </td>

                  <td>{getStatus(p)}</td>

                  {/* PUBLISHED TOGGLE */}
                  <td className="p-4">
                    <Toggle
                      value={p.isPublished}
                      onChange={async () => {
                        try {
                          await API.patch(`/product/${p._id}/publish`, {
                            isPublished: !p.isPublished,
                          });

                          setProducts((prev) =>
                            prev.map((item) =>
                              item._id === p._id
                                ? { ...item, isPublished: !item.isPublished }
                                : item,
                            ),
                          );

                          toast.success("Status updated");
                        } catch (err) {
                          console.log("PUBLISH ERROR:", err.response?.data);
                          toast.error("Failed to update");
                        }
                      }}
                    />
                  </td>
                                     {/* ACTION */}
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 bg-blue-600 rounded-lg"
                    >
                      <Pencil size={14} className="text-white" />
                    </button>

                    <button
                      onClick={() => setDeleteId(p._id)}
                      className="p-2 bg-red-600 rounded-lg"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Prev
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-600 text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f131c] border border-white/10 rounded-2xl p-6 w-[350px] shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-2">
              Delete Product
            </h2>

            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to delete this product?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await API.delete(`/product/${deleteId}`);
                  toast.success("Deleted");
                  setDeleteId(null);
                  fetchAll();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER */}

      {show && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
          <div className="w-[650px] bg-[#0f131c] h-full p-6 overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editId ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("basic");
                  setShow(false);
                }}
                className="text-white"
              >
                ✕
              </button>
            </div>

            {/* VARIANT TOGGLE */}
            <div className="flex justify-between mb-4">
              <span className="text-orange-400">
                Does this product have variants?
              </span>

              <Toggle
                value={form.hasVariants}
                onChange={() => {
                  //  OFF karte waqt confirmation
                  if (
                    form.hasVariants &&
                    (variants.length > 0 || currentVariant.length > 0)
                  ) {
                    setConfirmVariantDelete(true);
                    return;
                  }

                  // 🟢 ON karte waqt backup
                  if (!form.hasVariants) {
                    // backup
                    setBackupBasic({
                      price: form.price,
                      salePrice: form.salePrice,
                      quantity: form.quantity,
                    });

                    // 🔥 IMPORTANT: CLEAR EVERYTHING
                    setVariants([]);
                    setCurrentVariant([]);

                    setForm((prev) => ({
                      ...prev,
                      hasVariants: true,
                    }));
                  } else {
                    // 🟡 OFF (no variants case)
                    setForm((prev) => ({
                      ...prev,
                      hasVariants: false,
                      price: backupBasic.price,
                      salePrice: backupBasic.salePrice,
                      quantity: backupBasic.quantity,
                    }));

                    setVariants([]);
                    setCurrentVariant([]);
                    setActiveTab("basic");
                  }
                }}
              />
            </div>

            {confirmVariantDelete && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-[#0f131c] border border-white/10 rounded-2xl p-6 w-[350px] shadow-xl">
                  <h2 className="text-lg font-semibold text-white mb-2">
                    Remove Variants
                  </h2>

                  <p className="text-sm text-white/60 mb-6">
                    Do you want to delete all variants? This action cannot be
                    undone.
                  </p>

                  <div className="flex justify-end gap-3">
                    {/* CANCEL */}
                    <button
                      onClick={() => setConfirmVariantDelete(false)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white"
                    >
                      Cancel
                    </button>

                    {/* YES DELETE */}
                    <button
                      onClick={() => {
                        setConfirmVariantDelete(false);

                        setForm((prev) => ({
                          ...prev,
                          hasVariants: false,
                        }));

                        setVariants([]);
                        setCurrentVariant([]);
                        setActiveTab("basic");
                      }}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white"
                    >
                      Yes, Remove
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="flex gap-6 border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveTab("basic")}
                className={
                  activeTab === "basic"
                    ? "text-[var(--primary)]"
                    : "text-white/60"
                }
              >
                Basic Info
              </button>

              {form.hasVariants && (
                <button
                  onClick={() => setActiveTab("variant")}
                  className={
                    activeTab === "variant"
                      ? "text-[var(--primary)]"
                      : "text-white/60"
                  }
                >
                  Variants
                </button>
              )}
            </div>

            {/* ================= BASIC TAB ================= */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-2 gap-4">
                {/* TITLE */}
                <div className="col-span-2">
                  <label className="label">Product Title</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                {/* DESCRIPTION */}
                <div className="col-span-2">
                  <label className="label">Description</label>
                  <textarea
                    className="input"
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>

                {/* SEO SECTION */}
                <div className="col-span-2 mt-4 border-t border-white/10 pt-4">
                  <h3 className="text-white/80 mb-3">SEO</h3>

                  <div className="mb-3">
                    <label className="label">Meta Title</label>
                    <input
                      className="input"
                      value={form.metaTitle || ""}
                      onChange={(e) =>
                        setForm({ ...form, metaTitle: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="label">Meta Description</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={form.metaDescription || ""}
                      onChange={(e) =>
                        setForm({ ...form, metaDescription: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* IMAGE UPLOAD */}
                <div className="col-span-2 mt-2">
                  <label className="label">Product Images</label>

                  <div className="border border-dashed border-white/20 rounded-lg p-4 flex flex-wrap gap-3">
                    {/* PREVIEW */}
                    {form.preview?.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img}
                          className="w-16 h-16 object-cover rounded-lg border border-white/10"
                        />

                        {/* ❌ DELETE BUTTON */}
                        <button
                          onClick={() => {
                            setForm((prev) => {
                              const newImages = [...(prev.images || [])];
                              const newPreview = [...(prev.preview || [])];
                              const newExisting = [
                                ...(prev.existingImages || []),
                              ];

                              // 👇 CASE 1: NEW IMAGE
                              if (i >= newExisting.length) {
                                const newIndex = i - newExisting.length;
                                newImages.splice(newIndex, 1);
                              }
                              // 👇 CASE 2: OLD IMAGE
                              else {
                                newExisting.splice(i, 1);
                              }

                              newPreview.splice(i, 1);

                              return {
                                ...prev,
                                images: newImages,
                                preview: newPreview,
                                existingImages: newExisting, // 🔥 MOST IMPORTANT
                              };
                            });
                          }}
                          className="absolute top-[-6px] right-[-6px] bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {/* INPUT */}
                    <label className="cursor-pointer text-white/60 text-sm flex items-center justify-center w-20 h-16 border border-white/20 rounded-lg">
                      +
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);

                          setForm((prev) => ({
                            ...prev,
                            images: [...(prev.images || []), ...files],
                            preview: [
                              ...(prev.preview || []),
                              ...files.map((f) => URL.createObjectURL(f)),
                            ],
                          }));
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* BRAND */}
                <div>
                  <label className="label">Brand</label>
                  <select
                    className="input"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                  >
                    <option value="" className="text-white">
                      Select Brand
                    </option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id} className="text-white">
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CATEGORY */}

                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={form.category[0] || ""}
                    onChange={(e) =>
                      setForm({ ...form, category: [e.target.value] })
                    }
                  >
                    <option value="" className="text-white">
                      Select Category
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id} className="text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DEFAULT CATEGORY */}
                <div className="col-span-2">
                  <label className="label">Default Category</label>
                  <select
                    className="input"
                    value={form.defaultCategory}
                    onChange={(e) =>
                      setForm({ ...form, defaultCategory: e.target.value })
                    }
                  >
                    <option value="" className="text-white">Select Default</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id} className="text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRICE SECTION */}

                <div
                  className={`col-span-2 grid grid-cols-2 gap-4 ${
                    form.hasVariants ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {/* PRICE */}
                  <div>
                    <label className="label">Price</label>
                    <input
                      className="input"
                      value={form.price || ""}
                      onChange={(e) => {
                        const val = e.target.value;

                        if (!/^\d*$/.test(val)) return;

                        setForm({ ...form, price: val });
                      }}
                    />
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label className="label">Quantity</label>
                    <input
                      className="input"
                      value={form.quantity || ""}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                    />
                  </div>

                  {/* SALE PRICE */}
                  <div>
                    <label className="label">Sale Price</label>
                    <input
                      className="input"
                      value={form.salePrice || ""}
                      onChange={(e) => {
                        const val = e.target.value;

                        // ✅ only numbers allow
                        if (!/^\d*$/.test(val)) return;

                        setForm({ ...form, salePrice: val });
                      }}
                    />
                  </div>

                  <div>
                    <label className="label">Reference no.</label>
                    <input
                      className="input"
                      value={form.ref || ""}
                      onChange={(e) =>
                        setForm({ ...form, ref: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* GST */}
                <div>
                  <label className="label">GST</label>
                  <input
                    className="input"
                    value={form.gst || ""}
                    onChange={(e) => {
                      const val = e.target.value;

                      // only numbers allow
                      if (!/^\d*$/.test(val)) return;

                      setForm({ ...form, gst: val });
                    }}
                  />
                </div>

                <div>
                  <label className="label">HSN</label>
                  <input
                    className="input"
                    value={form.hsn || ""}
                    onChange={(e) => {
                      const val = e.target.value;

                      // only numbers allow
                      if (!/^\d*$/.test(val)) return;

                      // max 8 digits
                      if (val.length > 8) return;

                      setForm({ ...form, hsn: val });
                    }}
                  />
                </div>

                <div>
                  <label className="label">MOQ</label>
                  <input
                    className="input"
                    value={form.moq || ""}
                    onChange={(e) => setForm({ ...form, moq: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Packing</label>
                  <input
                    className="input"
                    value={form.packing || ""}
                    onChange={(e) =>
                      setForm({ ...form, packing: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="label">Delivery Charge</label>
                  <input
                    className="input"
                    value={form.deliveryCharge || ""}
                    onChange={(e) => {
                      const val = e.target.value;

                      // only numbers allow
                      if (!/^\d*$/.test(val)) return;

                      setForm({ ...form, deliveryCharge: val });
                    }}
                  />
                </div>

                {/* <div>
                  <label className="label">Reference No</label>
                  <input
                    className="input"
                    value={form.referenceNo || ""}
                    onChange={(e) =>
                      setForm({ ...form, referenceNo: e.target.value })
                    }
                  />
                </div> */}
                {/* <div>
                  <label className="label">Tags</label>
                  <input
                    className="input"
                    value={form.tags.join(",")}
                    onChange={(e) =>
                      setForm({ ...form, tags: e.target.value.split(",") })
                    }
                  />
                </div> */}

                 <div className="col-span-2 mt-4">
  <label className="label">
    Home Page Sections
  </label>

  <div className="grid grid-cols-2 gap-3 mt-2">

    {[
      "trending",
      "featured",
      "popular",
      "bestseller",
      "toprated",
      "onsale",
    ].map((section) => (
      <label
        key={section}
        className="flex items-center gap-2 text-white"
      >
        <input
          type="checkbox"
          checked={
            form.homeSections?.includes(
              section
            )
          }
          onChange={(e) => {
            if (e.target.checked) {
              setForm({
                ...form,
                homeSections: [
                  ...(form.homeSections || []),
                  section,
                ],
              });
            } else {
              setForm({
                ...form,
                homeSections:
                  form.homeSections.filter(
                    (s) =>
                      s !== section
                  ),
              });
            }
          }}
        />

        {section}
      </label>
    ))}
  </div>
</div>

                {/* TOGGLES */}
                <div className="flex justify-between col-span-2 mt-2">
                  <span className="text-white">COD Available</span>
                  <Toggle
                    value={form.codAvailable}
                    onChange={() =>
                      setForm({ ...form, codAvailable: !form.codAvailable })
                    }
                  />
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-white">Published</span>
                 
                  <Toggle
                    value={form.isPublished}
                    onChange={() =>
                      setForm({ ...form, isPublished: !form.isPublished })
                    }
                  />
                </div>
              </div>
            )}

            {/* ================= VARIANT TAB ================= */}
            {form.hasVariants && activeTab === "variant" && (
              <div className="relative overflow-visible">
                {/* ATTRIBUTE + VALUE PICKER — always-visible two-step picker:
                    1) pick which attributes apply (Size, Color, ...)
                    2) pick which values of each apply, then Generate builds
                    every combination (Cartesian product) in one click. */}
                <div className="space-y-4">
                  {/* STEP 1: ATTRIBUTES */}
                  <div>
                    <label className="label">
                      Step 1 — Which attributes does this product have?{" "}
                      <span className="text-white/40 font-normal">
                        (e.g. Size, Color)
                      </span>
                    </label>

                    {attributes.length === 0 ? (
                      <p className="text-white/40 text-sm">
                        No attributes exist yet — create one under Catalog →
                        Attributes first.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {attributes.map((a) => {
                          const checked = selectedAttributes.includes(a._id);
                          return (
                            <label
                              key={a._id}
                              className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition ${
                                checked
                                  ? "bg-blue-600/30 border-blue-500 text-blue-300"
                                  : "border-white/10 text-white/70 hover:border-white/30"
                              }`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAttributes((prev) => [
                                      ...prev,
                                      a._id,
                                    ]);
                                  } else {
                                    setSelectedAttributes((prev) =>
                                      prev.filter((id) => id !== a._id),
                                    );
                                    setSelectedValues((prev) => {
                                      const copy = { ...prev };
                                      delete copy[a._id];
                                      return copy;
                                    });
                                  }
                                }}
                              />
                              {checked ? "✓ " : ""}
                              {a.displayName}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* STEP 2: VALUES — one box per attribute chosen in step 1 */}
                  {selectedAttributes.length > 0 && (
                    <div>
                      <label className="label">
                        Step 2 — Pick the values to include for each attribute
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedAttributes.map((attrId) => {
                          const attr = attributes.find((a) => a._id === attrId);
                          const allValues = attr?.variants || [];
                          const values = selectedValues[attrId] || [];
                          const allSelected =
                            allValues.length > 0 &&
                            values.length === allValues.length;

                          return (
                            <div
                              key={attrId}
                              className="border border-white/10 rounded-lg p-2 bg-[#0f172a]"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white text-xs font-medium">
                                  {attr?.displayName}
                                </span>
                                {allValues.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedValues((prev) => ({
                                        ...prev,
                                        [attrId]: allSelected
                                          ? []
                                          : [...allValues],
                                      }))
                                    }
                                    className="text-xs text-blue-400 hover:underline"
                                  >
                                    {allSelected ? "Clear" : "Select all"}
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 min-h-[32px]">
                                {allValues.map((v, i) => {
                                  const checked = values.includes(v);
                                  return (
                                    <label
                                      key={i}
                                      className={`px-2 py-1 rounded text-xs cursor-pointer border transition ${
                                        checked
                                          ? "bg-blue-600/30 border-blue-500 text-blue-300"
                                          : "border-white/10 text-white/70 hover:border-white/30"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={checked}
                                        onChange={(e) => {
                                          setSelectedValues((prev) => {
                                            const current = prev[attrId] || [];
                                            return {
                                              ...prev,
                                              [attrId]: e.target.checked
                                                ? [...current, v]
                                                : current.filter((x) => x !== v),
                                            };
                                          });
                                        }}
                                      />
                                      {checked ? "✓ " : ""}
                                      {v}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: GENERATE — builds every combination at once (e.g. 3
                      sizes × 2 colors = 6 variants in one click); the live count
                      below tells the admin exactly what will be created before
                      they click. */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (selectedAttributes.length === 0) {
                          toast.error("Select at least one attribute");
                          return;
                        }

                        for (let attrId of selectedAttributes) {
                          if (!selectedValues[attrId]?.length) {
                            toast.error("Select at least one value for each attribute");
                            return;
                          }
                        }

                        // Cartesian product across every selected attribute's values
                        let combos = [[]];
                        for (const attrId of selectedAttributes) {
                          const values = selectedValues[attrId];
                          const next = [];
                          for (const combo of combos) {
                            for (const value of values) {
                              next.push([...combo, { attributeId: attrId, value }]);
                            }
                          }
                          combos = next;
                        }

                        const existingCombos = new Set(
                          variants.map((v) => v.combination.toLowerCase())
                        );
                        const newRows = [];
                        let skipped = 0;

                        for (const attrs of combos) {
                          const combination = attrs.map((a) => a.value).join("-");
                          if (existingCombos.has(combination.toLowerCase())) {
                            skipped++;
                            continue;
                          }
                          existingCombos.add(combination.toLowerCase());
                          newRows.push({
                            combination,
                            attributes: attrs,
                            price: "",
                            salePrice: "",
                            quantity: "",
                            sku: "",
                            isActive: true,
                          });
                        }

                        if (newRows.length > 0) {
                          setVariants((prev) => [...prev, ...newRows]);
                          toast.success(`${newRows.length} variant(s) generated`);
                        }
                        if (skipped > 0) {
                          toast(`${skipped} combination(s) already existed and were skipped`);
                        }

                        // reset the picker so the next batch starts fresh
                        setSelectedAttributes([]);
                        setSelectedValues({});
                      }}
                      className=" px-4 py-2 rounded-lg bg-gradient-to-br
          from-[var(--primary)] to-[var(--primary-container)] text-white font-medium"
                    >
                      Generate Variants
                    </button>

                    {selectedAttributes.length > 0 &&
                      selectedAttributes.every(
                        (id) => (selectedValues[id]?.length || 0) > 0
                      ) && (
                        <span className="text-white/50 text-sm">
                          Will generate{" "}
                          {selectedAttributes.reduce(
                            (acc, id) => acc * (selectedValues[id]?.length || 0),
                            1
                          )}{" "}
                          variant(s)
                        </span>
                      )}
                  </div>
                </div>

                {/* VARIANTS */}
                <div className="bg-[#111827] p-3 rounded-lg mt-5">
                  {variants.length === 0 ? (
                    <p className="text-white/50 text-sm text-center py-4">
                      Select attributes and click generate
                    </p>
                  ) : (
                    <div className="mt-4 border border-white/10 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-[#1e293b] text-gray-300">
                          <tr>
                            <th className="p-3 text-left text-white">
                              Variant
                            </th>
                            <th className="p-3 text-white">Price</th>
                            <th className="p-3 text-white">Sale</th>
                            <th className="p-3 text-white">Qty</th>
                            <th className="p-3 text-white">SKU</th>
                            <th className="p-3 text-white text-center">Status</th>
                            <th className="p-3 text-white text-right">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {variants.map((v, i) => (
                            <tr key={i} className="border-t border-white/10">
                              <td className="p-3 text-white">
                                {v.combination}
                              </td>

                              <td className="p-3">
                                <input
                                  className="input-sm"
                                  value={v.price}
                                  onChange={(e) => {
                                    const copy = [...variants];
                                    copy[i].price = e.target.value;
                                    setVariants(copy);
                                  }}
                                />
                              </td>

                              <td className="p-3">
                                <input
                                  className="input-sm"
                                  value={v.salePrice || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;

                                    if (!/^\d*$/.test(val)) return;

                                    const copy = [...variants];

                                    const price = parseFloat(copy[i].price);
                                    const sale = parseFloat(val);

                                    if (
                                      !isNaN(price) &&
                                      !isNaN(sale) &&
                                      sale > price
                                    ) {
                                      toast.error(
                                        "Sale price cannot be greater than price",
                                      );
                                      return;
                                    }

                                    copy[i].salePrice = val;
                                    setVariants(copy);
                                  }}
                                />
                              </td>

                              <td className="p-3">
                                <input
                                  className="input-sm"
                                  value={v.quantity}
                                  onChange={(e) => {
                                    const copy = [...variants];
                                    copy[i].quantity = e.target.value;
                                    setVariants(copy);
                                  }}
                                />
                              </td>

                              <td className="p-3">
                                <input
                                  className="input-sm"
                                  value={v.sku}
                                  onChange={(e) => {
                                    const copy = [...variants];
                                    copy[i].sku = e.target.value;
                                    setVariants(copy);
                                  }}
                                />
                              </td>

                              <td className="p-3 text-center">
                                <Toggle
                                  value={v.isActive !== false}
                                  onChange={() => {
                                    const copy = [...variants];
                                    copy[i].isActive = !(copy[i].isActive !== false);
                                    setVariants(copy);
                                  }}
                                />
                              </td>

                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    setVariants((prev) =>
                                      prev.filter((_, idx) => idx !== i),
                                    );
                                  }}
                                  className="bg-red-600 p-2 rounded"
                                >
                                  <Trash2 size={14} className="text-white" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SAVE */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShow(false)}
                className="flex-1 py-3 rounded-lg bg-[#2a2f3a] text-white hover:bg-[#3a3f4a]"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-lg bg-gradient-to-br 
          from-[var(--primary)] to-[var(--primary-container)] text-white font-semibold"
              >
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
