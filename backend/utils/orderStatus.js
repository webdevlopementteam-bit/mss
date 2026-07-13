// Centralized order-status state machine — the single source of truth for
// which status transitions are legal. The backend enforces these rules on
// every request; the frontend (customer dashboard + admin panel) each keep
// an identical copy of this file purely to decide what UI to show, so the
// client and server can never disagree about what's allowed.

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

// The forward-only lifecycle. "cancelled" is a separate terminal status
// reachable from the cancellable statuses via cancellation, not via this chain.
export const STATUS_FLOW = [
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

// Returns the single next status in the sequential flow, or null if `status`
// is already the last step (delivered), the terminal "cancelled" status, or
// not a recognized status at all.
export const getNextAllowedStatus = (status) => {
  const idx = STATUS_FLOW.indexOf(status);
  if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
};

// The only admin-driven transition allowed is moving to the immediate next
// step in STATUS_FLOW. Cancelled/delivered orders can never be updated here —
// cancellation only happens through the dedicated cancel endpoint.
export const canAdminUpdate = (currentStatus, newStatus) => {
  if (!ORDER_STATUS.includes(newStatus)) return false;
  if (isFinalStatus(currentStatus)) return false;
  return getNextAllowedStatus(currentStatus) === newStatus;
};

// Unlike canAdminUpdate (single-step-only, for a human clicking "next"), a
// courier webhook can legitimately skip steps if we missed an intermediate
// scan (e.g. "out_for_delivery" arriving before we ever saw "shipped"). This
// only guards against moving BACKWARD or touching an already-final order —
// it does not enforce the one-step-at-a-time rule.
export const canCourierAdvanceTo = (currentStatus, newStatus) => {
  if (!STATUS_FLOW.includes(newStatus)) return false;
  if (isFinalStatus(currentStatus)) return false;
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  const newIdx = STATUS_FLOW.indexOf(newStatus);
  if (currentIdx === -1) return true;
  return newIdx > currentIdx;
};
