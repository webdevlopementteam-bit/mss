import express from "express";
import uploads from "../middleware/upload.js"
import { createSubcategory, deleteSubcategory, getAllSubcategory, getOneSubcategory, updateSubcategory } from "../controllers/subcategoryController.js";

const router = express.Router();

router.post("/",(req,res,next)=>{
    req.uploadFolder = "subcategory",
    next();
},uploads.single("image"), createSubcategory);

router.get("/", getAllSubcategory);

router.get("/:id", getOneSubcategory);

router.put("/:id",(req,res,next)=>{
    req.uploadFolder = 'subcategory',
    next();
},uploads.single("image"), updateSubcategory);

router.delete("/:id", deleteSubcategory);

export default router;
