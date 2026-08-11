import Subcategory from "../models/subcategoryModel.js";
import fs from "fs";

// 🔹 slug generator
const slugify = (text) =>
  text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

// 🔹 CREATE
export const createSubcategory = async (req, res) => {
  try {
    const { name, description, category, isPublished } = req.body;

    if (!name || !description || !category || typeof isPublished === "undefined" || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const slug = slugify(name);

    const existing = await Subcategory.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Subcategory already exists",
      });
    }

    const subcategory = await Subcategory.create({
      name,
      slug,
      description,
      category,
      isPublished,
      image: req.file.path.replace(/\\/g, "/"),
    });

    res.status(201).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ALL (pagination + search + filter)
export const getAllSubcategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      name: { $regex: search, $options: "i" },
    };

    if (req.query.category) {
      query.category = req.query.category;
    }

    const total = await Subcategory.countDocuments(query);

    const subcategories = await Subcategory.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalSubcategory: total,
      data: subcategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ONE
export const getOneSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 UPDATE
export const updateSubcategory = async (req, res) => {
  try {
    const { name, description, isPublished, category } = req.body;

    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // image update
    if (req.file) {
      if (subcategory.image && fs.existsSync(subcategory.image)) {
        fs.unlinkSync(subcategory.image);
      }
      subcategory.image = req.file.path.replace(/\\/g, "/");
    }

    if (name) {
      subcategory.name = name;
      subcategory.slug = slugify(name);
    }

    if (description) subcategory.description = description;
    if (typeof isPublished !== "undefined") subcategory.isPublished = isPublished;
    if (category) subcategory.category = category;

    await subcategory.save();

    res.status(200).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 DELETE
export const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    // delete image
    if (subcategory.image && fs.existsSync(subcategory.image)) {
      fs.unlinkSync(subcategory.image);
    }

    await subcategory.deleteOne();

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
