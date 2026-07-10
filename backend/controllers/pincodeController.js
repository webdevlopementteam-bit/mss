import Pincode from "../models/pincodeModel.js";
import fs from "fs";
import csv from "csv-parser";

export const createPincode = async (req, res) => {
  try {
    const { pincode, branchName } = req.body;
    if (!pincode || !branchName) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Required!",
      });
    }
    const existing = await Pincode.findOne({ pincode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Pincode Already Exist",
      });
    }
    const pincodes = await Pincode.create({
      pincode,
      branchName,
    });

    res.status(200).json({
      success: true,
      data: pincodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPincode = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const query = {
      pincode: { $regex: search, $options: "i" },
    };
    const total = await Pincode.countDocuments(query);
    const pincode = await Pincode.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPage: Math.ceil(total / limit),
      totalPincode: total,
      data: pincode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOnePincode = async (req, res) => {
  try {
    const { id } = req.params;

    const pincode = await Pincode.findById(id);

    if (!pincode) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found!",
      });
    }
    res.status(200).json({
      success: true,
      data: pincode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePincode = async (req, res) => {
  try {
    const { id } = req.params;
    const { pincode, branchName } = req.body;
    const pincodes = await Pincode.findById(id);

    if (!pincodes) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found!",
      });
    }

    if (pincode) pincodes.pincode = pincode;
    if (branchName) pincodes.branchName = branchName;

    await pincodes.save();
    res.status(200).json({
      success: true,
      data: pincodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkUploadPincode = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required",
      });
    }

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          pincode: data.pincode,
          branchName: data.branchName,
        });
      })
      .on("end", async () => {
        try {
          // remove duplicates from CSV
          const uniqueData = results.filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.pincode === item.pincode),
          );

          // insert only new ones
          const inserted = [];

          for (let item of uniqueData) {
            const exists = await Pincode.findOne({ pincode: item.pincode });

            if (!exists) {
              const newPin = await Pincode.create(item);
              inserted.push(newPin);
            }
          }

          // delete uploaded file after processing
          fs.unlinkSync(req.file.path);

          res.status(200).json({
            success: true,
            message: "Bulk upload completed",
            totalUploaded: inserted.length,
          });
        } catch (err) {
          res.status(500).json({
            success: false,
            message: err.message,
          });
        }
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePincode = async (req, res) => {
  try {
    const { id } = req.params;
    const pincode = await Pincode.findByIdAndDelete(id);
    if (!pincode) {
      return res.status(404).json({
        success: false,
        message: "Pincode not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pincode Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
