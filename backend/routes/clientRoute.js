import express from "express";
import upload from "../middleware/upload.js";
import { createClient, deleteClient, getAllClient, getOneClient, updateClient } from "../controllers/clientController.js";

const router = express.Router();

router.post("/", (req,res,next)=>{
    req.uploadFolder = "clients"
    next();
}, upload.single("image"), createClient);

router.get("/", getAllClient);

router.get("/:id", getOneClient);

router.put("/:id", (req,res,next)=>{
    req.uploadFolder = "clients"
    next();
}, upload.single("image"), updateClient);

router.delete("/:id", deleteClient);

export default router;