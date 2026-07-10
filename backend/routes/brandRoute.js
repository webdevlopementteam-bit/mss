import express from "express";
import {
  createBrands,
  deleteBrand,
  getAllBrand,
  getOneBrand,
  updateBrand,
} from "../controllers/brandController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "brands";
    next();
  },
  upload.single("image"),
  createBrands
);

router.get("/", getAllBrand);

router.get("/:id", getOneBrand);

router.put(
  "/:id",
  (req, res, next) => {
    req.uploadFolder = "brands";
    next();
  },
  upload.single("image"),
  updateBrand
);

router.delete("/:id", deleteBrand);

export default router;