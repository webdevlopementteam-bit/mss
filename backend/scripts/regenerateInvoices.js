// Re-creates invoice PDFs in the current format (GST shown separately,
// Subtotal + Shipping + GST − Discount = Total, paise in words).
//
// Each invoice is written to the SAME file it already has
// (uploads/invoices/ORDER-<id>.pdf), so no extra files are created.
//
// Usage (run on the server, inside the backend folder):
//   npm run regenerate-invoices -- --dry-run     list what would change
//   npm run regenerate-invoices                  regenerate every invoice
//   npm run regenerate-invoices -- <orderId> ... only these orders

import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";

// generateOrderPdf writes to "uploads/invoices" relative to the working
// directory, so always work from the backend folder.
const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(backendDir);
dotenv.config();

const { default: Order } = await import("../models/orderModel.js");
// Registers the Product model so orderItems.product (HSN, ref no, GST) can be populated.
await import("../models/productModel.js");
const { default: generateOrderPdf } = await import("../utils/generateOrderPdf.js");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const ids = args.filter((a) => mongoose.Types.ObjectId.isValid(a));

await mongoose.connect(process.env.MONGO_URI);

const filter = ids.length ? { _id: { $in: ids } } : {};
const orders = await Order.find(filter)
  .populate({ path: "orderItems.product", select: "hsn referenceNo gst" })
  .sort({ createdAt: 1 })
  .lean();

console.log(`${dryRun ? "[dry run] " : ""}${orders.length} order(s) found`);

let ok = 0;
let failed = 0;
for (const order of orders) {
  const label = `ORDER-${order._id}  ₹${order.totalAmount}  (${order.customerInfo?.fullName || "—"})`;
  if (dryRun) {
    console.log("  would regenerate", label);
    continue;
  }
  try {
    const pdfPath = await generateOrderPdf(order);
    // Only fills in the link for orders that never had one; the path is
    // otherwise identical to what is already stored.
    if (order.invoicePdf !== pdfPath) {
      await Order.updateOne({ _id: order._id }, { $set: { invoicePdf: pdfPath } });
    }
    ok += 1;
    console.log("  regenerated", label);
  } catch (err) {
    failed += 1;
    console.error("  FAILED", label, "-", err.message);
  }
}

if (!dryRun) console.log(`Done: ${ok} regenerated, ${failed} failed`);
await mongoose.disconnect();
process.exit(failed ? 1 : 0);
