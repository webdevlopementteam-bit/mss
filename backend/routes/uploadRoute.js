// routes/uploadRoute.js
import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    console.log("UPLOAD HIT 🔥"); // 🔥 add this
    req.uploadFolder = "cms";
    next();
  },
  upload.single("file"),
  (req, res) => {
    res.json({
      url: `/uploads/cms/${req.file.filename}`, // ✅ fix
    });
  }
);

export default router;