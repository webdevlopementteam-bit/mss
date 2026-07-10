import express from "express";
import { getHomeCMS, saveHomeCMS } from "../controllers/homeCmsController.js";

const router = express.Router();

// GET CMS
router.get("/home", getHomeCMS);

// SAVE / UPDATE CMS
router.post("/home", saveHomeCMS);

export default router;