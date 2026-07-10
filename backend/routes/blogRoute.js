import express from "express";
import upload from "../middleware/upload.js";
import {
  createBlog,
  deleteBlog,
  getAllBlog,
  getOneBlog,
getBlogBySlug,
  updateBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "blogs"; // 👈 better naming
    next();
  },
  upload.single("image"),
  createBlog
);

router.get("/", getAllBlog);

router.get("/slug/:slug", getBlogBySlug);

router.get("/:id", getOneBlog);


router.put(
  "/:id",
  (req, res, next) => {
    req.uploadFolder = "blogs";
    next();
  },
  upload.single("image"),
  updateBlog
);

router.delete("/:id", deleteBlog);

export default router;
