import express from "express";
import {
  createRating,
  getAllRating,
  getOneRating,
  updateRating,
  deleteRating,
} from "../controllers/ratingController.js";

const router = express.Router();

// CREATE
router.post("/", createRating);

// GET ALL
router.get("/", getAllRating);

// GET ONE
router.get("/:id", getOneRating);

// UPDATE
router.put("/:id", updateRating);

// DELETE
router.delete("/:id", deleteRating);

export default router;