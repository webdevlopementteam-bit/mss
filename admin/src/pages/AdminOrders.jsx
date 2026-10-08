import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Clock, Truck, CheckCircle2, XCircle, ChevronRight, RefreshCw } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";
import OrderStatusBadge from "../components/OrderStatusBadge";
import { STATUS_LABELS } from "../utils/orderStatus";

const PAGE_SIZE = 15;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/admin/all");

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const counts = useMemo(() => {
    const c = { all: orders.length };
    orders.forEach((o) => {
      c[o.orderStatus] = (c[o.orderStatus] || 0) + 1;
    });
    return c;
  }, [orders]);

  const revenue = useMemo(
    () => orders.filter((o) => o.orderStatus !== "cancelled").reduce((s, o) => s + Number(o.totalAmount || 0), 0),
    [orders]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && o.orderStatus !== filter) return false;
      if (!q) return true;
      return [o._id, o.customerInfo?.fullName, o.customerInfo?.phone, o.customerInfo?.email, o.trackingId]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [orders, query, filter]);

  useEffect(() => setPage(1), [query, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const inTransit = (counts.shipped || 0) + (counts.out_for_delivery || 0);
  const awaiting = (counts.pending || 0) + (counts.confirmed || 0) + (counts.processing || 0) + (counts.packed || 0);

  const STATS = [
    { label: "Total Orders", value: counts.all || 0, sub: `${inr(revenue)} revenue`, icon: ShoppingBag, tone: "text-[var(--primary)] bg-[var(--primary-soft)]" },
    { label: "To Process", value: awaiting, sub: `${counts.pending || 0} pending`, icon: Clock, tone: "text-amber-500 bg-amber-500/10" },
    { label: "In Transit", value: inTransit, sub: "Shipped & out for delivery", icon: Truck, tone: "text-blue-500 bg-blue-500/10" },
    { label: "Delivered", value: counts.delivered || 0, sub: "Completed orders", icon: CheckCircle2, tone: "text-emerald-500 bg-emerald-500/10" },
    { label: "Cancelled", value: counts.cancelled || 0, sub: "Not fulfilled", icon: XCircle, tone: "text-rose-500 bg-rose-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)]">Orders</h1>
          <p className="text-sm text-[var(--text-3)] mt-0.5">Track, process and manage every customer order.</p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS.map(({ label, value, sub, icon, tone }) => {
          const StatIcon = icon;
          return (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[var(--text-2)]">{label}</p>
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tone}`}>
                <StatIcon size={16} />
              </span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--text)]">{value}</p>
            <p className="mt-0.5 text-xs text-[var(--text-3)] truncate">{sub}</p>
          </div>
          );
        })}
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] space-y-4">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order ID, customer, phone or AWB…"
              className="w-full h-10 pl-10 pr-3 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-sm text-[var(--text)]"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 inline-flex items-center gap-2 h-8 px-3 rounded-lg text-[13px] font-medium transition ${
                    active
                      ? "bg-[var(--text)] text-[var(--surface)]"
                      : "text-[var(--text-2)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                  }`}
                >
                  {f.label}
                  <span
                    className={`min-w-[20px] h-5 px-1.5 rounded-md text-[11px] font-semibold flex items-center justify-center ${
                      active ? "bg-[color-mix(in_srgb,var(--surface)_22%,transparent)] text-[var(--surface)]" : "bg-[var(--surface-3)] text-[var(--text-3)]"
                    }`}
                  >
                    {counts[f.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-3.5 rounded bg-[var(--surface-3)] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <ShoppingBag size={28} className="mx-auto text-[var(--text-3)]" />
                    <p className="mt-2 font-medium text-[var(--text-2)]">No orders found</p>
                    <p className="text-xs text-[var(--text-3)]">Try a different search or status filter.</p>
                  </td>
                </tr>
              ) : (
                pageRows.map((order) => {
                  const itemsCount = (order.orderItems || []).reduce((s, it) => s + Number(it.quantity || 0), 0);
                  return (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="group border-b border-[var(--border)] last:border-0 hover:bg-[var(--hover)] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-[13px] font-semibold text-[var(--text)]">#{order._id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs text-[var(--text-3)]">
                          {fmtDate(order.createdAt)} · {fmtTime(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 shrink-0 rounded-full bg-[var(--surface-3)] flex items-center justify-center text-xs font-bold text-[var(--text-2)]">
                            {(order.customerInfo?.fullName || "?").charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--text)] truncate max-w-[180px]">{order.customerInfo?.fullName || "—"}</p>
                            <p className="text-xs text-[var(--text-3)]">{order.customerInfo?.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[var(--text-2)]">
                        {itemsCount} {itemsCount === 1 ? "item" : "items"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <OrderStatusBadge type="payment" status={String(order.paymentStatus || "").toLowerCase()} label={order.paymentStatus || "—"} />
                          <span className="text-[11px] uppercase tracking-wide text-[var(--text-3)]">{order.paymentMethod || ""}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-[var(--text)] whitespace-nowrap">{inr(order.totalAmount)}</td>
                      <td className="px-4 py-3.5">
                        <OrderStatusBadge status={order.orderStatus} label={STATUS_LABELS[order.orderStatus]} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--primary)] opacity-70 group-hover:opacity-100">
                          View <ChevronRight size={15} />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] text-sm">
            <p className="text-[var(--text-3)]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 px-3 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--hover)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-[var(--text-2)]">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 rounded-lg border border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--hover)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
