// routes/uploadRoute.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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

// Home-page video banner. Separate multer instance: the shared one caps files
// at 20 MB, which is too small for a banner video.
const VIDEO_DIR = "uploads/cms/videos";
const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(VIDEO_DIR, { recursive: true });
      cb(null, VIDEO_DIR);
    },
    filename: (req, file, cb) =>
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  fileFilter: (req, file, cb) => {
    const ok = ["video/mp4", "video/webm"].includes(file.mimetype);
    cb(ok ? null : new Error("Only MP4 or WEBM videos are allowed"), ok);
  },
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post("/video", (req, res) => {
  videoUpload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No video uploaded" });
    res.json({ url: `/uploads/cms/videos/${req.file.filename}` });
  });
});

export default router;