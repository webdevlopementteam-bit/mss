import { useEffect, useState } from "react";
import API from "../api/axios";
import { Trash2, Ban, Eye } from "lucide-react";
import toast from "react-hot-toast";

const LIMIT = 10;

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [viewUser, setViewUser] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [authProvider, setAuthProvider] = useState("");
  const [profileCompleted, setProfileCompleted] = useState("");
  const [emailVerified, setEmailVerified] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async () => {
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      if (authProvider) params.authProvider = authProvider;
      if (profileCompleted) params.profileCompleted = profileCompleted;
      if (emailVerified) params.emailVerified = emailVerified;

      const res = await API.get("/auth/users", { params });

      setUsers(res.data.data.users);
      setTotalPages(res.data.data.totalPages);
      setTotalUsers(res.data.data.totalUsers);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to load customers");
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, authProvider, profileCompleted, emailVerified, debouncedSearch]);

  // 🔴 DELETE USER
  const handleDelete = async (id) => {
    try {
      await API.delete(`/auth/user/${id}`);

      toast.success("User deleted successfully");
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  // 🔵 VIEW FULL PROFILE
  const handleView = async (id) => {
    try {
      const res = await API.get(`/auth/user/${id}`);
      setViewUser(res.data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load user details");
    }
  };

  // 🟡 TOGGLE ACTIVE / DISABLE
  const toggleStatus = async (id, currentStatus) => {
    try {
      await API.put(`/auth/user-toggle/${id}`);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isActive: !currentStatus } : u,
        ),
      );

      if (currentStatus) {
        toast.success("Account is disabled");
      } else {
        toast.success("Account is enabled");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-6 mt-10">
        Customers
      </h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm placeholder:text-white/40 outline-none min-w-[220px]"
        />

        <select
          value={authProvider}
          onChange={(e) => { setAuthProvider(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm outline-none"
        >
          <option value="">All Providers</option>
          <option value="google">Google</option>
          <option value="email">Email</option>
        </select>

        <select
          value={profileCompleted}
          onChange={(e) => { setProfileCompleted(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm outline-none"
        >
          <option value="">All Profiles</option>
          <option value="true">Profile Completed</option>
          <option value="false">Profile Incomplete</option>
        </select>

        <select
          value={emailVerified}
          onChange={(e) => { setEmailVerified(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg bg-[#0f172a] border border-white/10 text-white text-sm outline-none"
        >
          <option value="">All Verification</option>
          <option value="true">Email Verified</option>
          <option value="false">Email Unverified</option>
        </select>
      </div>

      <div className="rounded-2xl bg-[#0f172a] border border-white/5 overflow-hidden">
        {/* HEADER */}
        <div className="grid grid-cols-[1fr_2fr_2fr_1.4fr_1fr_1fr_1fr_1fr] px-6 py-4 text-sm text-white/80 border-b border-white/10">
          <p className="text-white/70">ID</p>
          <p className="text-white/70">Name</p>
          <p className="text-white/70">Email</p>
          <p className="text-white/70">Mobile</p>
          <p className="text-white/70">Provider</p>
          <p className="text-white/70">Profile</p>
          <p className="text-white/70">Status</p>
          <p className="text-white/70 text-right">Actions</p>
        </div>

        {/* ROWS */}
        {users.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No customers found
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-[1fr_2fr_2fr_1.4fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center border-b border-white/5 hover:bg-white/5 transition"
            >
              {/* ID */}
              <p className="text-gray-300">{user._id.slice(-4)}</p>

              {/* NAME */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-medium">
                  {user.name?.[0]?.toUpperCase()}
                </div>

                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(user.createdAt).toDateString()}
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              <p className="text-gray-300 truncate">{user.email}</p>

              {/* MOBILE */}
              <div className="flex flex-col gap-1">
                <p className="text-gray-300">{user.mobile || "—"}</p>
                {user.mobile && (
                  <span
                    className={`px-2 py-0.5 text-[11px] rounded-full w-fit ${
                      user.mobileVerified
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {user.mobileVerified ? "Verified" : "Unverified"}
                  </span>
                )}
              </div>

              {/* PROVIDER */}
              <span
                className={`px-3 py-1 text-xs rounded-full w-fit capitalize ${
                  user.authProvider === "google"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-purple-500/20 text-purple-400"
                }`}
              >
                {user.authProvider}
              </span>

              {/* PROFILE / VERIFIED */}
              <div className="flex flex-col gap-1">
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full w-fit ${
                    user.profileCompleted
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {user.profileCompleted ? "Profile Complete" : "Incomplete"}
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] rounded-full w-fit ${
                    user.emailVerified
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {user.emailVerified ? "Verified" : "Unverified"}
                </span>
              </div>

              {/* STATUS */}
              <span
                className={`px-3 py-1 text-xs rounded-full w-fit ${
                  user.isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {user.isActive ? "Active" : "Disabled"}
              </span>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                {/* VIEW */}
                <button
                  onClick={() => handleView(user._id)}
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-500/60 text-blue-400"
                >
                  <Eye size={16} />
                </button>

                {/* DISABLE */}
                <button
                  onClick={() => toggleStatus(user._id, user.isActive)}
                  className="p-2 rounded-lg bg-yellow-500 hover:bg-yellow-500/60 text-yellow-400"
                >
                  <Ban size={16} />
                </button>

                <button
                  onClick={() => setDeleteId(user._id)}
                  className="p-2 rounded-lg bg-red-500 hover:bg-red-500/60 text-red-400"
                >
                  <Trash2 size={16} />
                </button>
                {deleteId && (
                  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-[350px] shadow-xl">
                      <h2 className="text-lg font-semibold text-white mb-2">
                        Delete User
                      </h2>

                      <p className="text-sm text-white/60 mb-6">
                        Are you sure you want to delete this user? This action
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
                          onClick={() => handleDelete(deleteId)}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4 text-sm text-white/70">
        <p>{totalUsers} total customers</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-white/10 disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg bg-[#0f172a] border border-white/10 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* VIEW PROFILE MODAL */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 w-[440px] max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Customer Profile</h2>
              <button
                onClick={() => setViewUser(null)}
                className="text-white/50 hover:text-white text-sm"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ["Name", viewUser.name],
                ["Email", viewUser.email],
                ["Mobile", viewUser.mobile],
                ["Mobile Verified", viewUser.mobile ? (viewUser.mobileVerified ? "Yes" : "No") : "—"],
                ["Phone", viewUser.phone],
                ["Organisation", viewUser.organisation],
                ["Address", viewUser.address],
                ["City", viewUser.city],
                ["State", viewUser.state],
                ["PIN Code", viewUser.zip],
                ["Provider", viewUser.authProvider],
                ["Email Verified", viewUser.emailVerified ? "Yes" : "No"],
                ["Profile Completed", viewUser.profileCompleted ? "Yes" : "No"],
                ["Status", viewUser.isActive ? "Active" : "Disabled"],
                ["Registered", viewUser.createdAt ? new Date(viewUser.createdAt).toDateString() : "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-white/40 text-xs uppercase tracking-wide">{label}</p>
                  <p className="text-white">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
