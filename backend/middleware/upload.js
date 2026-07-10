import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.uploadFolder || "others";
    const uploadPath = `uploads/${folder}`;

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",   // 🔥 ADD
  "image/avif",   // 🔥 ADD
  "video/mp4",
  "video/mkv",
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel"
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP, AVIF, PDF and supported files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

export default upload;