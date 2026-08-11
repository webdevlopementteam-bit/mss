import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, "..", "assets", "logo.png");
// Helvetica (base-14 PDF font) has no glyph for ₹ — Inter does, so it's
// embedded and used everywhere instead of Helvetica/Helvetica-Bold.
const FONT_REGULAR_PATH = path.join(__dirname, "..", "assets", "Inter-Regular.ttf");
const FONT_BOLD_PATH = path.join(__dirname, "..", "assets", "Inter-SemiBold.ttf");

// Static business details printed on every invoice.
const COMPANY = {
  name: "Medical & Surgical Solutions",
  addressLine: "402, Ground Floor, Near Bagga Link, Patparganj Industrial Area, Delhi-110092",
  phone: "+91 9643344588",
  email: "care@medicalsurgical.org",
  website: "https://medicalsurgicalsolutions.com/",
  igstNo: "07BHQPS7148F1ZR",
  drugLicenseNo: "PTG-149905 (21),PTG-149904 (20)",
};

const COLORS = {
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  heading: "#111827",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatDate = (value) => {
  const d = new Date(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};

const money = (n) => `₹${Number(n || 0).toFixed(2)}`;

// Deterministic, order-specific 5-digit invoice number derived from the
// Mongo ObjectId — no separate counter/schema needed, stable per order.
const deriveInvoiceNo = (id) => {
  const num = (parseInt(id.toString().slice(-6), 16) % 90000) + 10000;
  return `#${num}`;
};

// ---- Number to words (Indian numbering system), e.g. 608 -> "Six hundred eight Only"
const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen",
  "eighteen", "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

const twoDigitWords = (n) => {
  if (n < 20) return ONES[n];
  return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "");
};

const threeDigitWords = (n) => {
  if (n < 100) return twoDigitWords(n);
  return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${twoDigitWords(n % 100)}` : ""}`;
};

const numberToWords = (num) => {
  num = Math.round(num);
  if (num === 0) return "zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = num;

  let words = "";
  if (crore) words += `${threeDigitWords(crore)} crore `;
  if (lakh) words += `${threeDigitWords(lakh)} lakh `;
  if (thousand) words += `${threeDigitWords(thousand)} thousand `;
  if (hundred) words += threeDigitWords(hundred);

  return words.trim();
};

const amountInWords = (amount) => {
  const words = numberToWords(Math.floor(amount));
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} Only`;
};

const paymentMethodLabel = (method) =>
  method === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery";

const generateOrderPdf = (order) => {
  return new Promise((resolve, reject) => {
    const invoicesDir = path.join("uploads", "invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `ORDER-${order._id}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    // Landscape — the reference design is wide (info row + item table read
    // far more naturally on a wide page than a portrait A4 sheet).
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.registerFont("Inter", FONT_REGULAR_PATH);
    doc.registerFont("Inter-Bold", FONT_BOLD_PATH);

    const margin = 40;
    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - margin * 2;

    // ================= HEADER: LOGO + COMPANY INFO =================
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, margin, margin, { width: 70 });
    }

    doc
      .font("Inter-Bold")
      .fontSize(13)
      .fillColor(COLORS.heading)
      .text(COMPANY.name, margin, margin, { width: contentWidth, align: "right" });

    doc
      .font("Inter")
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(COMPANY.addressLine, margin, doc.y + 2, { width: contentWidth, align: "right" })
      .text(COMPANY.phone, margin, doc.y + 2, { width: contentWidth, align: "right" })
      .text(COMPANY.email, margin, doc.y + 2, { width: contentWidth, align: "right" })
      .text(COMPANY.website, margin, doc.y + 2, { width: contentWidth, align: "right" });

    let y = Math.max(margin + 70, doc.y) + 15;

    doc
      .font("Inter-Bold")
      .fontSize(20)
      .fillColor(COLORS.heading)
      .text("INVOICE", margin, y);

    y = doc.y + 15;
    doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor(COLORS.border).stroke();
    y += 15;

    // ================= INFO ROW =================
    const infoColX = {
      date: margin,
      igst: margin + 90,
      drug: margin + 220,
      invoice: margin + 450,
    };
    const custColX = margin + 545;
    const custColWidth = pageWidth - margin - custColX;

    const drawLabelValue = (label, value, x, width) => {
      doc
        .font("Inter-Bold")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(label, x, y, { width });
      doc
        .font("Inter")
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(value || "—", x, doc.y + 2, { width });
    };

    const rowTop = y;

    drawLabelValue("DATE", formatDate(order.createdAt), infoColX.date, 85);
    doc.y = rowTop;
    drawLabelValue("IGST NO", COMPANY.igstNo, infoColX.igst, 120);
    doc.y = rowTop;
    drawLabelValue("DRUG LICENSE NO", COMPANY.drugLicenseNo, infoColX.drug, 220);
    doc.y = rowTop;
    drawLabelValue("INVOICE NO", deriveInvoiceNo(order._id), infoColX.invoice, 90);

    // Customer block — right aligned, multi-line (name, phone, address, city/state/pincode)
    doc.y = rowTop;
    doc
      .font("Inter-Bold")
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text("CUSTOMER NAME", custColX, rowTop, { width: custColWidth, align: "right" });

    doc
      .font("Inter")
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(`Mr./Mrs. ${order.customerInfo.fullName}`, custColX, doc.y + 2, {
        width: custColWidth,
        align: "right",
      });

    doc
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(order.customerInfo.phone, custColX, doc.y + 10, { width: custColWidth, align: "right" })
      .text(order.shippingAddress.address, custColX, doc.y + 2, { width: custColWidth, align: "right" });

    if (order.shippingAddress.landmark) {
      doc.text(order.shippingAddress.landmark, custColX, doc.y + 2, {
        width: custColWidth,
        align: "right",
      });
    }

    doc.text(
      `${order.shippingAddress.city}, ${order.shippingAddress.state}, India, ${order.shippingAddress.pincode}`,
      custColX,
      doc.y + 2,
      { width: custColWidth, align: "right" }
    );

    y = Math.max(doc.y, rowTop + 90) + 20;

    // ================= ITEMS TABLE =================
    const cols = [
      { key: "sr", label: "SR.", width: contentWidth * 0.05, align: "left" },
      { key: "hsn", label: "HSN", width: contentWidth * 0.08, align: "left" },
      { key: "ref", label: "REFERENCE NO", width: contentWidth * 0.14, align: "left" },
      { key: "title", label: "PRODUCT TITLE", width: contentWidth * 0.35, align: "center" },
      { key: "qty", label: "QUANTITY", width: contentWidth * 0.12, align: "center" },
      { key: "price", label: "ITEM PRICE", width: contentWidth * 0.12, align: "right" },
      { key: "amount", label: "AMOUNT", width: contentWidth * 0.14, align: "right" },
    ];
    let cx = margin;
    cols.forEach((c) => {
      c.x = cx;
      cx += c.width;
    });

    const items = order.orderItems.map((item, idx) => {
      const product = item.product && typeof item.product === "object" ? item.product : null;
      const titleParts = [item.name];
      if (item.variant?.name) titleParts.push(`(${item.variant.name})`);

      return {
        sr: String(idx + 1),
        hsn: product?.hsn ? String(product.hsn) : "N/A",
        ref: item.variant?.sku || product?.referenceNo || "N/A",
        title: titleParts.join(" "),
        qty: String(item.quantity),
        price: money(item.price),
        amount: money(item.price * item.quantity),
        gst: product?.gst,
      };
    });

    // Pre-compute row heights (title wraps) so the outer box can be drawn first.
    const rowPadding = 14;
    const rows = items.map((it) => {
      const titleHeight = doc
        .font("Inter")
        .fontSize(9)
        .heightOfString(it.title, { width: cols[3].width - 10, align: "center" });
      const height = Math.max(titleHeight, 14) + rowPadding * 2;
      return { ...it, height };
    });

    const headerHeight = 26;
    const tableHeight = headerHeight + rows.reduce((s, r) => s + r.height, 0);

    // Avoid overlapping the footer summary block on typical single-page orders.
    if (y + tableHeight + 150 > doc.page.height - margin) {
      doc.addPage();
      y = margin;
    }

    const tableTop = y;
    doc
      .roundedRect(margin, tableTop, contentWidth, tableHeight, 8)
      .strokeColor(COLORS.border)
      .stroke();

    // Header row
    doc.font("Inter-Bold").fontSize(8).fillColor(COLORS.muted);
    cols.forEach((c) => {
      doc.text(c.label, c.x + 5, tableTop + 9, { width: c.width - 10, align: c.align });
    });

    doc
      .moveTo(margin, tableTop + headerHeight)
      .lineTo(margin + contentWidth, tableTop + headerHeight)
      .strokeColor(COLORS.border)
      .stroke();

    // Item rows
    let rowY = tableTop + headerHeight;
    rows.forEach((row, idx) => {
      const textY = rowY + rowPadding;

      doc.font("Inter").fontSize(9).fillColor(COLORS.text);
      doc.text(row.sr, cols[0].x + 5, textY, { width: cols[0].width - 10, align: cols[0].align });
      doc.text(row.hsn, cols[1].x + 5, textY, { width: cols[1].width - 10, align: cols[1].align });
      doc.text(row.ref, cols[2].x + 5, textY, { width: cols[2].width - 10, align: cols[2].align });
      doc.text(row.title, cols[3].x + 5, textY, { width: cols[3].width - 10, align: cols[3].align });
      doc.text(row.qty, cols[4].x + 5, textY, { width: cols[4].width - 10, align: cols[4].align });
      doc.text(row.price, cols[5].x + 5, textY, { width: cols[5].width - 10, align: cols[5].align });

      doc.font("Inter-Bold").fontSize(9).fillColor(COLORS.text);
      doc.text(row.amount, cols[6].x + 5, textY, { width: cols[6].width - 10, align: cols[6].align });

      if (row.gst != null) {
        doc
          .font("Inter")
          .fontSize(7)
          .fillColor(COLORS.muted)
          .text(`(Inclusive of ${row.gst}% GST)`, cols[6].x + 5, doc.y + 1, {
            width: cols[6].width - 10,
            align: cols[6].align,
          });
      }

      rowY += row.height;

      if (idx < rows.length - 1) {
        doc
          .moveTo(margin, rowY)
          .lineTo(margin + contentWidth, rowY)
          .strokeColor(COLORS.border)
          .stroke();
      }
    });

    y = tableTop + tableHeight + 25;

    // ================= SUMMARY BOX =================
    const summaryHeight = 90;
    if (y + summaryHeight > doc.page.height - margin) {
      doc.addPage();
      y = margin;
    }

    doc
      .roundedRect(margin, y, contentWidth, summaryHeight, 8)
      .strokeColor(COLORS.border)
      .stroke();

    const summaryCols = [
      { label: "PAYMENT METHOD", value: paymentMethodLabel(order.paymentMethod) },
      { label: "SHIPPING COST", value: money(order.shippingCharge) },
      { label: "DISCOUNT", value: money(order.discountAmount) },
      { label: "TOTAL AMOUNT", value: money(order.totalAmount), big: true },
    ];
    const summaryColWidth = contentWidth / summaryCols.length;

    summaryCols.forEach((c, idx) => {
      const x = margin + idx * summaryColWidth + 15;
      doc
        .font("Inter-Bold")
        .fontSize(8)
        .fillColor(COLORS.muted)
        .text(c.label, x, y + 18, { width: summaryColWidth - 30 });
      doc
        .font("Inter-Bold")
        .fontSize(c.big ? 16 : 11)
        .fillColor(COLORS.text)
        .text(c.value, x, y + 32, { width: summaryColWidth - 30 });
    });

    doc
      .font("Inter-Bold")
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(amountInWords(order.totalAmount), margin + 15, y + 62, {
        width: contentWidth - 30,
      });

    doc.end();

    stream.on("finish", () => {
      resolve(`/uploads/invoices/${fileName}`);
    });

    stream.on("error", reject);
  });
};

export default generateOrderPdf;
