import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import generateOrderPdf from "../utils/generateOrderPdf.js";
import razorpay, { verifyRazorpaySignature } from "../utils/razorpay.js";
// DTDC shipment gateway — disabled for now (DTDC account not yet fully
// activated). Uncomment these imports and the marked blocks below to
// re-enable auto-booking, the tracking webhook, and manual sync.
// import {
//   createShipment,
//   pullTrackShipment,
//   DTDC_TRACKING_PAGE_URL,
// } from "../utils/dtdc.js";
// import { DTDC_SCAN_TO_ORDER_STATUS } from "../utils/dtdcStatusMap.js";
import {
  ORDER_STATUS,
  STATUS_LABELS,
  canUserCancel,
  canAdminUpdate,
  // canCourierAdvanceTo, // only used by the DTDC webhook handler below
  getNextAllowedStatus,
  isFinalStatus,
} from "../utils/orderStatus.js";

// Resolves each cart line item against the real Product/Variant records and
// computes the authoritative pricing — shared by createOrder and
// createRazorpayOrder so a price is never trusted from the client and the
// two endpoints can never disagree about what a cart actually costs.
const computeOrderPricing = async (orderItems) => {
  let subtotal = 0;
  let shippingCharge = 0;
  let gstAmount = 0;
  let codEligible = true;

  const finalItems = [];

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
  const totalAmount = subtotal + shippingCharge + gstAmount;

  return { finalItems, subtotal, shippingCharge, gstAmount, totalAmount, codEligible };
};

/**
 * CREATE RAZORPAY ORDER
 * Called before opening the Razorpay checkout modal — computes the real
 * amount server-side and asks Razorpay to open an order for exactly that.
 */
export const createRazorpayOrder = async (req, res) => {
  try {
    const orderItems = req.body.orderItems;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in order",
      });
    }

    const { totalAmount } = await computeOrderPricing(orderItems);

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
    res.status(500).json({
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
      totalAmount,
      codEligible,
    } = await computeOrderPricing(orderItems);

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

    const pdfPath =
      await generateOrderPdf(order);

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

    res.status(500).json({
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

      // DTDC shipment gateway — disabled for now (account not yet fully
      // activated). Re-enable by uncommenting this block + the imports above;
      // until then, marking an order "Shipped" just changes status with no
      // AWB/tracking booked.
      // if (orderStatus === "shipped" && !order.trackingId) {
      //   try {
      //     const { awbNumber } = await createShipment(order);
      //     order.trackingId = awbNumber;
      //     order.trackingUrl = DTDC_TRACKING_PAGE_URL;
      //     order.courierPartner = "DTDC";
      //   } catch (shipErr) {
      //     return res.status(400).json({
      //       success: false,
      //       message: `Could not book DTDC shipment: ${shipErr.message}`,
      //     });
      //   }
      // }

      order.orderStatus = orderStatus;

      if (orderStatus === "delivered") {
        order.deliveredAt = new Date();
      }

      order.statusHistory.push({
        status: orderStatus,
        message:
          orderStatus === "shipped" && order.trackingId
            ? `Order shipped via DTDC — AWB ${order.trackingId}`
            : `Order updated to ${STATUS_LABELS[orderStatus]}`,
        updatedBy: "Admin",
      });
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

// DTDC shipment gateway — disabled for now (account not yet fully activated).
// Both handlers below are commented out along with their routes
// (webhookRoutes.js / orderRoutes.js) and the dtdc.js imports above.
// Uncomment all of it together to re-enable.
//
// /**
//  * DTDC TRACKING WEBHOOK (public — called by DTDC's push-tracking system)
//  * DTDC pushes a scan event roughly every 30 minutes whenever a booked
//  * shipment's status changes. This is the actual "auto status update"
//  * mechanism: no polling, the courier tells us the moment something happens.
//  * Must respond fast — DTDC's docs require a millisecond-scale response.
//  */
// export const dtdcTrackingWebhook = async (req, res) => {
//   try {
//     if (req.query.token !== process.env.DTDC_WEBHOOK_SECRET) {
//       return res.status(401).json({ received: false, message: "Invalid webhook token" });
//     }
//
//     const awb = req.body?.shipment?.strShipmentNo;
//     const events = req.body?.shipmentStatus;
//
//     if (!awb || !Array.isArray(events) || events.length === 0) {
//       return res.status(200).json({ received: true, matched: false });
//     }
//
//     const order = await Order.findOne({ trackingId: awb });
//     if (!order) {
//       return res.status(200).json({ received: true, matched: false });
//     }
//
//     for (const event of events) {
//       const mappedStatus = DTDC_SCAN_TO_ORDER_STATUS[event.strAction];
//
//       if (
//         mappedStatus &&
//         mappedStatus !== order.orderStatus &&
//         canCourierAdvanceTo(order.orderStatus, mappedStatus)
//       ) {
//         order.orderStatus = mappedStatus;
//
//         if (mappedStatus === "delivered") {
//           order.deliveredAt = new Date();
//         }
//
//         order.statusHistory.push({
//           status: mappedStatus,
//           message: event.strActionDesc || event.strAction,
//           updatedBy: "DTDC",
//         });
//       }
//     }
//
//     await order.save();
//
//     res.status(200).json({ received: true, matched: true });
//   } catch (error) {
//     console.error("DTDC WEBHOOK ERROR:", error);
//     // Still 200 — a 4xx/5xx here just makes DTDC retry a request that will
//     // fail identically every time (a bug on our end, not a transient one).
//     res.status(200).json({ received: true, error: error.message });
//   }
// };
//
// /**
//  * SYNC ORDER TRACKING (ADMIN, manual) — a pull-based fallback/"check now"
//  * button alongside the automatic webhook, for whenever an admin wants to
//  * confirm the latest status without waiting for the next push.
//  */
// export const syncOrderTracking = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id);
//
//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }
//
//     if (!order.trackingId) {
//       return res.status(400).json({
//         success: false,
//         message: "This order doesn't have a DTDC shipment booked yet.",
//       });
//     }
//
//     const tracking = await pullTrackShipment(order.trackingId);
//
//     res.status(200).json({ success: true, tracking });
//   } catch (error) {
//     res.status(502).json({
//       success: false,
//       message: `Could not fetch tracking from DTDC: ${error.message}`,
//     });
//   }
// };