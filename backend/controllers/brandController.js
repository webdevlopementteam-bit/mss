import Brand from "../models/brandModel.js";
import fs from "fs";

// 🔹 CREATE
export const createBrands = async (req, res) => {
  try {
    const { name, description, isPublished } = req.body;

    if (!name || !description || typeof isPublished === "undefined" || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // duplicate check (case insensitive)
    const existing = await Brand.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Brand already exists",
      });
    }

    const brand = await Brand.create({
      name,
      description,
      isPublished,
      image: req.file.path.replace(/\\/g, "/"),
    });

    res.status(201).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ALL (pagination + search)
export const getAllBrand = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const total = await Brand.countDocuments(query);

    const brands = await Brand.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBrand: total,
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ONE
export const getOneBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 UPDATE
export const updateBrand = async (req, res) => {
  try {
    const { name, description, isPublished } = req.body;

    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // image update
    if (req.file) {
      if (brand.image && fs.existsSync(brand.image)) {
        fs.unlinkSync(brand.image);
      }
      brand.image = req.file.path.replace(/\\/g, "/");
    }

    if (name) brand.name = name;
    if (description) brand.description = description;
    if (typeof isPublished !== "undefined") brand.isPublished = isPublished;

    await brand.save();

    res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 DELETE
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    if (brand.image && fs.existsSync(brand.image)) {
      fs.unlinkSync(brand.image);
    }

    await brand.deleteOne();

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};