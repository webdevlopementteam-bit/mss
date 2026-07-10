import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        },

        name: {
            type: String,
            required: true,
        },

        image: {
            type: String,
        },

        price: {
            type: Number,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            default: 1,
        },

        // Present only when this line item is a specific product variant.
        variant: {
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Variant",
            },
            name: String, // human-readable snapshot, e.g. "Size: 20gm, Color: Red"
            sku: String,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        // User
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            //commenting out required:true to allow orders without user (for guest checkout)
            /* required: true, */
        },

        // Customer Information
        customerInfo: {
            fullName: {
                type: String,
                required: true,
            },

            phone: {
                type: String,
                required: true,
            },

            email: {
                type: String,
                required: true,
            },
           
        },

        // Delivery Address
        shippingAddress: {
            address: {
                type: String,
                required: true,
            },

            city: {
                type: String,
                required: true,
            },

            state: {
                type: String,
                required: true,
            },

            pincode: {
                type: String,
                required: true,
            },

            landmark: {
                type: String,
                default: "",
            },
        },

        // Products
        orderItems: [orderItemSchema],

        // Prescription
        prescription: {
            type: String, // Cloudinary URL
            required: true,
        },
         invoicePdf: {
                type: String,
                default: "",
            },
        // Pricing
        subtotal: {
            type: Number,
            required: true,
        },

        shippingCharge: {
            type: Number,
            default: 0,
        },

        gst: {
            type: Number,
            default: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        // Payment
        paymentMethod: {
            type: String,
            enum: ["cod", "razorpay", "upi"],
            default: "cod",
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },

        paymentId: {
            type: String,
            default: "",
        },

        // Order Status
        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "packed",
                "shipped",
                "out_for_delivery",
                "delivered",
                "cancelled",
            ],
            default: "pending",
        },

        // Shipping Partner
        courierPartner: {
            type: String,
            default: "DTDC",
        },

        trackingId: {
            type: String,
            default: "",
        },

        trackingUrl: {
            type: String,
            default: "",
        },

        // Status History
        statusHistory: [
            {
                status: String,
                message: String,
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Admin Notes
        adminRemarks: {
            type: String,
            default: "",
        },

        deliveredAt: {
            type: Date,
        },

        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Order =
    mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;