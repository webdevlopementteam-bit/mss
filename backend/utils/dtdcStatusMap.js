// Maps DTDC's tracking scan codes (from their "Track Scan Codes" reference
// sheet) onto our own order-status lifecycle. Codes not listed here (e.g.
// RTO/return-to-origin variants) don't have a clean equivalent in our
// forward-only flow — they're still recorded in statusHistory as raw scan
// events, they just don't change orderStatus.
export const DTDC_SCAN_TO_ORDER_STATUS = {
  SPL: "confirmed", // Softdata Upload — booking created
  PCSC: "confirmed", // Pickup Scheduled
  BKD: "confirmed", // Booked
  PCUP: "shipped", // Picked Up

  // In-transit variants
  IPMF: "shipped",
  OPMF: "shipped",
  ORMF: "shipped",
  IBMD: "shipped",
  OBMD: "shipped",
  IBMN: "shipped",
  OBMN: "shipped",
  IMBM: "shipped",
  OMBM: "shipped",
  IRBO: "shipped",
  ORBO: "shipped",
  CDIN: "shipped",
  CDOUT: "shipped",
  ARAP: "shipped", // Arrived At Airport
  CSCL: "shipped", // Customs Cleared
  CHLD: "shipped", // Customs HeldUp
  HLDUP: "shipped", // Held Up
  IRMF: "shipped", // Mis Route

  OUTDLV: "out_for_delivery",
  DLV: "delivered",
};

// Human-readable fallback for scan codes we don't have a description for.
export const describeDtdcScan = (code, fallbackDesc) => fallbackDesc || code;
