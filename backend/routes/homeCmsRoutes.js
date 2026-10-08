import express from "express";
import { getHomeCMS, saveHomeCMS } from "../controllers/homeCmsController.js";
import { getSiteCms, getSiteCmsMany, saveSiteCms } from "../controllers/siteCmsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only an authenticated admin may change site content.
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

// GET CMS
router.get("/home", getHomeCMS);

// SAVE / UPDATE CMS
router.post("/home", saveHomeCMS);

// SITE CONTENT (About, FAQ, policies, contact details, SEO)
router.get("/site", getSiteCmsMany);
router.get("/site/:key", getSiteCms);
router.put("/site/:key", protect, adminOnly, saveSiteCms);

export default router;
