import express from "express";
import upload from "../middleware/upload.js";
import {
  bulkDeleteProducts,
  createProduct,
  createVariants,
  deleteProduct,
  exportProductsCSV,
  getAllProduct,
  getOneProduct,
  importProductsCSV,
  togglePublish,
  updateProduct,
  getProductsBySection
} from "../controllers/productController.js";

const router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("images", 10),
  createProduct
);

router.get("/", getAllProduct);

router.get("/:id", getOneProduct);

router.put(
  "/:id",
  (req, res, next) => {
    req.uploadFolder = "products";
    next();
  },
  upload.array("images", 10),
  updateProduct
);
router.get(
  "/section/:section",
  getProductsBySection
);
router.patch("/:id/publish", togglePublish);

router.get("/export/csv", exportProductsCSV);

router.post("/import/csv", upload.single("file"), importProductsCSV);

router.delete("/bulk", bulkDeleteProducts);

router.delete("/:id", deleteProduct);

router.post("/variants", createVariants);

export default router;