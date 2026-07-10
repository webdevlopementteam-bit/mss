import Award from "../models/awardModel.js";
import fs from "fs";

// 🔹 CREATE
export const createAward = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const award = await Award.create({
      name,
      image: req.file.path.replace(/\\/g, "/"),
    });

    res.status(201).json({
      success: true,
      data: award,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 🔹 GET ALL (search + pagination)
export const getAllAward = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const total = await Award.countDocuments(query);

    const awards = await Award.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAward: total,
      data: awards,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 🔹 GET ONE
export const getOneAward = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({
        success: false,
        message: "Award not found",
      });
    }

    res.status(200).json({
      success: true,
      data: award,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 🔹 UPDATE
export const updateAward = async (req, res) => {
  try {
    const { name } = req.body;

    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({
        success: false,
        message: "Award not found",
      });
    }

    if (req.file) {
      if (award.image && fs.existsSync(award.image)) {
        fs.unlinkSync(award.image);
      }
      award.image = req.file.path.replace(/\\/g, "/");
    }

    if (name) award.name = name;

    await award.save();

    res.status(200).json({
      success: true,
      data: award,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 🔹 DELETE
export const deleteAward = async (req, res) => {
  try {
    const award = await Award.findById(req.params.id);

    if (!award) {
      return res.status(404).json({
        success: false,
        message: "Award not found",
      });
    }

    if (award.image && fs.existsSync(award.image)) {
      fs.unlinkSync(award.image);
    }

    await award.deleteOne();

    res.status(200).json({
      success: true,
      message: "Award deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};