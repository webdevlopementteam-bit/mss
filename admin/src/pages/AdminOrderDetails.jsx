import React, {
  useEffect,
  useState,
} from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  CreditCard,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import OrderStatusBadge from "../components/OrderStatusBadge";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  STATUS_LABELS,
  getNextAllowedStatus,
  isFinalStatus,
  canAdminUpdate,
} from "../utils/orderStatus";

// Steps shown in the progress tracker (same order as the status flow).
const FLOW = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

const AdminOrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] =
    useState(null);

  const [updating, setUpdating] =
    useState(false);

  const [syncing, setSyncing] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await API.get(`/orders/admin/${id}`);

      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load order");
    }
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  // Only the single next status in the sequential flow is ever selectable —
  // there is nothing to "choose" beyond confirming that one move.
  const nextStatus = order ? getNextAllowedStatus(order.orderStatus) : null;
  const locked = order ? isFinalStatus(order.orderStatus) : false;
  // Admin can only manually drive the order up through "packed" — marking it
  // packed automatically books the DTDC shipment and advances to "shipped".
  // Beyond that, only the DTDC webhook (or "Sync Tracking Now") can move the
  // order forward, so the manual button is hidden rather than shown-disabled.
  const canManuallyAdvance =
    order && nextStatus ? canAdminUpdate(order.orderStatus, nextStatus) : false;
  const awaitingCourier = order && !locked && !canManuallyAdvance;

  const updateStatus =
    async () => {
      if (!nextStatus) return;
      try {
        setUpdating(true);
        const res = await API.put(
          `/orders/admin/status/${id}`,
          { orderStatus: nextStatus }
        );

        if (res.data.success) {
          toast.success(`Order marked as ${STATUS_LABELS[nextStatus]}`);
          fetchOrder();
        }
      } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Failed to update status");
      } finally {
        setUpdating(false);
      }
    };

  const syncTracking = async () => {
    try {
      setSyncing(true);
      const res = await API.post(`/orders/admin/${id}/sync-tracking`);
      if (res.data.success) {
        if (res.data.statusChanged) {
          setOrder(res.data.order);
          toast.success(
            `Status updated to ${STATUS_LABELS[res.data.order.orderStatus] || res.data.order.orderStatus}`
          );
        } else {
          toast.success("Fetched latest tracking from DTDC — no status change yet");
        }
        console.log("DTDC tracking response:", res.data.tracking);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to sync tracking");
    } finally {
      setSyncing(false);
    }
  };

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="h-24 rounded-xl bg-[var(--surface-3)] animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-xl bg-[var(--surface-3)] animate-pulse" />
          <div className="h-80 rounded-xl bg-[var(--surface-3)] animate-pulse" />
        </div>
      </div>
    );
  }

  const IMG = import.meta.env.VITE_IMAGE_BASE_URL;
  const itemImage = (src) =>
    !src ? "/no-image.png" : src.startsWith("http") || src.startsWith("data:") ? src : `${IMG}/${src.replace(/^\//, "")}`;
  const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const placedAt = new Date(order.createdAt);
  const stepIndex = FLOW.indexOf(order.orderStatus);
  const addr = order.shippingAddress || {};
  const cust = order.customerInfo || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-3)] hover:text-[var(--text)] transition">
            <ArrowLeft size={15} /> Back to orders
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-[22px] font-bold text-[var(--text)]">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <OrderStatusBadge status={order.orderStatus} label={STATUS_LABELS[order.orderStatus]} />
          </div>
          <p className="mt-1 text-sm text-[var(--text-3)]">
            Placed on {placedAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} at{" "}
            {placedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            <span className="mx-2">·</span>
            <span className="font-mono text-xs">{order._id}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.prescription && (
            <a
              href={`${import.meta.env.VITE_IMAGE_BASE_URL}/${order.prescription}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:bg-[var(--hover)] transition"
            >
              <FileText size={16} /> View Prescription
            </a>
          )}
          {order.invoicePdf && (
            <a
              href={`${import.meta.env.VITE_IMAGE_BASE_URL}${order.invoicePdf}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-sm font-semibold text-[#fff] transition"
            >
              <Download size={16} /> Download Invoice
            </a>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      <Card>
        {order.orderStatus === "cancelled" ? (
          <div className="flex items-center gap-3 text-rose-500">
            <XCircle size={22} />
            <p className="font-semibold">This order was cancelled.</p>
          </div>
        ) : (
          <ol className="grid grid-cols-7 gap-2">
            {FLOW.map((s, i) => {
              const done = i <= stepIndex;
              const current = i === stepIndex;
              return (
                <li key={s} className="relative flex flex-col items-center text-center">
                  {i > 0 && (
                    <span
                      className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= stepIndex ? "bg-[var(--primary)]" : "bg-[var(--border-strong)]"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
                      done
                        ? "bg-[var(--primary)] border-[var(--primary)] text-[#fff]"
                        : "bg-[var(--surface)] border-[var(--border-strong)] text-[var(--text-3)]"
                    } ${current ? "ring-4 ring-[var(--ring)]" : ""}`}
                  >
                    {done && !current ? <Check size={15} /> : i + 1}
                  </span>
                  <span className={`mt-2 text-[11.5px] leading-tight font-medium ${done ? "text-[var(--text)]" : "text-[var(--text-3)]"}`}>
                    {STATUS_LABELS[s]}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Ordered Products" icon={Package} extra={`${order.orderItems?.length || 0} line items`}>
            <div className="divide-y divide-[var(--border)] -my-2">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-3.5">
                  <img
                    src={itemImage(item.image)}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = "/no-image.png";
                    }}
                    className="w-16 h-16 shrink-0 rounded-lg object-contain bg-[var(--surface-2)] border border-[var(--border)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--text)] leading-snug">{item.name}</p>
                    {item.variant?.name && (
                      <p className="text-xs text-[var(--text-3)] mt-0.5">
                        {item.variant.name}
                        {item.variant.sku ? ` · SKU: ${item.variant.sku}` : ""}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-3)] mt-0.5">
                      {inr(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--text)] whitespace-nowrap">{inr(Number(item.price || 0) * Number(item.quantity || 0))}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Order Summary" icon={Receipt}>
            <dl className="space-y-2.5 text-sm">
              <Row label="Subtotal" value={inr(order.subtotal)} />
              <Row label="Shipping" value={inr(order.shippingCharge)} />
              <Row label="GST" value={inr(order.gst)} />
              <div className="pt-3 mt-1 border-t border-dashed border-[var(--border-strong)] flex justify-between items-baseline">
                <dt className="font-semibold text-[var(--text)]">Total</dt>
                <dd className="text-xl font-bold text-[var(--text)]">{inr(order.totalAmount)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Status management */}
          <Card title="Order Status" icon={ClipboardCheck}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--text-3)]">Current status</span>
              <OrderStatusBadge status={order.orderStatus} label={STATUS_LABELS[order.orderStatus] || order.orderStatus} />
            </div>

            {locked ? (
              // Cancelled / Delivered are final — nothing to update.
              <div
                className={`px-4 py-3 rounded-lg text-sm font-medium ${
                  order.orderStatus === "cancelled" ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                {order.orderStatus === "cancelled"
                  ? "This order is Cancelled — it is a final status and cannot be updated."
                  : "This order has been Delivered — it is a final status and cannot be updated."}
              </div>
            ) : awaitingCourier ? (
              // Past "packed" — the DTDC shipment is booked and only the courier
              // (webhook, or a manual sync) can advance the order further.
              <div className="px-4 py-3 rounded-lg text-sm bg-blue-500/10 text-blue-500">
                This order is now tracked by DTDC — status updates automatically as the courier scans the shipment. Use
                &quot;Sync Tracking Now&quot; to check right now instead of waiting.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Only the single next valid status is ever selectable — the
                    admin cannot skip stages or pick an arbitrary status. */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--text-3)]">Next step:</span>
                  <span className="font-semibold text-[var(--text)]">{nextStatus ? STATUS_LABELS[nextStatus] : "—"}</span>
                </div>
                <button
                  onClick={updateStatus}
                  disabled={!nextStatus || updating}
                  className="w-full h-11 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-sm font-semibold text-[#fff] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? "Updating..." : nextStatus ? `Mark as ${STATUS_LABELS[nextStatus]}` : "No further updates"}
                </button>
                {nextStatus === "packed" && (
                  <p className="text-xs text-[var(--text-3)]">
                    Marking this order as Packed will automatically book the DTDC shipment and move it to Shipped.
                  </p>
                )}
              </div>
            )}
          </Card>

          <Card title="Customer" icon={User}>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-[var(--primary-soft)] flex items-center justify-center font-bold text-[var(--primary)]">
                {(cust.fullName || "?").charAt(0).toUpperCase()}
              </span>
              <p className="font-semibold text-[var(--text)]">{cust.fullName || "—"}</p>
            </div>
            <div className="space-y-2 text-sm">
              <IconLine icon={Mail}>{cust.email || "—"}</IconLine>
              <IconLine icon={Phone}>{cust.phone || "—"}</IconLine>
            </div>
          </Card>

          <Card title="Shipping Address" icon={MapPin}>
            <div className="text-sm leading-relaxed text-[var(--text-2)]">
              <p className="text-[var(--text)]">{addr.address}</p>
              <p>
                {addr.city}
                {addr.city && addr.state ? ", " : ""}
                {addr.state}
              </p>
              <p>{addr.pincode}</p>
              {addr.landmark && <p className="mt-1 text-[var(--text-3)]">Landmark: {addr.landmark}</p>}
            </div>
          </Card>

          <Card title="Payment" icon={CreditCard}>
            <dl className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[var(--text-3)]">Status</dt>
                <dd>
                  <OrderStatusBadge type="payment" status={String(order.paymentStatus || "").toLowerCase()} label={order.paymentStatus || "—"} />
                </dd>
              </div>
              <Row label="Method" value={<span className="uppercase">{order.paymentMethod || "—"}</span>} />
            </dl>
          </Card>

          <Card title="Shipment" icon={Truck}>
            {order.trackingId ? (
              <div className="space-y-3 text-sm">
                <Row label="Courier" value={order.courierPartner || "DTDC"} />
                <Row label="AWB / Tracking No." value={<span className="font-mono">{order.trackingId}</span>} />
                {order.trackingUrl && (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary)] hover:underline"
                  >
                    Open DTDC tracking page <ExternalLink size={13} />
                  </a>
                )}
                {order.trackingUrl && <p className="text-xs text-[var(--text-3)]">Enter the AWB above on the DTDC page to check status.</p>}
                <button
                  onClick={syncTracking}
                  disabled={syncing}
                  className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Syncing..." : "Sync Tracking Now"}
                </button>
                <p className="text-xs text-[var(--text-3)]">
                  Status updates automatically as DTDC scans the shipment — this button just checks right now instead of
                  waiting.
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-3)]">
                {nextStatus === "packed"
                  ? "A DTDC shipment will be booked automatically when this order is marked as Packed."
                  : "No shipment booked yet."}
              </p>
            )}
          </Card>

          <Card title="Documents" icon={FileText}>
            <div className="space-y-2 text-sm">
              <Row label="Prescription" value={order.prescription ? "Uploaded" : "Not uploaded"} />
              <Row label="Invoice" value={order.invoicePdf ? "Generated" : "Not generated"} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ---------- small presentational helpers ---------- */
const Card = ({ title, icon: CardIcon, extra, children }) => (
  <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
    {title && (
      <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-[var(--border)]">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[var(--text)]">
          {CardIcon && <CardIcon size={17} className="text-[var(--text-3)]" />}
          {title}
        </h2>
        {extra && <span className="text-xs text-[var(--text-3)]">{extra}</span>}
      </header>
    )}
    <div className="p-5">{children}</div>
  </section>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="text-[var(--text-3)]">{label}</dt>
    <dd className="font-medium text-[var(--text)] text-right">{value}</dd>
  </div>
);

const IconLine = ({ icon, children }) => {
  const LineIcon = icon;
  return (
  <p className="flex items-center gap-2.5 text-[var(--text-2)] break-all">
    <LineIcon size={15} className="shrink-0 text-[var(--text-3)]" />
    {children}
  </p>
  );
};

export default AdminOrderDetails;
