import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";

// Routes
import brandRoutes from "./routes/brandRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import subcategoryRoutes from "./routes/subcategoryRoute.js";
import pincodeRoutes from "./routes/pincodeRoute.js";
import attributeRoutes from "./routes/attributeRoute.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoute.js";
import awardRoutes from "./routes/awardRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import companyRoutes from "./routes/companyRoute.js";
import couponRoutes from "./routes/couponRoute.js";
import productRoutes from "./routes/productRoute.js";
import ratingRoutes from "./routes/ratingRoute.js";
import homeCmsRoutes from "./routes/homeCmsRoutes.js";
import uploadRoutes from "./routes/uploadRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import sitemapRoutes from "./routes/sitemapRoute.js";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";


const app = express();
const allowedOrigins = [
  "https://admin.mss.cybertricksmedia.in",
  "https://mss.cybertricksmedia.in",
  "https://www.mss.cybertricksmedia.in",
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    }  else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.set("trust proxy", 1);
const PORT = process.env.PORT || 8001;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder
app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// API Routes
app.use("/api/brand", brandRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);
app.use("/api/pincode", pincodeRoutes);
app.use("/api/attribute", attributeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/award",awardRoutes);
app.use("/api/blog",blogRoutes);
app.use("/api/company",companyRoutes);
app.use("/api/coupon",couponRoutes);
app.use("/api/product",productRoutes);
app.use("/api/rating",ratingRoutes);
app.use("/api/cms", homeCmsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/webhooks", webhookRoutes);
// Mounted under /api (not at the bare root) because the production Apache
// config only proxies /api/* through to this Node process — see
// backend/.htaccess. robots.txt's Sitemap: line points here directly.
app.use("/api", sitemapRoutes);

// 404 handler 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use(errorHandler);

// DB connect 
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Connection Failed:", err);
  });
