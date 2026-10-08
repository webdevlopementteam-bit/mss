import { STATUS_LABELS } from "../utils/orderStatus";

// Colour per order status; text colours are readable on both themes.
const STYLES = {
  pending: "bg-amber-500/15 text-amber-600 ring-amber-500/30",
  confirmed: "bg-sky-500/15 text-sky-600 ring-sky-500/30",
  processing: "bg-indigo-500/15 text-indigo-500 ring-indigo-500/30",
  packed: "bg-violet-500/15 text-violet-500 ring-violet-500/30",
  shipped: "bg-blue-500/15 text-blue-500 ring-blue-500/30",
  out_for_delivery: "bg-cyan-500/15 text-cyan-600 ring-cyan-500/30",
  delivered: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-500 ring-rose-500/30",
};

const PAYMENT_STYLES = {
  paid: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-600 ring-amber-500/30",
  failed: "bg-rose-500/15 text-rose-500 ring-rose-500/30",
  refunded: "bg-slate-500/15 text-slate-500 ring-slate-500/30",
};

const OrderStatusBadge = ({ status, label, type = "order", className = "" }) => {
  const styles = type === "payment" ? PAYMENT_STYLES : STYLES;
  return (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
      styles[status] || "bg-slate-500/15 text-slate-500 ring-slate-500/30"
    } ${className}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {label || STATUS_LABELS[status] || String(status || "—").replace(/_/g, " ")}
  </span>
  );
};

export default OrderStatusBadge;
