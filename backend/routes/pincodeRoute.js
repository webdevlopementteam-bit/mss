import express from "express";
import { createPincode, deletePincode, getAllPincode, getOnePincode, updatePincode } from "../controllers/pincodeController.js";
import upload from "../middleware/upload.js";
import { bulkUploadPincode } from "../controllers/pincodeController.js";

const router = express.Router();

router.post("/", createPincode);

router.get("/", getAllPincode);

router.get("/:id", getOnePincode);

router.post(
  "/bulk",
  (req, res, next) => {
    req.uploadFolder = "pincode";
    next();
  },
  upload.single("file"),
  bulkUploadPincode
);

router.put("/:id", updatePincode);

router.delete("/:id", deletePincode);


export default router;