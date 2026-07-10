import express from "express";
import uploads from "../middleware/upload.js"
import { createCategory, deleteCategory, getAllCategory, getCategoryTree, getOneCategory, updateCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.post("/",(req,res,next)=>{
    req.uploadFolder = "category",
    next();
},uploads.single("image"), createCategory);

router.get("/", getAllCategory);

router.get("/:id", getOneCategory);

router.put("/:id",(req,res,next)=>{
    req.uploadFolder = 'category',
    next();
},uploads.single("image"), updateCategory);

router.delete("/:id", deleteCategory);

router.get("/tree", getCategoryTree);

export default router;