import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Attribute = () => {
  const [attributes, setAttributes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showmodal, setShowModal] = useState(false);
  const [editID, setEditID] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    displayName: "",
    variants: [],
    variantInput: "",
  });

  // ================= FETCH =================
  const fetchAttributes = async (pageNum = 1, searchQuery = "") => {
    try {
      const res = await API.get(
        `/attribute?page=${pageNum}&limit=5&search=${searchQuery}`,
      );
      const data = res.data?.data || [];
      setAttributes(data);
      setFiltered(data);
      setTotalPage(res.data?.totalPages || 1);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAttributes(page, search);
  }, [page]);

  // ================= FILTER =================
  const handleFilter = () => {
    setPage(1);
    fetchAttributes(1, search);
  };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    fetchAttributes(1, "");
  };

  // ================= VARIANTS =================
  const addVariant = () => {
    if (!form.variantInput.trim()) return;

    if (form.variants.includes(form.variantInput.trim())) {
      return toast.error("Already added");
    }

    setForm({
      ...form,
      variants: [...form.variants, form.variantInput.trim()],
      variantInput: "",
    });
  };

  const removeVariant = (v) => {
    setForm({
      ...form,
      variants: form.variants.filter((item) => item !== v),
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (!form.title || !form.displayName || form.variants.length === 0) {
        return toast.error("All fields required");
      }

      const payload = {
        title: form.title,
        displayName: form.displayName,
        variants: form.variants,
      };

      if (editID) {
        await API.put(`/attribute/${editID}`, payload);
      } else {
        await API.post("/attribute", payload);
      }

      setShowModal(false);
      setEditID(null);
      handleReset();
    } catch {
      toast.error("Failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/attribute/${id}`);

      // 🔥 fresh data lao (VERY IMPORTANT)
      const res = await API.get(
        `/attribute?page=${page}&limit=5&search=${search}&t=${Date.now()}`,
      );

      const data = res.data?.data || [];
      const total = res.data?.totalPages || 1;

      // 🔥 agar page empty ho gaya
      if (data.length === 0 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setAttributes(data);
        setFiltered(data);
        setTotalPage(total);
      }

      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setForm({
      title: item.title,
      displayName: item.displayName,
      variants: item.variants || [],
      variantInput: "",
    });

    setEditID(item._id);
    setShowModal(true);
  };

  return (
    <div className="p-6 text-on-surface">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-2xl font-semibold text-white/70">Attribute</h1>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (selected.length === 0)
                return toast.error("No items selected");

              if (!confirm("Delete selected attributes?")) return;

              try {
                await Promise.all(
                  selected.map((id) => API.delete(`/attribute/${id}`)),
                );

                setSelected([]);

                // 🔥 refetch
                fetchAttributes(page, search);
              } catch {
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
              setEditID(null);
              setForm({
                title: "",
                displayName: "",
                variants: [],
                variantInput: "",
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)]"
          >
            <Plus size={16} /> Add Attribute
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-surface-container-high p-4 rounded-xl flex gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 bg-white/10 px-3 rounded-lg border border-white/10">
          <Search size={16} />
          <input
            placeholder="Search Attribute"
            className="bg-transparent outline-none w-full py-2 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          onClick={handleFilter}
          className="px-6 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] rounded-lg"
        >
          Filter
        </button>

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
              <th className="p-4 text-left text-white/80">Title</th>
              <th className="p-4 text-left text-white/80">Display Name</th>
              <th className="p-4 text-left text-white/80">Variants</th>
              <th className="p-4 text-right text-white/80">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((a) => (
              <tr key={a._id} className="border-b border-white/5">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(a._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected([...selected, a._id]);
                      } else {
                        setSelected(selected.filter((id) => id !== a._id));
                      }
                    }}
                  />
                </td>
                <td className="p-4 text-white">{a.title}</td>
                <td className="p-4 text-white/70">{a.displayName}</td>
                <td className="p-4 text-white/60">
                  {a.variants?.slice(0, 3).join(", ")}
                </td>

                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => handleEdit(a)}
                    className="p-2 bg-blue-600 rounded-lg"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteId(a._id)}
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

      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f131c] border border-white/10 rounded-2xl p-6 w-[350px]">
            <h2 className="text-lg text-white mb-3">Delete Attribute</h2>

            <p className="text-white/60 mb-6">
              Are you sure you want to delete this attribute?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-white/10 text-white/80 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-red-500 text-white/80 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* MODAL */}
      {showmodal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-end z-50">
          <div className="w-[520px] bg-[#0f131c] border-l border-white/10 h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editID ? "Edit Attribute" : "Add Attribute"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="Award Name" className="text-white/80 text-sm">
                  Attribute Title
                </label>
                <input
                  placeholder="Title"
                  className="w-full p-3 mt-2 rounded-lg bg-[#1a202b] border border-white/10 text-white"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="Award Name" className="text-white/80 text-sm">
                  Attribute Display Name
                </label>
                <input
                  placeholder="Display Name"
                  className="w-full p-3 rounded-lg mt-2 bg-[#1a202b] border border-white/10 text-white"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                />
              </div>

              {/* VARIANTS CHIP UI HERE */}
              <div>
                <label htmlFor="Award Name" className="text-white/80 text-sm">
                  Add Variants
                </label>
                <input
                  placeholder="Add variant"
                  className="w-full flex-1 p-3 mt-2 bg-[#1a202b] rounded text-white"
                  value={form.variantInput}
                  onChange={(e) =>
                    setForm({ ...form, variantInput: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // ❗ form submit prevent
                      addVariant();
                    }
                  }}
                />

                {/* CHIPS */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.variants.map((v) => (
                    <div
                      key={v}
                      className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                    >
                      {v}
                      <button
                        onClick={() => removeVariant(v)}
                        className="text-white/70 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-lg bg-[#2a2f3a] text-white/80"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-lg bg-gradient-to-br 
    from-[var(--primary)] to-[var(--primary-container)]"
              >
                Save Attribute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attribute;
