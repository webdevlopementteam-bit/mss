import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";

// Routes
import brandRoutes from "./routes/brandRoute.js";
import categoryRoutes from "./routes/categoryRoute.js";
import pincodeRoutes from "./routes/pincodeRoute.js";
import attributeRoutes from "./routes/attributeRoute.js";

// Middleware
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoute.js";
import awardRoutes from "./routes/awardRoute.js";
import blogRoutes from "./routes/blogRoute.js";
import clientRoutes from "./routes/clientRoute.js";
import couponRoutes from "./routes/couponRoute.js";
import productRoutes from "./routes/productRoute.js";
import ratingRoutes from "./routes/ratingRoute.js";
import homeCmsRoutes from "./routes/homeCmsRoutes.js";
import uploadRoutes from "./routes/uploadRoute.js";
import orderRoutes from "./routes/orderRoutes.js";
// DTDC shipment gateway webhook — disabled for now (account not yet fully
// activated). Uncomment along with the app.use() below to re-enable.
// import webhookRoutes from "./routes/webhookRoutes.js";
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
app.use("/api/pincode", pincodeRoutes);
app.use("/api/attribute", attributeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/award",awardRoutes);
app.use("/api/blog",blogRoutes);
app.use("/api/client",clientRoutes);
app.use("/api/coupon",couponRoutes);
app.use("/api/product",productRoutes);
app.use("/api/rating",ratingRoutes);
app.use("/api/cms", homeCmsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
// app.use("/api/webhooks", webhookRoutes);

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
