import Attribute from "../models/attributeModel.js";

// 🔹 helper: clean variants
const cleanVariants = (variants) => {
  return [...new Set(variants.map(v => v.trim()).filter(v => v))];
};

// 🔹 CREATE
export const createAttribute = async (req, res) => {
  try {
    const { title, displayName, variants } = req.body;

    if (!title || !displayName || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const cleanedVariants = cleanVariants(variants);

    const existing = await Attribute.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attribute already exists",
      });
    }

    const attribute = await Attribute.create({
      title: title.toLowerCase(),
      displayName,
      variants: cleanedVariants,
    });

    res.status(201).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ALL (search + pagination)
export const getAllAttribute = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      title: { $regex: search, $options: "i" },
    };

    const total = await Attribute.countDocuments(query);

    const attributes = await Attribute.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalAttribute: total,
      data: attributes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 GET ONE
export const getOneAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 UPDATE
export const updateAttribute = async (req, res) => {
  try {
    const { title, displayName, variants } = req.body;

    const attribute = await Attribute.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    // title update (with duplicate check)
    if (title) {
      const existing = await Attribute.findOne({
        title: { $regex: `^${title}$`, $options: "i" },
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Attribute already exists",
        });
      }

      attribute.title = title.toLowerCase();
    }

    if (displayName) attribute.displayName = displayName;

    if (variants) {
      if (!Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Variants must be a non-empty array",
        });
      }

      attribute.variants = cleanVariants(variants);
    }

    await attribute.save();

    res.status(200).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 🔹 DELETE
export const deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findByIdAndDelete(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attribute deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};