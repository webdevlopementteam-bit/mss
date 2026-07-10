import Rating from "../models/ratingModel.js";

// 🔹 CREATE
export const createRating = async (req, res) => {
  try {
    const { customer, product, rating, comment, isPublished } = req.body;

    if (!customer || !product || !rating) {
      return res.status(400).json({
        success: false,
        message: "Customer, product and rating are required",
      });
    }

    // rating validation
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 to 5",
      });
    }

    // check duplicate (same user + same product)
    const existing = await Rating.findOne({ customer, product });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already rated this product",
      });
    }

    const newRating = await Rating.create({
      customer,
      product,
      rating,
      comment,
      isPublished,
    });

    res.status(201).json({
      success: true,
      data: newRating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 GET ALL (pagination + populate)
export const getAllRating = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await Rating.countDocuments();

    const ratings = await Rating.find()
      .populate("customer", "name email")
      .populate("product", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRating: total,
      data: ratings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 GET ONE
export const getOneRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id)
      .populate("customer", "name email")
      .populate("product", "title");

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    res.status(200).json({
      success: true,
      data: rating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 UPDATE
export const updateRating = async (req, res) => {
  try {
    const { rating, comment, isPublished } = req.body;

    const existing = await Rating.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 to 5",
        });
      }
      existing.rating = rating;
    }

    if (comment) existing.comment = comment;
    if (typeof isPublished !== "undefined")
      existing.isPublished = isPublished;

    await existing.save();

    res.status(200).json({
      success: true,
      data: existing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 DELETE
export const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: "Rating not found",
      });
    }

    await rating.deleteOne();

    res.status(200).json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
