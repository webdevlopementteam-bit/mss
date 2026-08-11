import axios from "axios";

// Base URLs per DTDC's official Order Upload / Label / Cancellation API docs.
// Tracking-token + tracking pull APIs live on a completely different host
// from booking/label/cancel (DTDC splits these into separate products).
const BASE_URLS = {
  staging: {
    consignment: "https://alphademodashboardapi.shipsy.io/api/customer/integration/consignment",
    trackingAuth: "https://dtdcstagingapi.dtdc.com/dtdc-api/api/dtdc/authenticate",
    tracking: "https://dtdcstagingapi.dtdc.com/dtdc-tracking-api/dtdc-api/rest/JSONCnTrk/getTrackDetails",
  },
  production: {
    consignment: "https://pxapi.dtdc.in/api/customer/integration/consignment",
    trackingAuth: "https://blktracksvc.dtdc.com/dtdc-api/api/dtdc/authenticate",
    tracking: "https://blktracksvc.dtdc.com/dtdc-api/rest/JSONCnTrk/getTrackDetails",
  },
};

const getUrls = () => BASE_URLS[process.env.DTDC_ENV === "production" ? "production" : "staging"];

const consignmentHeaders = () => ({
  "api-key": process.env.DTDC_API_KEY,
  "Content-Type": "application/json",
});

// Books a single-piece forward shipment for an order and returns the AWB
// (reference_number) DTDC assigns. Weight/dimensions use env-configured
// defaults since individual products don't carry real weight/size data yet.
export const createShipment = async (order) => {
  const { consignment } = getUrls();

  const payload = {
    consignments: [
      {
        customer_code: process.env.DTDC_CUSTOMER_CODE,
        service_type_id: process.env.DTDC_SERVICE_TYPE_ID,
        load_type: "NON-DOCUMENT",
        consignment_type: "Forward",
        dimension_unit: "cm",
        length: "20.0",
        width: "20.0",
        height: "10.0",
        weight_unit: "kg",
        weight: String(process.env.DTDC_DEFAULT_WEIGHT_KG || "1.0"),
        declared_value: String(order.totalAmount || 0),
        num_pieces: "1",
        origin_details: {
          name: process.env.DTDC_ORIGIN_NAME,
          phone: process.env.DTDC_ORIGIN_PHONE,
          alternate_phone: process.env.DTDC_ORIGIN_PHONE,
          address_line_1: process.env.DTDC_ORIGIN_ADDRESS_1,
          address_line_2: process.env.DTDC_ORIGIN_ADDRESS_2 || "",
          pincode: process.env.DTDC_ORIGIN_PINCODE,
          city: process.env.DTDC_ORIGIN_CITY,
          state: process.env.DTDC_ORIGIN_STATE,
        },
        destination_details: {
          name: order.customerInfo?.fullName || "Customer",
          phone: order.customerInfo?.phone || "",
          alternate_phone: "",
          address_line_1: order.shippingAddress?.address || "",
          address_line_2: order.shippingAddress?.landmark || "",
          pincode: order.shippingAddress?.pincode || "",
          city: order.shippingAddress?.city || "",
          state: order.shippingAddress?.state || "",
        },
        customer_reference_number: order._id.toString(),
        cod_collection_mode: order.paymentMethod === "cod" ? "CASH" : "",
        cod_amount: order.paymentMethod === "cod" ? String(order.totalAmount || 0) : "",
        commodity_id: process.env.DTDC_COMMODITY_ID || "7", // defaults to OTHERS if unset
        description: (order.orderItems || []).map((i) => i.name).join(", ").slice(0, 250),
        reference_number: "",
      },
    ],
  };

  const { data } = await axios.post(`${consignment}/softdata`, payload, {
    headers: consignmentHeaders(),
    timeout: 15000,
  });

  const result = data?.data?.[0];
  if (!result?.success) {
    const reason = result?.remarks || result?.reason || data?.message || "DTDC booking failed";
    throw new Error(reason);
  }

  return {
    awbNumber: result.reference_number,
    raw: result,
  };
};

export const cancelShipment = async (awbNumbers) => {
  const { consignment } = getUrls();
  const { data } = await axios.post(
    `${consignment}/cancel`,
    { AWBNo: awbNumbers, customerCode: process.env.DTDC_CUSTOMER_CODE },
    { headers: consignmentHeaders(), timeout: 15000 }
  );
  return data;
};

// Returns a base64-encoded shipping label so it can be stored/served inline
// without needing a separate file-proxy endpoint.
export const generateLabel = async (awbNumber) => {
  const { consignment } = getUrls();
  const { data } = await axios.get(`${consignment}/shippinglabel/stream`, {
    headers: consignmentHeaders(),
    params: {
      reference_number: awbNumber,
      label_code: "SHIP_LABEL_4X6",
      label_format: "base64",
    },
    timeout: 15000,
  });
  return data;
};

// Pull-based tracking (secondary/fallback to the push webhook) — requires a
// short-lived token from the portal-login-based authenticate endpoint. Kept
// separate and defensive since this account may not have the tracking
// product enabled independently of booking.
let cachedToken = null;
let cachedTokenExpiry = 0;

const getTrackingToken = async () => {
  if (cachedToken && Date.now() < cachedTokenExpiry) return cachedToken;

  const { trackingAuth } = getUrls();
  const { data } = await axios.get(trackingAuth, {
    params: {
      username: process.env.DTDC_USERNAME,
      password: process.env.DTDC_PASSWORD,
    },
    timeout: 15000,
  });

  // Response is a raw token string, not JSON, per DTDC's docs.
  cachedToken = typeof data === "string" ? data : data?.token;
  cachedTokenExpiry = Date.now() + 25 * 60 * 1000; // refresh every ~25 min
  return cachedToken;
};

export const pullTrackShipment = async (awbNumber) => {
  const { tracking } = getUrls();
  const token = await getTrackingToken();

  const { data } = await axios.post(
    tracking,
    { trkType: "cnno", strcnno: awbNumber, addtnlDtl: "Y" },
    { headers: { "X-Access-Token": token, "Content-Type": "application/json" }, timeout: 15000 }
  );
  return data;
};

// DTDC's official tracking page doesn't support a reliable AWB deep-link
// query param (it's a JS-driven form) — link to the page itself and show the
// AWB as separate copyable text next to it for the customer to paste in.
export const DTDC_TRACKING_PAGE_URL = "https://www.dtdc.com/track-your-shipment/";
