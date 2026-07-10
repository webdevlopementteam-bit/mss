import Coupon from "../models/couponModel.js";
import fs from "fs";

// 🔹 CREATE COUPON
export const createCoupon = async (req, res) => {
  try {
    const {
      couponName,
      couponCode,
      applyOn,
      categories,
      products,
      validityTime,
      discountType,
      discount,
      minAmount,
      isPublished,
    } = req.body;

    if (
      !couponName ||
      !couponCode ||
      !applyOn ||
      !validityTime?.startDate ||
      !validityTime?.endDate ||
      !discountType ||
      !minAmount ||
      !discount
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if(new Date(validityTime.endDate) < new Date()){
      return res.status(400).json({
        success:false,
        message:"Coupon is expired!",
      })
    }

    // 🔥 date validation
    if (new Date(validityTime.endDate) <= new Date(validityTime.startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be greater than start date",
      });
    }

    // 🔥 discount validation
    if (discountType === "PERCENTAGE" && discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage cannot exceed 100",
      });
    }

    // 🔥 apply logic validation
    if (applyOn === "CATEGORY" && (!categories || categories.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Select at least one category",
      });
    }

    if (applyOn === "PRODUCT" && (!products || products.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Select at least one product",
      });
    }

    // 🔥 duplicate code check
    const existing = await Coupon.findOne({ couponCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      couponName,
      couponCode,
      applyOn,
      categories: applyOn === "CATEGORY" ? categories : [],
      products: applyOn === "PRODUCT" ? products : [],
      validityTime,
      discountType,
      discount,
      minAmount,
      isPublished,
      couponImage: req.file ? req.file.path.replace(/\\/g, "/") : "",
    });

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 GET ALL (pagination + search)
export const getAllCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      couponName: { $regex: search, $options: "i" },
    };

    const total = await Coupon.countDocuments(query);

    const coupons = await Coupon.find(query)
      .populate("categories", "name")
      .populate("products", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCoupon: total,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 GET ONE
export const getOneCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("categories", "name")
      .populate("products", "name");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 UPDATE
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const {
      couponName,
      couponCode,
      applyOn,
      categories,
      products,
      validityTime,
      discountType,
      discount,
      minAmount,
      isPublished,
    } = req.body;

    if (req.file) {
      if (coupon.couponImage && fs.existsSync(coupon.couponImage)) {
        fs.unlinkSync(coupon.couponImage);
      }
      coupon.couponImage = req.file.path.replace(/\\/g, "/");
    }

    if (couponName) coupon.couponName = couponName;
    if(couponCode) coupon.couponCode = couponCode;
    if (applyOn) coupon.applyOn = applyOn;

    if (applyOn === "CATEGORY") {
      coupon.categories = categories || [];
      coupon.products = [];
    }

    if (applyOn === "PRODUCT") {
      coupon.products = products || [];
      coupon.categories = [];
    }

    if (validityTime) coupon.validityTime = validityTime;
    if (discountType) coupon.discountType = discountType;
    if (discount) coupon.discount = discount;
    if (minAmount !== undefined) coupon.minAmount = minAmount;
    if (typeof isPublished !== "undefined") coupon.isPublished = isPublished;

    await coupon.save();

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, cartAmount, products, categories } = req.body;

    const coupon = await Coupon.findOne({ couponCode: code });

    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    //  not published
    if (!coupon.isPublished) {
      return res.status(400).json({ message: "Coupon not active" });
    }

    const now = new Date();

    //  not started
    if (coupon.validityTime.startDate > now) {
      return res.status(400).json({ message: "Coupon not started yet" });
    }

    //  expired
    if (coupon.validityTime.endDate < now) {
      return res.status(400).json({ message: "Coupon expired" });
    }

    //  min amount check
    if (cartAmount < coupon.minAmount) {
      return res.status(400).json({
        message: `Minimum amount should be ₹${coupon.minAmount}`,
      });
    }

    // APPLY TYPE CHECK
    if (coupon.applyOn === "CATEGORY") {
      const match = categories.some((cat) =>
        coupon.categories.includes(cat)
      );

      if (!match) {
        return res.status(400).json({
          message: "Coupon not valid for selected category",
        });
      }
    }

    if (coupon.applyOn === "PRODUCT") {
      const match = products.some((prod) =>
        coupon.products.includes(prod)
      );

      if (!match) {
        return res.status(400).json({
          message: "Coupon not valid for selected product",
        });
      }
    }

    //  CALCULATE DISCOUNT
    let discountAmount = 0;

    if (coupon.discountType === "FIXED") {
      discountAmount = coupon.discount;
    }

    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (cartAmount * coupon.discount) / 100;
    }

    const finalAmount = cartAmount - discountAmount;

    res.json({
      success: true,
      coupon: coupon.couponCode,
      discountAmount,
      finalAmount,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 DELETE
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (coupon.couponImage && fs.existsSync(coupon.couponImage)) {
      fs.unlinkSync(coupon.couponImage);
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
