import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import generateOrderPdf from "../utils/generateOrderPdf.js";
import {
  ORDER_STATUS,
  STATUS_LABELS,
  canUserCancel,
  canAdminUpdate,
  getNextAllowedStatus,
  isFinalStatus,
} from "../utils/orderStatus.js";



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

    let subtotal = 0;
    let shippingCharge = 0;
    let gstAmount = 0;

    const finalItems = [];

    // Resolve each line item's price/name/image server-side from the real
    // Product/Variant record rather than trusting whatever the client sent —
    // the client only tells us WHICH product/variant and the quantity.
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
      // gst/deliveryCharge, so both always come from the parent product.
      if (productDoc) {
        gstAmount += (lineSubtotal * (Number(productDoc.gst) || 0)) / 100;
        shippingCharge += Number(productDoc.deliveryCharge) || 0;
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

    const totalAmount =
      subtotal +
      shippingCharge +
      gstAmount;

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

        paymentStatus:
          "pending",

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

      order.orderStatus = orderStatus;

      if (orderStatus === "delivered") {
        order.deliveredAt = new Date();
      }

      order.statusHistory.push({
        status: orderStatus,
        message: `Order updated to ${STATUS_LABELS[orderStatus]}`,
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