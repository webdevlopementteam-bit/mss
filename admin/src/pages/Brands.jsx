import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import toast from "react-hot-toast";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
    imagePreview: "",
    isPublished: true,
  });

  // ================= FETCH =================
  const fetchBrands = async (pageNum = 1, searchQuery = "") => {
    try {
      const res = await API.get(
        `/brand?page=${pageNum}&limit=5&search=${searchQuery}&t=${Date.now()}`,
      );

      const data = res.data?.data || [];

      setBrands(data);
      setFiltered(data);
     setTotalPage(res.data?.totalPages || 1);
    } catch (err) {
      console.log(err);
    }
  };

   useEffect(() => {
    fetchBrands(page, search);
  }, [page,search]);

  // ================= FILTER =================
  // const handleFilter = () => {
  //   setPage(1);
  //   fetchBrands(1, search);
  // };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    fetchBrands(1, "");
  };

  // ================= CREATE =================
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("isPublished", form.isPublished);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editId) {
        // 🔥 UPDATE
        await API.put(`/brand/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // 🔥 CREATE
        await API.post("/brand", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setShowModal(false);
      setEditId(null);

      setForm({
        name: "",
        description: "",
        image: null,
        isPublished: true,
      });

      fetchBrands(page, search);
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggle = async (brand) => {
    try {
      await API.put(`/brand/${brand._id}`, {
        isPublished: !brand.isPublished,
      });

      fetchBrands();
    } catch (err) {
      console.log(err);
    }
  };
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
  const handleEdit = (brand) => {
    setForm({
      name: brand.name,
      description: brand.description,
      image: null,
      imagePreview: `${IMG_URL}/${brand.image}`, // 🔥 IMPORTANT
      isPublished: brand.isPublished,
    });

    setEditId(brand._id);
    setShowModal(true);
  };
  // ================= DELETE =================
  const handleDelete = async (id) => {
  try {
    await API.delete(`/brand/${id}`);

    // 🔥 IMPORTANT: fresh fetch
    const newPage = page;

    const res = await API.get(
      `/brand?page=${newPage}&limit=5&search=${search}&t=${Date.now()}`
    );

    const data = res.data?.data || [];
    const total = res.data?.totalPages || 1;

    // 🔥 if current page empty → go back
    if (data.length === 0 && newPage > 1) {
      setPage(newPage - 1);
    } else {
      setBrands(data);
      setFiltered(data);
      setTotalPage(total);
    }

    toast.success("Deleted");
  } catch {
    toast.error("Delete failed");
  }
};

  return (
    <div className="p-6 text-on-surface">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-2xl font-semibold text-white/70">Brand</h1>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (selected.length === 0)
                return toast.error("No items selected");

              if (!confirm("Delete selected brands?")) return;

              try {
                await Promise.all(
                  selected.map((id) => API.delete(`/brand/${id}`)),
                );

                toast.success("Deleted successfully");

                setSelected([]);
                fetchBrands(page, search); // 🔥 THIS IS IMPORTANT
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
              setEditId(null); // 🔥 ye missing tha
              setForm({
                name: "",
                description: "",
                image: null,
                imagePreview: "",
                isPublished: true,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br 
      from-[var(--primary)] to-[var(--primary-container)] transition"
          >
            <Plus size={16} /> Add Brand
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-surface-container-high p-4 rounded-xl flex gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 bg-surface-container-highest px-3 rounded-lg border-[1px] border-white/60 bg-white/10">
          <Search size={16} />
          <input
            placeholder="Search Brand"
            className="bg-transparent outline-none w-full py-2 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* <button
          onClick={handleFilter}
          className="px-6 py-2 bg-gradient-to-br 
      from-[var(--primary)] to-[var(--primary-container)] rounded-lg font-semibold"
        >
          Filter
        </button> */}

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
          {/* HEADER */}
          <thead className="text-white/70 border-b border-white/10">
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
              <th className="p-4 text-left text-white/80">Brand</th>
              <th className="p-4 text-left text-white/80">Description</th>
              <th className="p-4 text-center text-white/80">Published</th>
              <th className="p-4 text-right text-white/80">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {Array.isArray(filtered) && filtered.length > 0 ? (
              filtered.map((b) => (
                <tr
                  key={b._id}
                  className="border-b border-white/5 hover:bg-white/5 transition-all"
                >
                  {/* BRAND */}
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(b._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected([...selected, b._id]);
                        } else {
                          setSelected(selected.filter((id) => id !== b._id));
                        }
                      }}
                    />
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={`${IMG_URL}/${b.image}`}
                      onError={(e) => (e.target.src = "/no-image.png")}
                      className="w-10 h-10 rounded-lg object-cover border border-white/10"
                    />
                    <span className="font-medium text-white">{b.name}</span>
                  </td>

                  {/* DESCRIPTION */}
                  <td className="p-4 text-white/70 max-w-[250px] truncate">
                    {b.description}
                  </td>

                  {/* STATUS */}
                  <td className="p-4">
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => handleToggle(b)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                          b.isPublished ? "bg-green-500" : "bg-gray-600"
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                            b.isPublished ? "translate-x-6" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                    >
                      <Pencil size={14} className="text-white" />
                    </button>

                    <button
                      onClick={() => setDeleteId(b._id)}
                      className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                    {deleteId && (
                      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-[#0f131c] border border-white/10 rounded-2xl p-6 w-[350px] shadow-xl">
                          <h2 className="text-lg font-semibold text-white mb-2">
                            Delete Brand
                          </h2>

                          <p className="text-sm text-white/60 mb-6">
                            Are you sure you want to delete this brand? This
                            action cannot be undone.
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-white/40">
                  No brands found
                </td>
              </tr>
            )}
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

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-end z-50">
          <div className="w-[520px] bg-[#0f131c] border-l border-white/10 h-full p-6 shadow-2xl">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editId ? "Edit Brand" : "Add Brand"}
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
              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Brand Name
                </label>
                <input
                  placeholder="eg. VLCC"
                  className="w-full p-3 rounded-lg bg-[#1a202b] mt-2 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">
                  Brand Description
                </label>
                <textarea
                  placeholder="Description"
                  className="w-full p-3 rounded-lg mt-2 bg-[#1a202b] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* IMAGE UPLOAD */}
              <div className="border border-dashed border-white/20 rounded-lg p-4 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-400 transition">
                {/* IMAGE PREVIEW */}
                {form.imagePreview && (
                  <img
                    src={form.imagePreview}
                    className="w-20 h-20 object-cover rounded-lg border border-white/10"
                  />
                )}

                {/* LABEL */}
                <label
                  htmlFor="brandImage"
                  className="cursor-pointer text-white/60 text-sm"
                >
                  Upload Brand Image
                </label>

                {/* INPUT */}
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  id="brandImage"
                  onChange={(e) => handleImageChange(e)}
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
                Save Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
