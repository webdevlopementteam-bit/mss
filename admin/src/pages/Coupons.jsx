import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import toast from "react-hot-toast";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Coupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    couponName: "",
    couponCode: "",
    applyOn: "ALL",
    categories: [],
    products: [],
    discountType: "FIXED",
    discount: "",
    minAmount: "",
    validityTime: { startDate: "", endDate: "" },
    isPublished: true,
    couponImage: null,
    preview: "",
  });

  // ================= FETCH =================
  const fetchCoupons = async () => {
    try {
      const res = await API.get(
        `/coupon?page=${page}&limit=5&search=${search}`,
      );
      setCoupons(res.data.data);
      setTotalPage(res.data.totalPages);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchCategories = async () => {
    const res = await API.get(`/category`);
    setCategories(res.data.data || []);
  };

  const fetchProducts = async () => {
    const res = await API.get(`/product`);
    setProducts(res.data.data || []);
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ================= RESET =================
  const handleReset = () => {
    setSearch("");
    setPage(1);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/coupon/${id}`);

      if (coupons.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchCoupons();
      }

      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= BULK DELETE =================
  const handleBulkDelete = async () => {
    if (selected.length === 0) return toast.error("No items selected");

    if (!confirm("Delete selected coupons?")) return;

    try {
      await Promise.all(selected.map((id) => API.delete(`/coupon/${id}`)));

      setSelected([]);
      fetchCoupons();
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= TOGGLE =================
  const handleToggle = async (c) => {
    try {
      await API.put(`/coupon/${c._id}`, {
        isPublished: !c.isPublished,
      });

      setCoupons((prev) =>
        prev.map((item) =>
          item._id === c._id
            ? { ...item, isPublished: !item.isPublished }
            : item,
        ),
      );
    } catch {
      toast.error("Status update failed");
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      const fd = new FormData();

      fd.append("couponName", form.couponName);
      fd.append("couponCode", form.couponCode);
      fd.append("applyOn", form.applyOn);
      fd.append("discountType", form.discountType);
      fd.append("discount", form.discount);
      fd.append("minAmount", form.minAmount);
      fd.append("isPublished", form.isPublished);

      fd.append("validityTime[startDate]", form.validityTime.startDate);
      fd.append("validityTime[endDate]", form.validityTime.endDate);

      form.categories.forEach((id) => fd.append("categories", id));
      form.products.forEach((id) => fd.append("products", id));

      if (form.couponImage) {
        fd.append("couponImage", form.couponImage);
      }

      if (editId) {
        await API.put(`/coupon/${editId}`, fd);
      } else {
        await API.post(`/coupon`, fd);
      }

      setShowModal(false);
      setEditId(null);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleEdit = (c) => {
    setForm({
      couponName: c.couponName,
      couponCode: c.couponCode,
      applyOn: c.applyOn,
      categories: c.categories?.map((i) => i._id) || [],
      products: c.products?.map((i) => i._id) || [],
      discountType: c.discountType,
      discount: c.discount,
      minAmount: c.minAmount,
      validityTime: {
        startDate: c.validityTime.startDate?.slice(0, 10),
        endDate: c.validityTime.endDate?.slice(0, 10),
      },
      isPublished: c.isPublished,
      preview: `${IMG_URL}/${c.couponImage}`,
    });

    setEditId(c._id);
    setShowModal(true);
  };

  // ================= IMAGE =================
  const handleImage = (e) => {
    const file = e.target.files[0];
    setForm({
      ...form,
      couponImage: file,
      preview: URL.createObjectURL(file),
    });
  };

  return (
    <div className="p-6 text-on-surface">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-2xl font-semibold text-white/70">Coupon</h1>

        <div className="flex gap-3">
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-600 rounded-lg text-white/80"
          >
            Delete Selected
          </button>

          <button
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({
                couponName: "",
                couponCode: "",
                applyOn: "ALL",
                categories: [],
                products: [],
                discountType: "FIXED",
                discount: "",
                minAmount: "",
                validityTime: { startDate: "", endDate: "" },
                isPublished: true,
                couponImage: null,
                preview: "",
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)]"
          >
            <Plus size={16} /> Add Coupon
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-surface-container-high p-4 rounded-xl flex gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 bg-white/10 px-3 rounded-lg border border-white/10">
          <Search size={16} />
          <input
            placeholder="Search Coupon"
            className="bg-transparent outline-none w-full py-2 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={handleReset}
          className="px-6 py-2 border text-white border-white/50 rounded-lg"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-surface-container-high rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? coupons.map((c) => c._id) : [],
                    )
                  }
                />
              </th>
              <th className="p-4 text-left text-white/80">Coupon</th>
              <th className="p-4 text-left text-white/80">Code</th>
              <th className="p-4 text-left text-white/80">Discount</th>
              <th className="p-4 text-center text-white/80">Published</th>
              <th className="p-4 text-right text-white/80">Action</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((c) => (
              <tr
                key={c._id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(c._id)}
                    onChange={(e) =>
                      e.target.checked
                        ? setSelected([...selected, c._id])
                        : setSelected(selected.filter((i) => i !== c._id))
                    }
                  />
                </td>

                <td className="p-4 text-white/70">
                  {/* <img
                    src={`${IMG_URL}/${c.couponImage}`}
                    className="w-10 h-10 rounded-lg object-cover"
                  /> */}
                  {c.couponName}
                </td>

                <td className="p-4 text-white/70">{c.couponCode}</td>

                <td className="p-4 text-white/70">
                  {c.discountType === "PERCENTAGE"
                    ? `${c.discount}%`
                    : `₹${c.discount}`}
                </td>

                {/* TOGGLE */}
                <td className="p-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggle(c)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 ${
                        c.isPublished ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full ${
                          c.isPublished ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </td>

                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-2 bg-blue-600 rounded-lg"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteId(c._id)}
                    className="p-2 bg-red-600 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-end items-center gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-white/10 rounded text-white/80"
        >
          Prev
        </button>

        <span className="text-white/60">
          {page} / {totalPage}
        </span>

        <button
          disabled={page === totalPage}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-white/10 rounded text-white/80"
        >
          Next
        </button>
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f131c] border border-white/10 rounded-2xl p-6 w-[350px]">
            <h2 className="text-white mb-3">Delete Coupon</h2>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-white/10 rounded text-white"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-red-500 rounded text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
          <div className="w-[520px] bg-[#0f131c] border-l border-white/10 h-full p-6 overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
              <h2 className="text-white text-xl">
                {editId ? "Edit Coupon" : "Add Coupon"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* NAME */}
              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Coupon Name
                </label>
              <input
                placeholder="Coupon Name"
                className="w-full p-3 bg-[#1a202b] text-white mt-2 rounded-lg"
                value={form.couponName}
                onChange={(e) =>
                  setForm({ ...form, couponName: e.target.value })
                }
              />
              </div>

              {/* CODE */}
              <div>
                <label htmlFor="Brand Name" className="text-white/80 mt-2 text-sm">
                  Coupon Code
                </label>
              <input
                placeholder="Coupon Code"
                className="w-full p-3 bg-[#1a202b] text-white rounded-lg"
                value={form.couponCode}
                onChange={(e) =>
                  setForm({ ...form, couponCode: e.target.value })
                }
              />
              </div>

              {/* APPLY TYPE */}
             <div>
               <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Apply On
                </label>
              <select
                className="w-full p-3 bg-[#1a202b] text-white rounded-lg mt-2 border border-white/10"
                value={form.applyOn}
                onChange={(e) => setForm({ ...form, applyOn: e.target.value })}
              >
                <option className="bg-[#1a202b] text-white/80" value="ALL">
                  ALL
                </option>
                <option className="bg-[#1a202b] text-white/80" value="CATEGORY">
                  CATEGORY
                </option>
                <option className="bg-[#1a202b] text-white/80" value="PRODUCT">
                  PRODUCT
                </option>
              </select>
             </div>

              {/* CATEGORY */}
              
              {form.applyOn === "CATEGORY" && (
                <div className="bg-[#1a202b] p-3 rounded-lg max-h-40 overflow-y-auto border border-white/10">
                  {categories.map((c) => (
                    <label
                      key={c._id}
                      className="flex items-center gap-2 text-white mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={form.categories.includes(c._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({
                              ...form,
                              categories: [...form.categories, c._id],
                            });
                          } else {
                            setForm({
                              ...form,
                              categories: form.categories.filter(
                                (id) => id !== c._id,
                              ),
                            });
                          }
                        }}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              )}

              {/* PRODUCT */}
              {form.applyOn === "PRODUCT" && (
                <div className="bg-[#1a202b] p-3 rounded-lg max-h-40 overflow-y-auto border border-white/10">
                  {products.map((p) => (
                    <label
                      key={p._id}
                      className="flex items-center gap-2 text-white mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={form.products.includes(p._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm({
                              ...form,
                              products: [...form.products, p._id],
                            });
                          } else {
                            setForm({
                              ...form,
                              products: form.products.filter(
                                (id) => id !== p._id,
                              ),
                            });
                          }
                        }}
                      />
                      {p.title}
                    </label>
                  ))}
                </div>
              )}

              {/* DISCOUNT */}
             <div>
              
              <div className="flex gap-3">
                <div className="flex flex-col w-[50%]">
                   <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Discount Type
                </label>
                <select
                  className="w-full p-3 bg-[#1a202b] mt-2 text-white rounded-lg"
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({ ...form, discountType: e.target.value })
                  }
                >
                  <option value="FIXED" className="text-white/80">
                    Fixed
                  </option>
                  <option value="PERCENTAGE" className="text-white/80">
                    Percentage
                  </option>
                </select>
                </div>
                
                <div className="flex flex-col w-[50%]">
                  <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Discount Amount
                </label>
                <input
                  placeholder="Discount"
                  className="w-full p-3 bg-[#1a202b] mt-2 text-white rounded-lg"
                  value={form.discount}
                  onChange={(e) =>
                    setForm({ ...form, discount: e.target.value })
                  }
                />
                </div>
              </div>
             </div>

              {/* MIN AMOUNT */}
              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Min Amount
                </label>
              <input
                type="number"
                placeholder="Minimum Order Amount"
                className="w-full p-3 mt-2 bg-[#1a202b] text-white rounded-lg"
                value={form.minAmount}
                onChange={(e) =>
                  setForm({ ...form, minAmount: e.target.value })
                }
              />
              </div>

              {/* DATES */}
              <div className="flex gap-3">
                <div className="flex flex-col w-[50%]">
                  <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 mt-2 bg-[#1a202b] text-white rounded-lg"
                  value={form.validityTime.startDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      validityTime: {
                        ...form.validityTime,
                        startDate: e.target.value,
                      },
                    })
                  }
                />
                </div>

               <div className="flex flex-col w-[50%]">
                 <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 mt-2 bg-[#1a202b] text-white rounded-lg"
                  value={form.validityTime.endDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      validityTime: {
                        ...form.validityTime,
                        endDate: e.target.value,
                      },
                    })
                  }
                />
               </div>
              </div>

              {/* SAVE */}
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 rounded-lg text-white"
              >
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupon;
