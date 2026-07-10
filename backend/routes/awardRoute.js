import express from "express";
import {
  createAward,
  deleteAward,
  getAllAward,
  getOneAward,
  updateAward,
} from "../controllers/awardController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// CREATE
router.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "awards";
    next();
  },
  upload.single("image"),
  createAward
);

// GET ALL
router.get("/", getAllAward);

// GET ONE
router.get("/:id", getOneAward);

// UPDATE
router.put(
  "/:id",
  (req, res, next) => {
    req.uploadFolder = "awards";
    next();
  },
  upload.single("image"),
  updateAward
);

// DELETE
router.delete("/:id", deleteAward);

export default router;