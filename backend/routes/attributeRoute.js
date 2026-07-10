import express from "express";
import { createAttribute, deleteAttribute, getAllAttribute, getOneAttribute, updateAttribute } from "../controllers/attributeController.js";

const router = express.Router();

router.post("/",createAttribute);

router.get("/", getAllAttribute);

router.get("/:id", getOneAttribute);

router.put("/:id", updateAttribute);

router.delete("/:id", deleteAttribute);

export default router;