import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateOrderPdf = (order) => {
  return new Promise((resolve, reject) => {
    const invoicesDir = path.join("uploads", "invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `ORDER-${order._id}.pdf`;

    const filePath = path.join(
      invoicesDir,
      fileName
    );

    const doc = new PDFDocument();

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header
    doc.fontSize(20).text("ORDER INVOICE", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(
      `Date: ${new Date(
        order.createdAt
      ).toLocaleDateString()}`
    );

    doc.moveDown();

    // Customer
    doc.fontSize(14).text("Customer Details");

    doc.text(order.customerInfo.fullName);
    doc.text(order.customerInfo.phone);
    doc.text(order.customerInfo.email);

    doc.moveDown();

    // Address
    doc.fontSize(14).text("Shipping Address");

    doc.text(order.shippingAddress.address);

    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state}`
    );

    doc.text(order.shippingAddress.pincode);

    doc.moveDown();

    // Products
    doc.fontSize(14).text("Products");

    order.orderItems.forEach((item) => {
      doc.text(
        `${item.name} | Qty: ${item.quantity} | ₹${item.price}`
      );
    });

    doc.moveDown();

    doc.text(
      `Subtotal: ₹${order.subtotal}`
    );

    doc.text(
      `Shipping: ₹${order.shippingCharge}`
    );

    doc.text(`GST: ₹${order.gst}`);

    doc.fontSize(16).text(
      `Total: ₹${order.totalAmount}`
    );

    doc.end();

    stream.on("finish", () => {
      resolve(
        `/uploads/invoices/${fileName}`
      );
    });

    stream.on("error", reject);
  });
};

export default generateOrderPdf;