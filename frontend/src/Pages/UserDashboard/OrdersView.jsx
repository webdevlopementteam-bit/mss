import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import * as orderService from "../../api/orderService";
import { canUserCancel } from "../../utils/orderStatus";
import {
  C, Ico, I, Toast, ConfirmModal, StatusBadge, OrderStepper,
} from "./shared";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const formatAmount = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [localToastMsg, setLocalToast] = useState("");
  const [expanded, setExpanded] = useState(null);

  const showToast = (msg) => { setLocalToast(msg); setTimeout(() => setLocalToast(""), 3500); };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await orderService.getMyOrders();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const s = { total: orders.length, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) {
      if (o.orderStatus === "pending") s.pending++;
      else if (["confirmed", "processing", "packed"].includes(o.orderStatus)) s.processing++;
      else if (["shipped", "out_for_delivery"].includes(o.orderStatus)) s.shipped++;
      else if (o.orderStatus === "delivered") s.delivered++;
      else if (o.orderStatus === "cancelled") s.cancelled++;
    }
    return s;
  }, [orders]);

  const confirmCancel = async () => {
    const { id } = modal;
    try {
      const { data } = await orderService.cancelOrder(id);
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      showToast("Order has been cancelled.");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to cancel order.");
    } finally {
      setModal(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center", color: C.subtle, fontSize: 14 }}>
        Loading your orders...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.redLight,
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
          <Ico d={I.pkg} size={28} color={C.red} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: "0 0 6px" }}>
          You haven't placed any orders yet.
        </h2>
        <p style={{ fontSize: 13, color: C.subtle, margin: "0 0 20px" }}>
          Once you place an order, it will show up here.
        </p>
        <Link to="/shop" style={{ display: "inline-block", background: C.red, color: "#fff",
          borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 21, fontWeight: 800, color: C.text, margin: "0 0 4px", letterSpacing: "-.3px" }}>
          My Orders
        </h2>
        <p style={{ fontSize: 13, color: C.subtle, margin: 0 }}>
          {stats.total} total orders
        </p>
      </div>

      {/* Stats pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          ["Total", stats.total],
          ["Pending", stats.pending],
          ["Processing", stats.processing],
          ["Shipped", stats.shipped],
          ["Delivered", stats.delivered],
          ["Cancelled", stats.cancelled],
        ].map(([label, count]) => (
          <span key={label} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 99,
            background: "#f3f4f6", color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
            {label} <b style={{ color: C.red }}>{count}</b>
          </span>
        ))}
      </div>

      {/* Order cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {orders.map((o) => {
          const isOpen = expanded === o._id;
          const canCancel = canUserCancel(o.orderStatus);
          const itemCount = (o.orderItems || []).reduce((sum, it) => sum + (it.quantity || 0), 0);

          return (
            <div key={o._id} style={{
              background: C.white, borderRadius: 14,
              border: `1.5px solid ${isOpen ? C.redMid : C.border}`,
              boxShadow: isOpen ? `0 4px 20px rgba(181,35,39,.08)` : "0 1px 4px rgba(0,0,0,.05)",
              overflow: "hidden", transition: "border .2s, box-shadow .2s",
            }}>
              {/* Card top — always visible */}
              <div
                onClick={() => setExpanded(isOpen ? null : o._id)}
                style={{ padding: "16px 20px", cursor: "pointer", userSelect: "none" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.redLight,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ico d={I.pkg} size={18} color={C.red} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>
                        #{o._id.slice(-8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 12, color: C.subtle }}>·</span>
                      <span style={{ fontSize: 12, color: C.subtle }}>{formatDate(o.createdAt)}</span>
                      <span style={{ marginLeft: "auto" }}><StatusBadge status={o.orderStatus} /></span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.text,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      maxWidth: "90%" }}>
                      {(o.orderItems || []).map((it) => it.name).join(", ")}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: C.muted }}>Qty: <b style={{ color: C.text }}>{itemCount}</b></span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{formatAmount(o.totalAmount)}</span>
                    </div>
                  </div>

                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.subtle}
                    strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0, marginTop: 10 }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Expanded body */}
              {isOpen && (
                <div style={{ borderTop: `1px solid #f3f4f6`, padding: "16px 20px 20px" }}>

                  {o.orderStatus !== "cancelled" && (
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase",
                        letterSpacing: ".06em", marginBottom: 10 }}>Order Progress</div>
                      <OrderStepper status={o.orderStatus} />
                    </div>
                  )}

                  {o.orderStatus === "cancelled" && (
                    <div style={{ background: "#fafafa", border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: "12px 14px", marginBottom: 16,
                      display: "flex", alignItems: "center", gap: 10 }}>
                      <Ico d={I.alert} size={16} color={C.muted} />
                      <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>
                        This order was cancelled.
                      </span>
                    </div>
                  )}

                  {/* Ordered products */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {(o.orderItems || []).map((item, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12,
                        background: "#fafafa", borderRadius: 10, padding: "10px 12px", border: `1px solid #f0f0f0` }}>
                        <div style={{ width: 42, height: 42, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                          background: "#fff", border: `1px solid ${C.border}` }}>
                          {item.image && (
                            <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                          {item.variant?.name && (
                            <div style={{ fontSize: 11, color: C.subtle }}>{item.variant.name}</div>
                          )}
                          <div style={{ fontSize: 12, color: C.muted }}>Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{formatAmount(item.price)}</div>
                      </div>
                    ))}
                  </div>

                  {/* Order meta */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px",
                    background: "#fafafa", borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                    border: `1px solid #f0f0f0` }}>
                    {[
                      ["Order ID", `#${o._id.slice(-8).toUpperCase()}`],
                      ["Order Date", formatDate(o.createdAt)],
                      ["Payment Status", o.paymentStatus],
                      ["Payment Method", o.paymentMethod?.toUpperCase()],
                      ["Total Amount", formatAmount(o.totalAmount)],
                      ["Status", STATUS_LABEL(o.orderStatus)],
                      ...(o.trackingId ? [["Tracking ID", o.trackingId]] : []),
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.subtle,
                          textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    {o.trackingUrl && (
                      <>
                        <button
                          onClick={() => window.open(o.trackingUrl, "_blank")}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 7,
                            padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                            cursor: "pointer", border: `1.5px solid ${C.info}`,
                            background: C.infoBg, color: C.info,
                          }}>
                          <Ico d={I.truck} size={15} color={C.info} />
                          Track Order
                          <Ico d={I.link} size={12} color={C.info} />
                        </button>

                        {o.trackingId && (
                          <button
                            onClick={() => {
                              navigator.clipboard?.writeText(o.trackingId);
                              showToast("Tracking ID copied — paste it on the DTDC tracking page.");
                            }}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 7,
                              padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                              cursor: "pointer", border: `1.5px solid ${C.border}`,
                              background: "#fff", color: C.muted,
                            }}>
                            <Ico d={I.copy} size={14} color={C.muted} />
                            Copy Tracking ID
                          </button>
                        )}
                      </>
                    )}

                    {canCancel && (
                      <button onClick={() => setModal({ id: o._id })}
                        style={{ display: "inline-flex", alignItems: "center", gap: 7,
                          padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700,
                          cursor: "pointer", border: `1.5px solid ${C.redMid}`,
                          background: C.redLight, color: C.red }}>
                        <Ico d={I.x} size={14} color={C.red} />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {modal && (
        <ConfirmModal
          title="Cancel this order?"
          body="This order will be cancelled. Any amount paid will be refunded within 5–7 business days."
          confirmLabel="Cancel order"
          onConfirm={confirmCancel}
          onCancel={() => setModal(null)}
        />
      )}

      <Toast msg={localToastMsg} onClose={() => setLocalToast("")} />
    </div>
  );
}

function STATUS_LABEL(status) {
  return status
    ?.split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
