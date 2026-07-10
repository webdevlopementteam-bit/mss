import { useEffect, useState } from "react";
import API from "../api/axios";
import { Plus, Trash2, Pencil, Search, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function Pincode() {
  const [pincodes, setPincodes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    pincode: "",
    branchName: "",
  });

  // ================= FETCH =================
  const fetchPincode = async (pageNum = 1, searchQuery = "") => {
    try {
      const res = await API.get(
        `/pincode?page=${pageNum}&limit=5&search=${searchQuery}`,
      );

      const data = res.data?.data || [];

      setPincodes(data);
      setFiltered(data);
      setTotalPage(res.data?.totalPage || 1);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPincode(page, search);
  }, [page,search]);

  // ================= FILTER =================
  // const handleFilter = () => {
  //   setPage(1);
  //   fetchPincode(1, search);
  // };

  const handleReset = () => {
    setSearch("");
    setPage(1);
    fetchPincode(1, "");
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      // 🔥 VALIDATION
      if (!/^\d{6}$/.test(form.pincode)) {
        return toast.error("Pincode must be exactly 6 digits");
      }

      if (!form.branchName.trim()) {
        return toast.error("Branch name required");
      }

      if (editId) {
        await API.put(`/pincode/${editId}`, form);
        toast.success("Updated successfully");
      } else {
        await API.post("/pincode", form);
        toast.success("Created successfully");
      }

      setShowModal(false);
      setEditId(null);
      setForm({ pincode: "", branchName: "" });

      fetchPincode(page, search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await API.delete(`/pincode/${id}`);
      toast.success("Deleted successfully");
      setDeleteId(null);
      fetchPincode(page, search);
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (p) => {
    setForm({
      pincode: p.pincode,
      branchName: p.branchName,
    });

    setEditId(p._id);
    setShowModal(true);
  };

  // ================= BULK =================
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/pincode/bulk", formData);
      toast.success("Bulk upload success");
      fetchPincode(page, search);
    } catch {
      toast.error("Upload failed");
    }
  };

  return (
    <div className="p-6 text-on-surface">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-2xl font-semibold text-white/70">Pincode</h1>

        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (selected.length === 0)
                return toast.error("No items selected");

              if (!confirm("Delete selected pincodes?")) return;

              try {
                await Promise.all(
                  selected.map((id) => API.delete(`/pincode/${id}`)),
                );

                toast.success("Deleted successfully");
                setSelected([]);
                fetchPincode(page, search);
              } catch {
                toast.error("Delete failed");
              }
            }}
            className="px-4 py-2 bg-red-600 rounded-lg text-white/80"
          >
            Delete Selected
          </button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 cursor-pointer hover:bg-white">
            <Upload size={16} /> Upload CSV
            <input type="file" accept=".csv" hidden onChange={handleBulkUpload} />
          </label>

          <button
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setForm({ pincode: "", branchName: "" });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)]"
          >
            <Plus size={16} /> Add Pincode
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-surface-container-high p-4 rounded-xl flex gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 bg-white/10 px-3 rounded-lg border border-white/10">
          <Search size={16} />
          <input
            placeholder="Search Pincode"
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
              <th className="p-4 text-white/80 text-left">Pincode</th>
              <th className="p-4 text-white/80 text-left">Branch</th>
              <th className="p-4 text-white/80 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(p._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected([...selected, p._id]);
                        } else {
                          setSelected(selected.filter((id) => id !== p._id));
                        }
                      }}
                    />
                  </td>
                  <td className="p-4 text-white">{p.pincode}</td>
                  <td className="p-4 text-white/70">{p.branchName}</td>

                  <td className="p-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() => setDeleteId(p._id)}
                      className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-6 text-white/40">
                  No pincodes found
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

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f131c] border border-white/10 rounded-xl p-6 w-[350px]">
            <p className="text-white mb-4">Delete this pincode?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-white/10 rounded text-white/80"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-red-600 rounded text-white/80"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-end z-50">
          <div className="w-[500px] bg-[#0f131c] border-l border-white/10 h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white">
                {editId ? "Edit Pincode" : "Add Pincode"}
              </h2>

              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">Pincode</label>
              <input
                placeholder="eg. 126112"
                className="w-full p-3 rounded-lg mt-2 bg-[#1a202b] border border-white/10 text-white"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              </div>

              <div>
                <label htmlFor="Brand Name" className="text-white/80 text-sm">Brand Name</label>
              <input
                placeholder="eg. pitampura"
                className="w-full p-3 rounded-lg mt-2 bg-[#1a202b] border border-white/10 text-white"
                value={form.branchName}
                onChange={(e) =>
                  setForm({ ...form, branchName: e.target.value })
                }
              />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-[#2a2f3a] rounded-lg text-white/80"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-container)] rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
