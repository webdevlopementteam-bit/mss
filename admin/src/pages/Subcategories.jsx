import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import toast from "react-hot-toast";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Subcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
    imagePreview: "",
    category: "",
    isPublished: true,
  });

  // ================= FETCH =================
  const fetchSubcategories = async (pageNum = 1, searchQuery = "") => {
    try {
      const res = await API.get(
        `/subcategory?page=${pageNum}&limit=5&search=${searchQuery}`,
      );
      const data = res.data?.data || [];
      setSubcategories(data);
      setFiltered(data);
      setTotalPage(res.data?.totalPages || 1);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await API.get("/category?limit=200");
      setCategories(res.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubcategories(page, search);
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= FILTER =================
  const handleReset = () => {
    setSearch("");
    setPage(1);
    setFiltered(subcategories);
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (!form.category) {
        return toast.error("Please select a category");
      }

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("isPublished", form.isPublished);
      formData.append("category", form.category);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editId) {
        await API.put(`/subcategory/${editId}`, formData);
      } else {
        await API.post("/subcategory", formData);
      }

      setShowModal(false);
      setEditId(null);
      fetchSubcategories(page, search);
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Save failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/subcategory/${id}`);

      if (subcategories.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchSubcategories(page, search);
      }

      toast.success("Deleted");
    } catch (err) {
      console.log("DELETE ERROR:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // ================= TOGGLE =================
  const handleToggle = async (sc) => {
    await API.put(`/subcategory/${sc._id}`, {
      isPublished: !sc.isPublished,
    });
    fetchSubcategories(page, search);
  };

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({
        ...form,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  // ================= EDIT =================
  const handleEdit = (sc) => {
    setForm({
      name: sc.name,
      description: sc.description,
      image: null,
      imagePreview: `${IMG_URL}/${sc.image}`,
      category: sc.category?._id || "",
      isPublished: sc.isPublished,
    });

    setEditId(sc._id);
    setShowModal(true);
  };

  return (
    <div className="p-6 text-on-surface">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-2xl font-semibold text-white/70">Subcategory</h1>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (selected.length === 0)
                return toast.error("No items selected");

              if (!confirm("Delete selected subcategories?")) return;

              try {
                await Promise.all(
                  selected.map((id) => API.delete(`/subcategory/${id}`)),
                );

                if (subcategories.length === selected.length && page > 1) {
                  setPage((prev) => prev - 1);
                } else {
                  fetchSubcategories(page, search);
                }

                setSelected([]);
                toast.success("Deleted successfully");
              } catch (err) {
                console.log(err);
                toast.error("Delete failed");
              }
            }}
            className="px-4 py-2 bg-red-600 rounded-lg text-white/80"
          >
            Delete Selected
          </button>
          <button
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({
                name: "",
                description: "",
                image: null,
                imagePreview: "",
                category: "",
                isPublished: true,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)]"
          >
            <Plus size={16} /> Add Subcategory
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-surface-container-high p-4 rounded-xl flex gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 bg-white/10 px-3 rounded-lg border border-white/10">
          <Search size={16} />
          <input
            placeholder="Search Subcategory"
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
                      e.target.checked ? filtered.map((p) => p._id) : [],
                    )
                  }
                />
              </th>
              <th className="p-4 text-left text-white/80">Subcategory</th>
              <th className="p-4 text-left text-white/80">Description</th>
              <th className="p-4 text-left text-white/80">Category</th>
              <th className="p-4 text-center text-white/80">Published</th>
              <th className="p-4 text-right text-white/80">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((sc) => (
                <tr
                  key={sc._id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(sc._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected([...selected, sc._id]);
                        } else {
                          setSelected(selected.filter((id) => id !== sc._id));
                        }
                      }}
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={`${IMG_URL}/${sc.image}`}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10"
                    />
                    <span className="text-white">{sc.name}</span>
                  </td>

                  <td className="p-4 text-white/70 max-w-[250px] truncate">
                    {sc.description}
                  </td>

                  <td className="p-4 text-white/50">
                    {sc.category?.name || "—"}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleToggle(sc)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 ${
                          sc.isPublished ? "bg-green-500" : "bg-gray-600"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full ${
                            sc.isPublished ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </td>

                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(sc)}
                      className="p-2 bg-blue-600 rounded-lg"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => setDeleteId(sc._id)}
                      className="p-2 bg-red-600 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-white/40">
                  No subcategories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f131c] border border-white/10 rounded-2xl p-6 w-[350px] shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-2">
              Delete Subcategory
            </h2>

            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to delete this subcategory? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* pagination */}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-end z-50">
          <div className="w-[520px] bg-[#0f131c] border-l border-white/10 h-full p-6 shadow-2xl overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editId ? "Edit Subcategory" : "Add Subcategory"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-5">
              {/* NAME */}
              <div>
                <label htmlFor="Subcategory Name" className="text-white/80 text-sm">
                  Subcategory Name
                </label>
                <input
                  placeholder="Subcategory Name"
                  className="w-full p-3 rounded-lg mt-2 bg-[#1a202b] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label htmlFor="Subcategory Description" className="text-white/80 text-sm">
                  Subcategory Description
                </label>
                <textarea
                  placeholder="Description"
                  rows={3}
                  className="w-full p-3 mt-2 rounded-lg bg-[#1a202b] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* CATEGORY SELECT */}
              <div>
                <label htmlFor="Category" className="text-white/80 text-sm">
                  Category
                </label>
                <select
                  className="w-full p-3 mt-2 rounded-lg bg-[#1a202b] border border-white/10 text-white focus:outline-none focus:border-blue-500"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
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

              {/* IMAGE UPLOAD */}
              <div className="border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 transition">
                {/* PREVIEW */}
                {form.imagePreview && (
                  <img
                    src={form.imagePreview}
                    className="w-20 h-20 object-cover rounded-lg border border-white/10"
                  />
                )}

                {/* LABEL */}
                <label
                  htmlFor="subcategoryImage"
                  className="cursor-pointer text-white/60 text-sm"
                >
                  Upload Subcategory Image
                </label>

                {/* INPUT */}
                <input
                  type="file"
                  id="subcategoryImage"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* TOGGLE */}
              <div className="flex items-center justify-between">
                <span className="text-white/70">Published</span>

                <button
                  onClick={() =>
                    setForm({ ...form, isPublished: !form.isPublished })
                  }
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    form.isPublished ? "bg-green-500" : "bg-gray-600"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      form.isPublished ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg bg-[#2a2f3a] text-white hover:bg-[#3a3f4a]"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-lg bg-gradient-to-br
          from-[var(--primary)] to-[var(--primary-container)] text-white font-semibold"
              >
                Save Subcategory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subcategories;
