import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import Category from "../models/categoryModel.js";
import Brand from "../models/brandModel.js";
import Attribute from "../models/attributeModel.js";
import fs from "fs";
import slugify from "slugify";
import mongoose from "mongoose";
import { Parser } from "json2csv";
import csv from "csv-parser";

// ── Variant helpers (shared by createProduct / updateProduct / createVariants) ──
const normalizeCombination = (attrs) => {
  return attrs
    .slice()
    .sort((a, b) => String(a.attributeId).localeCompare(String(b.attributeId)))
    .map((a) => a.value)
    .join("-");
};

const buildVariantDocs = (productId, rawVariants) => {
  const seenCombinations = new Set();
  // const seenSkus = new Set();

  return rawVariants.map((v, index) => {
    if (!Array.isArray(v.attributes) || v.attributes.length === 0) {
      throw new Error(`Variant ${index + 1}: at least one attribute is required`);
    }
    if (v.price === "" || v.price === undefined || v.price === null || isNaN(Number(v.price))) {
      throw new Error(`Variant ${index + 1}: price is required`);
    }
    if (v.quantity === "" || v.quantity === undefined || v.quantity === null || isNaN(Number(v.quantity))) {
      throw new Error(`Variant ${index + 1}: quantity is required`);
    }

    const attributes = v.attributes
      .filter((a) => a.attributeId)
      .map((a) => ({ attributeId: a.attributeId, value: a.value }));

    const combination = normalizeCombination(attributes);

    const comboKey = combination.toLowerCase();
    if (seenCombinations.has(comboKey)) {
      throw new Error(`Duplicate variant combination: ${combination}`);
    }
    seenCombinations.add(comboKey);

    // const sku = (v.sku || "").trim();
    // if (sku) {
    //   const skuKey = sku.toLowerCase();
    //   if (seenSkus.has(skuKey)) {
    //     throw new Error(`Duplicate SKU in variants: ${sku}`);
    //   }
    //   seenSkus.add(skuKey);
    // }

    return {
      productId,
      combination,
      attributes,
      price: Number(v.price),
      salePrice:
        v.salePrice !== "" && v.salePrice !== undefined && v.salePrice !== null
          ? Number(v.salePrice)
          : undefined,
      quantity: Number(v.quantity),
      isActive: v.isActive === undefined ? true : Boolean(v.isActive),
      // Only include sku when it has a real value — writing "" would defeat
      // the sparse unique index and re-introduce the duplicate-key bug.
      // ...(sku ? { sku } : {}),
    };
  });
};

// Validates + writes the full variant set for a product. Not a DB transaction
// (this MongoDB instance is standalone, not a replica set, so multi-document
// transactions aren't available) — validating everything up front, before any
// write, is the practical equivalent given that constraint.
const syncProductVariants = async (productId, rawVariants) => {
  const docs = buildVariantDocs(productId, rawVariants);

  // const nonEmptySkus = docs.filter((d) => d.sku).map((d) => d.sku);
  // if (nonEmptySkus.length > 0) {
  //   const conflict = await Variant.findOne({
  //     sku: { $in: nonEmptySkus },
  //     productId: { $ne: productId },
  //   });
  //   if (conflict) {
  //     throw new Error(`SKU "${conflict.sku}" is already used by another product`);
  //   }
  // }

  await Variant.deleteMany({ productId });
  return Variant.insertMany(docs);
};

// 🔹 CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      metaTitle,
      metaDescription,
      price,
      salePrice,
      gst,
      quantity,
      category,
      client,
      brand,
      hsn,
      deliveryCharge,
      referenceNo,
      moq,
      packing,
      codAvailable,
      tags,
      hasVariants,
      isPublished,
      homeSections,
      variants
    } = req.body;

    if (!title || !description || !gst || !category || category.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    // if (!req.files || req.files.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Product images are required",
    //   });
    // }

    const priceNum = Number(req.body.price);
    const saleNum = Number(req.body.salePrice);

    if (
      req.body.salePrice !== "" &&
      !isNaN(priceNum) &&
      !isNaN(saleNum) &&
      saleNum > priceNum
    ) {
      return res.status(400).json({
        message: "Sale price must be ≤ price"
      });
    }

    const finalHasVariants = hasVariants === "true" || hasVariants === true;

    if (!finalHasVariants && !price) {
      return res.status(400).json({
        success: false,
        message: "Price is required",
      });
    }

    const slug = slugify(title, { lower: true });

    const images = req.files.map(file =>
      file.path.replace(/\\/g, "/")
    );

    const product = await Product.create({
      title,
      description,
      metaTitle,
      metaDescription,
      price: finalHasVariants ? 0 : price,
      salePrice: finalHasVariants ? 0 : salePrice,
      gst,
      quantity: finalHasVariants ? 0 : quantity,
      isPublished: typeof isPublished !== "undefined" ? isPublished : true,
      homeSections: homeSections
        ? JSON.parse(homeSections)
        : [],
      category,
      client: client || undefined,
      brand: brand || undefined,
      hsn,
      deliveryCharge,
      referenceNo,
      moq,
      packing,
      codAvailable,
      tags,
      hasVariants: finalHasVariants,
      slug,
      images
    });

    if (finalHasVariants && variants) {
      try {
        const parsedVariants = JSON.parse(variants);
        if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
          await syncProductVariants(product._id, parsedVariants);
        }
      } catch (variantError) {
        // Roll back the just-created product so we never leave a broken
        // hasVariants:true product with zero variants behind.
        await Product.findByIdAndDelete(product._id);
        return res.status(400).json({
          success: false,
          message: variantError.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 GET ALL PRODUCTS
export const getAllProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};
    let andConditions = [];

    // 🔍 SEARCH (SAFE)
    if (req.query.search && req.query.search.trim() !== "") {
      const search = req.query.search.trim();

      andConditions.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          /^\d+$/.test(search) ? { hsn: Number(search) } : null
        ].filter(Boolean)
      });
    }

    // 📂 CATEGORY
    if (req.query.category) {
      andConditions.push({
        category: {
          $in: [new mongoose.Types.ObjectId(req.query.category)]
        }
      });
    }

    // 📢 STATUS (published/unpublished only here)
    if (req.query.status === "published") {
      andConditions.push({ isPublished: true });
    }

    if (req.query.status === "unpublished") {
      andConditions.push({ isPublished: false });
    }

    // FINAL QUERY
    if (andConditions.length > 0) {
      query = { $and: andConditions };
    }

    const total = await Product.countDocuments(query);

    // 💰 SORT (SAFE)
    let sortOption = {};

    if (req.query.sort === "low") {
      sortOption = { price: 1 };
    } else if (req.query.sort === "high") {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 }; // default
    }

    // 🔥 MAIN AGGREGATION
    const products = await Product.aggregate([

      { $match: query },

      // ✅ variants
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "productId",
          as: "variants"
        }
      },

      // ✅ category (ADD THIS)
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $addFields: {
          totalStock: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: {
                $sum: "$variants.quantity"
              },
              else: "$quantity"
            }
          }
        }
      },
      {
        $addFields: {
          sortPrice: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: { $min: "$variants.price" }, // lowest variant price
              else: "$price"
            }
          },
          minPrice: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: { $min: "$variants.price" },
              else: "$price"
            }
          },
          maxPrice: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: { $max: "$variants.price" },
              else: "$price"
            }
          },
          minSalePrice: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: { $min: "$variants.salePrice" },
              else: "$salePrice"
            }
          },
          maxSalePrice: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: { $max: "$variants.salePrice" },
              else: "$salePrice"
            }
          }
        }
      },


      // 📦 STOCK FILTER (IMPORTANT)
      ...(req.query.status === "outofstock"
        ? [{ $match: { totalStock: 0 } }]
        : []),

      ...(req.query.status === "selling"
        ? [{ $match: { totalStock: { $gt: 0 } } }]
        : []),

      // ✅ SAFE SORT
      ...(Object.keys(sortOption).length > 0
        ? [{ $sort: sortOption }]
        : []),

      // 📄 PAGINATION
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProduct: total,
      data: products
    });

  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



// 🔹 GET ONE PRODUCT + VARIANTS
export const getOneProduct = async (req, res) => {
  try {
    const product = mongoose.Types.ObjectId.isValid(req.params.id)
      ? await Product.findById(req.params.id).populate("brand category client")
      : await Product.findOne({ slug: req.params.id }).populate("brand category client");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const variants = await Variant.find({
      productId: product._id
    }).populate("attributes.attributeId");

    res.status(200).json({
      success: true,
      data: {
        product,
        variants
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    const {
      title,
      description,
      metaTitle,
      metaDescription,
      price,
      salePrice,
      gst,
      quantity,
      category,
      client,
      brand,
      hsn,
      deliveryCharge,
      referenceNo,
      moq,
      packing,
      codAvailable,
      tags,
      hasVariants,
      isPublished,
      existingImages,
      homeSections,
      variants
    } = req.body;

    // ================= IMAGE FIX =================
    let oldImages = existingImages || [];

    if (!Array.isArray(oldImages)) {
      oldImages = [oldImages];
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file =>
        file.path.replace(/\\/g, "/")
      );

      product.images = [...oldImages, ...newImages];
    } else {
      product.images = oldImages;
    }

    // ================= DATA UPDATE =================
    if (title) {
      product.title = title;
      product.slug = slugify(title, { lower: true });
    }

    if (description) product.description = description;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDescription) product.metaDescription = metaDescription;

    const finalHasVariants =
      hasVariants === true || hasVariants === "true"
        ? true
        : hasVariants === false || hasVariants === "false"
          ? false
          : product.hasVariants;


    if (!finalHasVariants) {
      product.price = Number(price || 0);
      product.salePrice = Number(salePrice || 0);
      product.quantity = Number(quantity || 0);
    } else {
      if (price !== "" && price !== undefined) {
        product.price = Number(price);
      }

      if (salePrice !== "" && salePrice !== undefined) {
        product.salePrice = Number(salePrice);
      }

      if (quantity !== "" && quantity !== undefined) {
        product.quantity = Number(quantity);
      }
    }
    if (homeSections) {
      product.homeSections = JSON.parse(homeSections);
    }
    if (typeof gst !== "undefined") product.gst = gst;
    if (category) product.category = category;
    if (client) product.client = client;
    if (brand) product.brand = brand;
    if (hsn) product.hsn = hsn;
    if (deliveryCharge) product.deliveryCharge = deliveryCharge;
    if (referenceNo) product.referenceNo = referenceNo;
    if (moq) product.moq = moq;
    if (packing) product.packing = packing;
    if (typeof codAvailable !== "undefined") product.codAvailable = codAvailable;
    if (tags) product.tags = tags;
    if (typeof hasVariants !== "undefined") product.hasVariants = hasVariants;
    if (typeof isPublished !== "undefined") product.isPublished = isPublished;

    // Validate the in-memory product changes before touching the Variant
    // collection: syncProductVariants deletes/inserts real documents with no
    // surrounding DB transaction (standalone MongoDB), so if we synced variants
    // first and THEN found the product itself invalid, the variants would be
    // left updated while the product's own field changes were silently lost.
    await product.validate();

    if (finalHasVariants && variants !== undefined) {
      try {
        const parsedVariants = JSON.parse(variants);
        if (Array.isArray(parsedVariants)) {
          await syncProductVariants(product._id, parsedVariants);
        }
      } catch (variantError) {
        return res.status(400).json({
          success: false,
          message: variantError.message,
        });
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const { isPublished } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isPublished },
      { returnDocument: "after" }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Publish status updated",
      data: product,
    });
  } catch (err) {
    console.error("Toggle Publish Error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Server Error",
    });
  }
};



// 🔹 CREATE / UPDATE VARIANTS (standalone route — product create/update now
// handles this inline for atomicity; kept for backward compatibility)
export const createVariants = async (req, res) => {
  try {
    const { productId, variants } = req.body;

    if (!productId || !variants || !Array.isArray(variants)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }

    const created = await syncProductVariants(productId, variants);

    res.status(201).json({
      success: true,
      data: created,
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate SKU or combination found",
      });
    }

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


export const exportProductsCSV = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("brand")
      .populate("category")
      .populate("client")
      .lean();

    const variants = await Variant.find()
      .populate("attributes.attributeId")
      .lean();

    let rows = [];

    products.forEach(p => {
      const productVariants = variants.filter(
        v => v.productId.toString() === p._id.toString()
      );

      const base = {
        title: p.title,
        description: p.description,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        price: p.price,
        salePrice: p.salePrice,
        quantity: p.quantity,
        hsn: p.hsn,
        gst: p.gst,
        moq: p.moq,
        packing: p.packing,
        deliveryCharge: p.deliveryCharge,
        referenceNo: p.referenceNo,
        codAvailable: p.codAvailable,
        isPublished: p.isPublished,
        brand: p.brand?.name || "",
        category: p.category?.map(c => c.name).join("|") || "",
        client: p.client?.name || "",
        images: p.images?.join("|") || ""
      };

      if (productVariants.length === 0) {
        rows.push({
          ...base,
          hasVariants: false
        });
      }

      productVariants.forEach(v => {
        rows.push({
          ...base,
          hasVariants: true,
          price: v.price,
          salePrice: v.salePrice,
          quantity: v.quantity,
          attributes: v.attributes
            ?.map(a => `${a.attributeId.displayName}:${a.value}`)
            .join("|")
        });
      });
    });

    const { Parser } = await import("json2csv");

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("products.csv");
    res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


export const importProductsCSV = async (req, res) => {
  try {
    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {

        const productMap = {}; // 🔥 grouping

        for (let row of results) {
          try {
            if (!row.title) continue;

            let product = productMap[row.title];

            // ================= PRODUCT CREATE / GET =================
            if (!product) {

              const categoryDoc = await Category.findOne({
                name: row.category
              });

              if (!categoryDoc) {
                console.log("❌ Category not found:", row.category);
                continue;
              }

              let brandDoc = null;
              if (row.brand) {
                brandDoc = await Brand.findOne({ name: row.brand });
              }

              const slug = slugify(row.title + "-" + Date.now(), { lower: true });

              let existingProduct = await Product.findOne({ title: row.title });

              if (!existingProduct) {
                product = await Product.create({
                  title: row.title,
                  slug,
                  description: row.description || "",
                  metaTitle: row.metaTitle || "",
                  metaDescription: row.metaDescription || "",

                  price: row.hasVariants === "true" ? 0 : Number(row.price || 0),
                  salePrice: row.hasVariants === "true" ? 0 : Number(row.salePrice || 0),
                  quantity: row.hasVariants === "true" ? 0 : Number(row.quantity || 0),

                  
                  hsn: Number(row.hsn || 0),
                  gst: Number(row.gst || 0),

                  packing: row.packing || "",
                  deliveryCharge: Number(row.deliveryCharge || 0),
                  referenceNo: row.referenceNo || "",

                  // 🔥 IMAGE FIX (IMPORTANT)
                  images: row.images
                    ? row.images.split("|").filter(Boolean)
                    : [],

                  category: [categoryDoc._id],
                  brand: brandDoc?._id || null,

                  hasVariants: row.hasVariants === "true",
                  isPublished: row.isPublished !== "false"
                });

              } else {
                product = existingProduct;

                // 🔥 IMAGE FIX (variant वाले case के लिए)
                if (row.images) {
                  const csvImages = row.images.split("|").filter(Boolean);

                  if (!product.images || product.images.length === 0) {
                    product.images = csvImages;
                  } else if (!product.images[0]) {
                    product.images = csvImages;
                  }

                  await product.save();
                }
              }

              // 🔥 ALWAYS MAP (IMPORTANT)
              productMap[row.title] = product;
            }

            // ================= VARIANTS =================
            if (row.hasVariants === "true" && row.attributes) {

              const values = row.attributes.split("|");

              const attrs = [];

              for (let val of values) {
                const [attrName, attrValue] = val.split(":");

                const attrDoc = await Attribute.findOne({
                  displayName: attrName
                });

                if (!attrDoc) {
                  console.log("❌ Attribute not found:", attrName);
                  continue;
                }

                attrs.push({
                  attributeId: attrDoc._id,
                  value: attrValue
                });
              }

              // 🔹 combination (only values)
              const cleanValues = values.map(v => {
                const parts = v.split(":");
                return parts[1] || parts[0];
              });

              const combination = cleanValues.join("-");

              // 🔥 avoid duplicate variants
              const existingVariant = await Variant.findOne({
                productId: product._id,
                combination
              });

              if (!existingVariant) {
                await Variant.create({
                  productId: product._id,
                  combination,
                  attributes: attrs,
                  price: Number(row.price || 0),
                  salePrice: Number(row.salePrice || 0),
                  quantity: Number(row.quantity || 0),
                  // sku: row.sku || ""
                });
              }
            }

          } catch (err) {
            console.log("❌ IMPORT ERROR:", err.message);
          }
        }

        res.json({
          success: true,
          message: "Import completed successfully"
        });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// 🔹 DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        try {
          if (fs.existsSync(img)) {
            fs.unlinkSync(img);
          }
        } catch (err) {
          console.log("Image delete error:", err.message);
        }
      });
    }

    await Variant.deleteMany({ productId: product._id });

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkDeleteProducts = async (req, res) => {
  try {
    const ids = req.body?.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid IDs"
      });
    }

    await Product.deleteMany({ _id: { $in: ids } });

    await Variant.deleteMany({ productId: { $in: ids } });

    res.json({
      success: true,
      message: "Products deleted"
    });

  } catch (error) {
    console.error("BULK DELETE ERROR:", error); // 👈 CHECK THIS
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProductsBySection = async (req, res) => {
  try {
    const { section } = req.params;

    const products = await Product.find({
      homeSections: section,
      isPublished: true,
    })
      .populate("brand")
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    const variantProductIds = products.filter((p) => p.hasVariants).map((p) => p._id);

    let variantsByProduct = {};
    if (variantProductIds.length > 0) {
      const variants = await Variant.find({
        productId: { $in: variantProductIds },
        isActive: true,
      }).lean();

      variantsByProduct = variants.reduce((acc, v) => {
        const key = v.productId.toString();
        (acc[key] = acc[key] || []).push(v);
        return acc;
      }, {});
    }

    const data = products.map((p) => {
      const variants = variantsByProduct[p._id.toString()] || [];
      if (!p.hasVariants || variants.length === 0) {
        return { ...p, minPrice: p.price, maxPrice: p.price, totalStock: p.quantity };
      }
      const prices = variants.map((v) => v.price);
      return {
        ...p,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        totalStock: variants.reduce((sum, v) => sum + (v.quantity || 0), 0),
      };
    });

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};