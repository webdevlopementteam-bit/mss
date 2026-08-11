import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import generateOrderPdf from "../utils/generateOrderPdf.js";
import razorpay, { verifyRazorpaySignature } from "../utils/razorpay.js";
import {
  createShipment,
  pullTrackShipment,
  DTDC_TRACKING_PAGE_URL,
} from "../utils/dtdc.js";
import { DTDC_SCAN_TO_ORDER_STATUS } from "../utils/dtdcStatusMap.js";
import { validateCoupon } from "../utils/couponValidation.js";
import {
  ORDER_STATUS,
  STATUS_LABELS,
  canUserCancel,
  canAdminUpdate,
  canCourierAdvanceTo,
  getNextAllowedStatus,
  isFinalStatus,
} from "../utils/orderStatus.js";

// Resolves each cart line item against the real Product/Variant records and
// computes the authoritative pricing — shared by createOrder and
// createRazorpayOrder so a price is never trusted from the client and the
// two endpoints can never disagree about what a cart actually costs.
// couponCode is optional and re-validated server-side (never trusts a
// client-sent discount amount) — omitting it behaves exactly as before.
const computeOrderPricing = async (orderItems, couponCode = null) => {
  let subtotal = 0;
  let shippingCharge = 0;
  let gstAmount = 0;
  let codEligible = true;

  const finalItems = [];
  const productIds = [];
  const categoryIds = [];

  for (const item of orderItems) {
    let variantDoc = null;
    let productDoc = null;

    if (item.variantId && mongoose.Types.ObjectId.isValid(item.variantId)) {
      variantDoc = await Variant.findById(item.variantId).populate(
        "attributes.attributeId"
      );
    }

    if (
      !variantDoc &&
      item.product &&
      mongoose.Types.ObjectId.isValid(item.product)
    ) {
      productDoc = await Product.findById(item.product);
    } else if (variantDoc) {
      productDoc = await Product.findById(variantDoc.productId);
    }

    let itemPrice;
    let itemName;
    let itemImage;
    let variantSnapshot;

    if (variantDoc) {
      itemPrice = Number(variantDoc.salePrice || variantDoc.price || 0);
      itemName = productDoc?.title || item.name || "Product";
      itemImage = productDoc?.images?.[0] || item.image || "";
      const attrLabel = (variantDoc.attributes || [])
        .map((a) => `${a.attributeId?.displayName || "Option"}: ${a.value}`)
        .join(", ");
      variantSnapshot = {
        variantId: variantDoc._id,
        name: attrLabel,
        sku: variantDoc.sku || "",
      };
    } else if (productDoc) {
      itemPrice = Number(productDoc.salePrice || productDoc.price || 0);
      itemName = productDoc.title;
      itemImage = productDoc.images?.[0] || "";
    } else {
      // Defensive fallback for a stale/legacy cart entry with no resolvable id.
      itemPrice = Number(item.price || 0);
      itemName = item.name || "Product";
      itemImage = item.image || "";
    }

    const lineSubtotal = itemPrice * item.quantity;
    subtotal += lineSubtotal;

    // GST is a per-product percentage (set in the admin), applied to this
    // line's subtotal; deliveryCharge is a flat per-product handling fee
    // (not multiplied by quantity — it represents the cost to ship this
    // product type, not a per-unit fee). Variants don't carry their own
    // gst/deliveryCharge/codAvailable, so all three always come from the
    // parent product.
    if (productDoc) {
      gstAmount += (lineSubtotal * (Number(productDoc.gst) || 0)) / 100;
      shippingCharge += Number(productDoc.deliveryCharge) || 0;
      if (productDoc.codAvailable === false) codEligible = false;
      productIds.push(productDoc._id);
      categoryIds.push(...(productDoc.category || []));
    }

    finalItems.push({
      product: productDoc?._id || null,
      name: itemName,
      image: itemImage,
      price: itemPrice,
      quantity: item.quantity,
      ...(variantSnapshot ? { variant: variantSnapshot } : {}),
    });
  }

  gstAmount = Math.round(gstAmount * 100) / 100;

  let discountAmount = 0;
  let appliedCouponCode = "";

  if (couponCode) {
    const { coupon, discountAmount: computedDiscount } = await validateCoupon({
      code: couponCode,
      cartAmount: subtotal,
      productIds,
      categoryIds,
    });
    discountAmount = Math.round(computedDiscount * 100) / 100;
    appliedCouponCode = coupon.couponCode;
  }

  const totalAmount = subtotal + shippingCharge + gstAmount - discountAmount;

  return {
    finalItems,
    subtotal,
    shippingCharge,
    gstAmount,
    discountAmount,
    couponCode: appliedCouponCode,
    totalAmount,
    codEligible,
  };
};

/**
 * CREATE RAZORPAY ORDER
 * Called before opening the Razorpay checkout modal — computes the real
 * amount server-side and asks Razorpay to open an order for exactly that.
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderItems, couponCode } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    const { totalAmount } = await computeOrderPricing(orderItems, couponCode);

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * CREATE ORDER
 */
export const createOrder = async (req, res) => {
  try {
    const customerInfo = JSON.parse(
      req.body.customerInfo
    );

    const shippingAddress = JSON.parse(
      req.body.shippingAddress
    );

    const orderItems = JSON.parse(
      req.body.orderItems
    );

    const paymentMethod =
      req.body.paymentMethod || "cod";

    const couponCode = req.body.couponCode || null;

    if (!customerInfo) {
      return res.status(400).json({
        success: false,
        message:
          "Customer information required",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address required",
      });
    }

    if (
      !orderItems ||
      orderItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Prescription is required",
      });
    }

    const {
      finalItems,
      subtotal,
      shippingCharge,
      gstAmount,
      discountAmount,
      couponCode: appliedCouponCode,
      totalAmount,
      codEligible,
    } = await computeOrderPricing(orderItems, couponCode);

    if (paymentMethod === "cod" && !codEligible) {
      return res.status(400).json({
        success: false,
        message:
          "Cash on Delivery is not available for one or more items in your cart. Please choose online payment.",
      });
    }

    let paymentStatus = "pending";
    let paymentId = "";

    if (paymentMethod === "razorpay") {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      const verified = verifyRazorpaySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: "Payment verification failed. Please try again.",
        });
      }

      paymentStatus = "paid";
      paymentId = razorpayPaymentId;
    }

    const order =
      await Order.create({
        user: req.user.id,

        customerInfo,

        shippingAddress,

        orderItems: finalItems,

        prescription:
          req.file.path,

        subtotal,

        shippingCharge,

        gst: gstAmount,

        couponCode: appliedCouponCode,

        discountAmount,

        totalAmount,

        paymentMethod,

        paymentStatus,

        paymentId,

        orderStatus: "pending",

        statusHistory: [
          {
            status: "pending",
            message:
              "Order placed successfully",
            updatedBy: "User",
          },
        ],
      });

    await order.populate({
      path: "orderItems.product",
      select: "hsn referenceNo gst",
    });

    const pdfPath =
      await generateOrderPdf(order);

    // Revert the populated product refs back to plain ObjectIds before
    // saving — otherwise Mongoose would persist the populated subdocuments
    // in place of the refs.
    order.depopulate("orderItems.product");
    order.invoicePdf = pdfPath;

    await order.save();

    res.status(201).json({
      success: true,
      message:
        "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * GET MY ORDERS
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user.id,
    })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET SINGLE ORDER
 */
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(
      req.params.id
    )
      .populate("user", "name email")
      .populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOwner =
      order.user &&
      order.user._id.toString() ===
      req.user.id;

    const isAdmin =
      req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL ORDERS (ADMIN)
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalRevenue = orders.reduce(
      (sum, order) =>
        sum +
        (order.paymentStatus === "paid"
          ? order.totalAmount
          : 0),
      0
    );

    res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * GET SINGLE ORDER (ADMIN)
 */
export const getSingleOrderAdmin =
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  };
/**
 * UPDATE ORDER STATUS (ADMIN)
 */
export const updateOrderStatus = async (
  req,
  res
) => {
  try {
    const {
      orderStatus,
      trackingId,
      trackingUrl,
      courierPartner,
      adminRemarks,
    } = req.body;

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only touch orderStatus / push a history entry when the caller is
    // actually asking to change it — trackingId/courierPartner/etc. can be
    // updated on their own without re-validating the status transition.
    if (orderStatus && orderStatus !== order.orderStatus) {
      if (!ORDER_STATUS.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      if (isFinalStatus(order.orderStatus)) {
        return res.status(400).json({
          success: false,
          message:
            order.orderStatus === "cancelled"
              ? "Cancelled orders cannot be updated."
              : "Delivered orders are final and cannot be updated.",
        });
      }

      if (!canAdminUpdate(order.orderStatus, orderStatus)) {
        const next = getNextAllowedStatus(order.orderStatus);
        return res.status(400).json({
          success: false,
          message: next
            ? `Invalid status transition. Order must move from "${STATUS_LABELS[order.orderStatus]}" to "${STATUS_LABELS[next]}" next.`
            : "This order cannot be updated further.",
        });
      }

      // "Packed" is the last status an admin can set manually — booking the
      // DTDC shipment and advancing straight to "shipped" happens
      // automatically as part of the same action. Booking is attempted
      // BEFORE any mutation so a failure leaves the order untouched (admin
      // just retries "Mark as Packed"). From here, only the DTDC webhook or
      // a manual sync can move the order forward — canAdminUpdate blocks
      // shipped/out_for_delivery/delivered as manual targets.
      let awbNumber = null;
      if (orderStatus === "packed") {
        try {
          ({ awbNumber } = await createShipment(order));
        } catch (shipErr) {
          return res.status(400).json({
            success: false,
            message: `Could not book DTDC shipment: ${shipErr.message}`,
          });
        }
      }

      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        message: `Order updated to ${STATUS_LABELS[orderStatus]}`,
        updatedBy: "Admin",
      });

      if (awbNumber) {
        order.trackingId = awbNumber;
        order.trackingUrl = DTDC_TRACKING_PAGE_URL;
        order.courierPartner = "DTDC";
        order.orderStatus = "shipped";
        order.statusHistory.push({
          status: "shipped",
          message: `Order shipped via DTDC — AWB ${awbNumber}`,
          updatedBy: "System",
        });
      }
    }

    if (trackingId)
      order.trackingId = trackingId;

    if (trackingUrl)
      order.trackingUrl = trackingUrl;

    if (courierPartner)
      order.courierPartner =
        courierPartner;

    if (adminRemarks)
      order.adminRemarks =
        adminRemarks;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * UPDATE PAYMENT STATUS
 */
export const updatePaymentStatus =
  async (req, res) => {
    try {
      const {
        paymentStatus,
        paymentId,
      } = req.body;

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.paymentStatus =
        paymentStatus;

      if (paymentId)
        order.paymentId =
          paymentId;

      await order.save();

      res.status(200).json({
        success: true,
        message:
          "Payment status updated",
        order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/**
 * CANCEL ORDER
 */
export const cancelOrder = async (
  req,
  res
) => {
  try {
    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only the order's own customer, or an admin, may cancel it.
    const isOwner =
      order.user &&
      order.user.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (
      order.orderStatus ===
      "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order already cancelled",
      });
    }

    if (!canUserCancel(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "This order has already been shipped and cannot be cancelled.",
      });
    }

    // Restore Stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            quantity: item.quantity,
          },
        }
      );
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = isOwner ? "User" : "Admin";

    order.statusHistory.push({
      status: "cancelled",
      message:
        "Order cancelled successfully",
      updatedBy: order.cancelledBy,
    });

    await order.save();

    res.status(200).json({
      success: true,
      message:
        "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Applies a list of DTDC scan events (same shape from both the push webhook
// and the pull tracking API) to an order — shared so the webhook and the
// admin "Sync Tracking Now" button can never disagree about how a scan
// event maps to orderStatus. Mutates `order` in place; returns whether
// anything actually changed so the caller knows whether a save is needed.
const applyDtdcScanEvents = (order, events, updatedBy = "DTDC") => {
  let changed = false;

  for (const event of events) {
    const action = event.strAction || event.strActionCode || event.strCode;
    const mappedStatus = DTDC_SCAN_TO_ORDER_STATUS[action];

    if (
      mappedStatus &&
      mappedStatus !== order.orderStatus &&
      canCourierAdvanceTo(order.orderStatus, mappedStatus)
    ) {
      order.orderStatus = mappedStatus;
      changed = true;

      if (mappedStatus === "delivered") {
        order.deliveredAt = new Date();
      }

      order.statusHistory.push({
        status: mappedStatus,
        message: event.strActionDesc || event.strAction || action,
        updatedBy,
      });
    }
  }

  return changed;
};

/**
 * DTDC TRACKING WEBHOOK (public — called by DTDC's push-tracking system)
 * DTDC pushes a scan event roughly every 30 minutes whenever a booked
 * shipment's status changes. This is the actual "auto status update"
 * mechanism: no polling, the courier tells us the moment something happens.
 * Must respond fast — DTDC's docs require a millisecond-scale response.
 */
export const dtdcTrackingWebhook = async (req, res) => {
  try {
    if (req.query.token !== process.env.DTDC_WEBHOOK_SECRET) {
      return res.status(401).json({ received: false, message: "Invalid webhook token" });
    }

    const awb = req.body?.shipment?.strShipmentNo;
    const events = req.body?.shipmentStatus;

    if (!awb || !Array.isArray(events) || events.length === 0) {
      return res.status(200).json({ received: true, matched: false });
    }

    const order = await Order.findOne({ trackingId: awb });
    if (!order) {
      return res.status(200).json({ received: true, matched: false });
    }

    applyDtdcScanEvents(order, events, "DTDC");
    await order.save();

    res.status(200).json({ received: true, matched: true });
  } catch (error) {
    console.error("DTDC WEBHOOK ERROR:", error);
    // Still 200 — a 4xx/5xx here just makes DTDC retry a request that will
    // fail identically every time (a bug on our end, not a transient one).
    res.status(200).json({ received: true, error: error.message });
  }
};

/**
 * SYNC ORDER TRACKING (ADMIN, manual) — a pull-based fallback/"check now"
 * button alongside the automatic webhook, for whenever an admin wants to
 * confirm the latest status without waiting for the next push. Previously
 * this only forwarded DTDC's raw response to the frontend without ever
 * updating the order — fixed to run the pulled scan history through the
 * same mapping the webhook uses and actually persist any status change.
 */
export const syncOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (!order.trackingId) {
      return res.status(400).json({
        success: false,
        message: "This order doesn't have a DTDC shipment booked yet.",
      });
    }

    const tracking = await pullTrackShipment(order.trackingId);

    // DTDC's pull API has been seen nesting the scan history under different
    // keys depending on account/product config — check the likely ones. If
    // none match, `events` is empty and we just surface the raw response
    // (visible via the existing console.log in the admin UI) without
    // touching orderStatus, instead of guessing wrong.
    const events =
      tracking?.trackDetails ||
      tracking?.trackingDetails ||
      tracking?.[0]?.trackDetails ||
      tracking?.shipmentStatus ||
      [];

    const previousStatus = order.orderStatus;
    const statusChanged =
      Array.isArray(events) && events.length > 0
        ? applyDtdcScanEvents(order, events, "DTDC")
        : false;

    if (statusChanged) {
      await order.save();
    }

    res.status(200).json({
      success: true,
      tracking,
      order,
      statusChanged,
      previousStatus,
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: `Could not fetch tracking from DTDC: ${error.message}`,
    });
  }
};