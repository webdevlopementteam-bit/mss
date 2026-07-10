import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import toast from "react-hot-toast";

const Rating = () => {
  const [ratings, setRatings] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    customer: "",
    product: "",
    rating: "",
    comment: "",
    isPublished: true,
  });

  // ================= FETCH =================
  const fetchRatings = async () => {
    const res = await API.get(`/rating?page=${page}&limit=5`);
    setRatings(res.data.data);
    setTotalPage(res.data.totalPages);
  };

  const fetchProducts = async () => {
    const res = await API.get(`/product`);
    setProducts(res.data.data || []);
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/auth/users");

      const usersData = res.data.users || res.data.data || res.data;

      // ⭐ ADMIN REMOVE
      const filtered = usersData.filter((u) => u.role !== "admin");

      setUsers(filtered);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [page]);

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/rating/${id}`);

      if (ratings.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchRatings();
      }

      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= BULK DELETE =================
  const handleBulkDelete = async () => {
    if (selected.length === 0) return toast.error("No items selected");

    if (!confirm("Delete selected ratings?")) return;

    try {
      await Promise.all(selected.map((id) => API.delete(`/rating/${id}`)));
      setSelected([]);
      fetchRatings();
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= TOGGLE =================
  const handleToggle = async (r) => {
    try {
      await API.put(`/rating/${r._id}`, {
        isPublished: !r.isPublished,
      });

      setRatings((prev) =>
        prev.map((item) =>
          item._id === r._id
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
      if (editId) {
        await API.put(`/rating/${editId}`, form);
      } else {
        await API.post(`/rating`, form);
      }

      setShowModal(false);
      setEditId(null);
      fetchRatings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  // ================= EDIT =================
  const handleEdit = (r) => {
    setForm({
      customer: r.customer?._id,
      product: r.product?._id,
      rating: r.rating,
      comment: r.comment || "",
      isPublished: r.isPublished,
    });

    setEditId(r._id);
    setShowModal(true);
  };

  return (
    <div className="p-6 text-on-surface">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-2xl font-semibold text-white/70">Rating</h1>

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
                customer: "",
                product: "",
                rating: "",
                comment: "",
                isPublished: true,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)]"
          >
            <Plus size={16} /> Add Rating
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-surface-container-high rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? ratings.map((r) => r._id) : [],
                    )
                  }
                />
              </th>
              <th className="p-4 text-left text-white/80">Customer</th>
              <th className="p-4 text-left text-white/80">Product</th>
              <th className="p-4 text-left text-white/80">Rating</th>
              <th className="p-4 text-center text-white/80">Published</th>
              <th className="p-4 text-right text-white/80">Action</th>
            </tr>
          </thead>

          <tbody>
            {ratings.map((r) => (
              <tr key={r._id} className="border-b border-white/5">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(r._id)}
                    onChange={(e) =>
                      e.target.checked
                        ? setSelected([...selected, r._id])
                        : setSelected(selected.filter((i) => i !== r._id))
                    }
                  />
                </td>

                <td className="p-4 text-white/70">{r.customer?.name}</td>

                <td className="p-4 text-white/70"> {r.product?.title || "No Product"}</td>

                <td className="p-4 text-yellow-400">⭐ {r.rating}</td>

                <td className="p-4">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggle(r)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 ${
                        r.isPublished ? "bg-green-500" : "bg-gray-600"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full ${
                          r.isPublished ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div>
                </td>

                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(r)}
                    className="p-2 bg-blue-600 rounded-lg"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteId(r._id)}
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
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => setPage(page - 1)}>Prev</button>
        {page} / {totalPage}
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f131c] p-6 rounded-xl">
            <h2 className="text-white mb-4">Delete Rating?</h2>

            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}>Cancel</button>
              <button
                onClick={async () => {
                  await handleDelete(deleteId);
                  setDeleteId(null);
                }}
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
          <div className="w-[500px] bg-[#0f131c] p-6">
            <div className="flex justify-between mb-5">
              <h2 className="text-white">
                {editId ? "Edit Rating" : "Add Rating"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Customer
                </label>
                <select
                  className="w-full p-3 mt-2 bg-[#1a202b] text-white rounded"
                  value={form.customer}
                  onChange={(e) =>
                    setForm({ ...form, customer: e.target.value })
                  }
                >
                  <option value="" className="text-white">
                    Select Customer
                  </option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id} className="text-white">
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Select Product
                </label>
                <select
                  className="w-full p-3 mt-2 bg-[#1a202b] text-white rounded"
                  value={form.product}
                  onChange={(e) =>
                    setForm({ ...form, product: e.target.value })
                  }
                >
                  <option value="" className="text-white">
                    Select Product
                  </option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} className="text-white">
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Rating
                </label>
                <div className="flex gap-2 mt-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setForm({ ...form, rating: star })}
                      className={`cursor-pointer ${
                        form.rating >= star
                          ? "text-yellow-400"
                          : "text-gray-500"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Comment
                </label>
                <textarea
                  placeholder="Comment"
                  className="w-full p-3 mt-2 bg-[#1a202b] text-white rounded"
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-lg bg-gradient-to-br 
    from-[var(--primary)] to-[var(--primary-container) text-white font-semibold"
              >
                Save Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rating;
