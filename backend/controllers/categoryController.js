import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import fs from "fs";

// 🔹 slug generator
const slugify = (text) =>
  text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

// 🔹 CREATE
export const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory, isPublished } = req.body;

    if (!name || !description || typeof isPublished === "undefined" || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const slug = slugify(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parentCategory: parentCategory || null,
      isPublished,
      image: req.file.path.replace(/\\/g, "/"),
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ALL (pagination + search + filter)
export const getAllCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const total = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .populate("parentCategory", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCategory: total,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ONE
export const getOneCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentCategory",
      "name"
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 UPDATE
export const updateCategory = async (req, res) => {
  try {
    const { name, description, isPublished, parentCategory } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // image update
    if (req.file) {
      if (category.image && fs.existsSync(category.image)) {
        fs.unlinkSync(category.image);
      }
      category.image = req.file.path.replace(/\\/g, "/");
    }

    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }

    if (description) category.description = description;
    if (typeof isPublished !== "undefined") category.isPublished = isPublished;

    // prevent self parent bug
    if (parentCategory && parentCategory !== req.params.id) {
      category.parentCategory = parentCategory;
    }

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 DELETE
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // check children exist
    const hasChildren = await Category.findOne({
      parentCategory: category._id,
    });

    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Delete child categories first",
      });
    }

    // check subcategories exist
    const hasSubcategories = await Subcategory.findOne({
      category: category._id,
    });

    if (hasSubcategories) {
      return res.status(400).json({
        success: false,
        message: "Delete subcategories first",
      });
    }

    // delete image
    if (category.image && fs.existsSync(category.image)) {
      fs.unlinkSync(category.image);
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔥 TREE API (VERY IMPORTANT for UI)
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find();

    const buildTree = (parentId = null) => {
      return categories
        .filter(
          (cat) =>
            String(cat.parentCategory) === String(parentId)
        )
        .map((cat) => ({
          ...cat._doc,
          children: buildTree(cat._id),
        }));
    };

    const tree = buildTree(null);

    res.status(200).json({
      success: true,
      data: tree,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};