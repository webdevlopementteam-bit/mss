import express from "express";
import upload from "../middleware/upload.js";
import { createCompany, deleteCompany, getAllCompany, getOneCompany, updateCompany } from "../controllers/companyController.js";

const router = express.Router();

router.post("/", (req,res,next)=>{
    req.uploadFolder = "companies"
    next();
}, upload.single("image"), createCompany);

router.get("/", getAllCompany);

router.get("/:id", getOneCompany);

router.put("/:id", (req,res,next)=>{
    req.uploadFolder = "companies"
    next();
}, upload.single("image"), updateCompany);

router.delete("/:id", deleteCompany);

export default router;
