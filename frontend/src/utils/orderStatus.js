// Centralized order-status state machine — mirrors backend/utils/orderStatus.js
// exactly. The backend is the actual enforcement point; this copy lets the
// frontend decide what UI to show (cancel button, disabled states) without
// duplicating the transition rules by hand in every component.

export const ORDER_STATUS = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_FLOW = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

const USER_CANCELLABLE_STATUSES = ["pending", "confirmed", "processing", "packed"];

export const canUserCancel = (status) => USER_CANCELLABLE_STATUSES.includes(status);

export const isFinalStatus = (status) => status === "delivered" || status === "cancelled";

export const getNextAllowedStatus = (status) => {
  const idx = STATUS_FLOW.indexOf(status);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
};

export const canAdminUpdate = (currentStatus, newStatus) => {
  if (!ORDER_STATUS.includes(newStatus)) return false;
  if (isFinalStatus(currentStatus)) return false;
  return getNextAllowedStatus(currentStatus) === newStatus;
};
