import { useState } from "react";
import API from "../api/axios";
import { useEffect } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Award = () => {
  const [awards, setAwards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showmodal, setShowModal] = useState(false);
  const [editID, setEditID] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    image: null,
    imagePreview: "",
  });

  const fetchAward = async (pageNum = 1, searchQuery = "") => {
    try {
      const res = await API.get(
        `/award?page=${pageNum}&limit=5&search=${searchQuery}`,
      );
      const data = res.data?.data || [];
      setAwards(data);
      setFiltered(data);
      setTotalPage(res.data?.totalPages || 1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAward(page, search);
  }, [page, search]);

  // const handleFilter = () => {
  //   if (!search.trim()) {
  //     setFiltered(awards);
  //     return;
  //   }

  //   const filteredData = awards.filter((c) =>
  //     c.name.toLowerCase().includes(search.toLowerCase()),
  //   );
  //   setPage(1);
  //   setFiltered(filteredData);
  // };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    setFiltered(awards);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editID) {
        await API.put(`/award/${editID}`, formData);
      } else {
        await API.post("/award", formData);
      }

      setShowModal(false);
      setEditID(null);
      fetchAward(page, search);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/award/${id}`);

      // 🔥 fresh fetch
      const res = await API.get(
        `/award?page=${page}&limit=5&search=${search}&t=${Date.now()}`,
      );

      const data = res.data?.data || [];
      const total = res.data?.totalPages || 1;

      // 🔥 page empty ho gaya to previous page
      if (data.length === 0 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        setAwards(data);
        setFiltered(data);
        setTotalPage(total);
      }

      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
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

  const handleEdit = (award) => {
    setForm({
      name: award.name,
      image: null,
      imagePreview: `${IMG_URL}/${award.image}`,
    });

    setEditID(award._id);
    setShowModal(true);
  };

  return (
    <>
      <div className="p-6 text-on-surface">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 mt-10">
          <h1 className="text-2xl font-semibold text-white/70">Award</h1>

          <div className="flex gap-3">
            <button
              onClick={async () => {
                if (selected.length === 0)
                  return toast.error("No items selected");

                if (!confirm("Delete selected awards?")) return;

                try {
                  await Promise.all(
                    selected.map((id) => API.delete(`/award/${id}`)),
                  );

                  toast.success("Deleted successfully");

                  // ✅ instant UI update
                  setAwards((prev) =>
                    prev.filter((a) => !selected.includes(a._id)),
                  );
                  setFiltered((prev) =>
                    prev.filter((a) => !selected.includes(a._id)),
                  );

                  setSelected([]);
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
                setEditID(null);
                setForm({
                  name: "",
                  image: null,
                  imagePreview: "",
                });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)]"
            >
              <Plus size={16} /> Add Award
            </button>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-surface-container-high p-4 rounded-xl flex gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1 bg-white/10 px-3 rounded-lg border border-white/10">
            <Search size={16} />
            <input
              placeholder="Search Award"
              className="bg-transparent outline-none w-full py-2 text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* <button
            onClick={handleFilter}
            className="px-6 py-2 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] rounded-lg"
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
                <th className="p-4 text-left text-white/80">Image</th>
                <th className="p-4 text-left text-white/80">Award</th>
                <th className="p-4 text-right text-white/80">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((a) => (
                  <tr
                    key={a._id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
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
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={`${IMG_URL}/${a.image}`}
                        className="w-10 h-10 rounded-lg object-cover border border-white/10"
                      />
                    </td>

                    <td className="p-4 text-white/70 max-w-[250px] truncate">
                      {a.name}
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-white/40">
                    No awards found
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
                Delete Award
              </h2>

              <p className="text-sm text-white/60 mb-6">
                Are you sure you want to delete this award? This action cannot
                be undone.
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
            <div className="w-[520px] bg-[#0f131c] border-l border-white/10 h-full p-6 shadow-2xl overflow-y-auto">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editID ? "Edit Award" : "Add Award"}
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
                  <label htmlFor="Award Name" className="text-white/80 text-sm">
                    Award Name
                  </label>
                  <input
                    placeholder="Award Name"
                    className="w-full p-3 rounded-lg bg-[#1a202b] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 mt-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {/* IMAGE UPLOAD (🔥 FIXED UI) */}
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
                    htmlFor="awardImage"
                    className="cursor-pointer text-white/60 text-sm"
                  >
                    Upload Award Image
                  </label>

                  {/* INPUT */}
                  <input
                    type="file"
                    id="awardImage"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
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
                  Save Award
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Award;
