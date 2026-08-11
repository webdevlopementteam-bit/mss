import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subcategoryModel.js";
import Brand from "../models/brandModel.js";
import Company from "../models/companyModel.js";
import Attribute from "../models/attributeModel.js";
import fs from "fs";
import slugify from "slugify";
import mongoose from "mongoose";
import { Parser } from "json2csv";
import csv from "csv-parser";
import XLSX from "xlsx";

// Resolves the final URL slug for a product: a non-empty admin-provided
// custom slug wins (sanitized via slugify so invalid characters can never
// reach the database); otherwise falls back to auto-generating one from the
// title, exactly like the pre-existing behavior. Shared by createProduct and
// updateProduct so both enforce the same uniqueness/validation rules.
const resolveProductSlug = async ({ rawSlug, title, excludeId }) => {
  const trimmed = typeof rawSlug === "string" ? rawSlug.trim() : "";
  const base = trimmed || title;

  if (!base) {
    throw new Error("A product title or custom slug is required to generate a URL slug.");
  }

  const candidate = slugify(base, { lower: true, strict: true, trim: true });

  if (!candidate) {
    throw new Error("The custom slug contains no valid characters.");
  }

  const query = { slug: candidate };
  if (excludeId) query._id = { $ne: excludeId };

  const clash = await Product.findOne(query).select("_id");
  if (clash) {
    throw new Error(`The URL slug "${candidate}" is already used by another product. Please choose a different one.`);
  }

  return candidate;
};

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
      sku: v.sku || combination,
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
      subcategory,
      company,
      brand,
      fsn,
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
      variants,
      slug: slugInput
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

    let slug;
    try {
      slug = await resolveProductSlug({ rawSlug: slugInput, title, excludeId: null });
    } catch (slugErr) {
      return res.status(400).json({
        success: false,
        message: slugErr.message,
      });
    }

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
      subcategory: subcategory || undefined,
      company: company || undefined,
      brand: brand || undefined,
      fsn,
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

    // 📂 CATEGORY — accepts one id or a comma-separated list (shop filter
    // sidebar sends multiple selected categories at once).
    if (req.query.category) {
      const categoryIds = req.query.category
        .split(",")
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (categoryIds.length > 0) {
        andConditions.push({ category: { $in: categoryIds } });
      }
    }

    // 🏷️ BRAND — same comma-separated-list pattern as category.
    if (req.query.brand) {
      const brandIds = req.query.brand
        .split(",")
        .map((id) => id.trim())
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (brandIds.length > 0) {
        andConditions.push({ brand: { $in: brandIds } });
      }
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

    // 💰 SORT (SAFE) — sorts on sortPrice (computed below: lowest variant
    // price for variable products, else the base price) rather than the raw
    // `price` field, which is always 0 on variable products and would
    // otherwise make low/high sorting meaningless for them.
    let sortOption = {};

    if (req.query.sort === "low") {
      sortOption = { sortPrice: 1 };
    } else if (req.query.sort === "high") {
      sortOption = { sortPrice: -1 };
    } else {
      sortOption = { createdAt: -1 }; // default
    }

    // 💵 PRICE RANGE (shop filter sidebar) — applied against sortPrice so it
    // works the same way for both simple and variable products.
    const minPriceFilter = req.query.minPrice !== undefined ? Number(req.query.minPrice) : null;
    const maxPriceFilter = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : null;
    const priceMatch = {};
    if (minPriceFilter !== null && !isNaN(minPriceFilter)) {
      priceMatch.$gte = minPriceFilter;
    }
    if (maxPriceFilter !== null && !isNaN(maxPriceFilter)) {
      priceMatch.$lte = maxPriceFilter;
    }

    // 🔥 MAIN AGGREGATION (shared pipeline before pagination/count fork below)
    const basePipeline = [

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
          // Effective (customer-facing) price per variant: its salePrice when
          // one is actually set, else its regular price — a raw $min/$max
          // over variants.salePrice would wrongly treat an unset/0 salePrice
          // as cheaper than every real price.
          minSalePrice: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: {
                $min: {
                  $map: {
                    input: "$variants",
                    as: "v",
                    in: {
                      $cond: [{ $gt: ["$$v.salePrice", 0] }, "$$v.salePrice", "$$v.price"]
                    }
                  }
                }
              },
              else: { $cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"] }
            }
          },
          maxSalePrice: {
            $cond: {
              if: { $gt: [{ $size: "$variants" }, 0] },
              then: {
                $max: {
                  $map: {
                    input: "$variants",
                    as: "v",
                    in: {
                      $cond: [{ $gt: ["$$v.salePrice", 0] }, "$$v.salePrice", "$$v.price"]
                    }
                  }
                }
              },
              else: { $cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"] }
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

      // 💵 PRICE RANGE FILTER
      ...(Object.keys(priceMatch).length > 0
        ? [{ $match: { sortPrice: priceMatch } }]
        : []),
    ];

    // $facet runs the paginated-data branch and a count branch off the SAME
    // filtered pipeline, so totalPages/totalProduct stay accurate even though
    // stock/price filters are only knowable after the variants lookup above
    // (a plain Product.countDocuments(query) can't see those).
    const [result] = await Product.aggregate([
      ...basePipeline,
      {
        $facet: {
          data: [
            ...(Object.keys(sortOption).length > 0 ? [{ $sort: sortOption }] : []),
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    const products = result.data;
    const total = result.totalCount[0]?.count || 0;

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
      ? await Product.findById(req.params.id).populate("brand category subcategory company")
      : await Product.findOne({ slug: req.params.id }).populate("brand category subcategory company");

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
      subcategory,
      company,
      brand,
      fsn,
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
      variants,
      slug: slugInput
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
    }

    // Custom slug (optional): a non-empty admin-provided value wins
    // (validated + sanitized); left blank -> auto-generate from the
    // (possibly just-updated) title. Only touched when the field is present
    // in this request at all, so callers that don't send it (e.g. bulk CSV
    // import) leave the existing slug untouched, same as before this field existed.
    if (slugInput !== undefined) {
      try {
        product.slug = await resolveProductSlug({
          rawSlug: slugInput,
          title: title || product.title,
          excludeId: product._id,
        });
      } catch (slugErr) {
        return res.status(400).json({
          success: false,
          message: slugErr.message,
        });
      }
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
    if (subcategory) product.subcategory = subcategory;
    if (company) product.company = company;
    if (brand) product.brand = brand;
    if (typeof fsn !== "undefined") product.fsn = fsn;
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
      .populate("company")
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
        fsn: p.fsn,
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
        company: p.company?.name || "",
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
          sku: v.sku || v.combination,
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


const IMPORT_PLACEHOLDER_IMAGE = "uploads/products/import-placeholder.png";

const getCell = (row, keys, fallback = "") => {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== "") {
      return row[key];
    }
  }
  return fallback;
};

const cleanText = (value) => String(value ?? "").trim();

const toNumber = (value, fallback = 0) => {
  if (value === "" || value === undefined || value === null) return fallback;
  const normalized = typeof value === "string"
    ? value
        .split(/,\s+/)[0]
        .replace(/[₹%,\s]/g, "")
    : value;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : fallback;
};

const toBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "show"].includes(String(value).trim().toLowerCase());
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const splitList = (value, pattern = /[|,]/) =>
  cleanText(value)
    .split(pattern)
    .map((item) => item.trim())
    .filter(Boolean);

const splitSkuVariants = (value) => {
  const values = [];

  for (const item of splitList(value, /,/)) {
    if (item.includes("/") && !/\d/.test(item)) {
      values.push(...splitList(item, /\//));
    } else {
      values.push(item);
    }
  }

  return [...new Set(values)];
};

const splitNumberValues = (value) => {
  const raw = cleanText(value);
  if (!raw) return [];

  return raw
    .split(/,\s+/)
    .map((item) => toNumber(item, null))
    .filter((item) => item !== null);
};

const getIndexedValue = (values, index, fallback) =>
  values[index] !== undefined ? values[index] : fallback;

const uniqueSlug = async (Model, baseText, excludeId = null) => {
  const base = slugify(baseText || "item", { lower: true, strict: true, trim: true }) || "item";
  let slug = base;
  let suffix = 1;

  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await Model.findOne(query).select("_id");
    if (!existing) return slug;
    slug = `${base}-${suffix++}`;
  }
};

const findByName = (Model, name) =>
  Model.findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } });

const ensureCategory = async (name) => {
  const cleanName = cleanText(name) || "Uncategorized";
  const existing = await findByName(Category, cleanName);
  if (existing) return existing;

  return Category.create({
    name: cleanName,
    slug: await uniqueSlug(Category, cleanName),
    description: cleanName,
    image: IMPORT_PLACEHOLDER_IMAGE,
    isPublished: true,
  });
};

const ensureSubcategory = async (name, categoryId) => {
  const cleanName = cleanText(name);
  if (!cleanName) return null;

  const existing = await Subcategory.findOne({
    name: { $regex: `^${escapeRegex(cleanName)}$`, $options: "i" },
    category: categoryId,
  });
  if (existing) return existing;

  return Subcategory.create({
    name: cleanName,
    slug: await uniqueSlug(Subcategory, cleanName),
    description: cleanName,
    image: IMPORT_PLACEHOLDER_IMAGE,
    category: categoryId,
    isPublished: true,
  });
};

const ensureBrand = async (name) => {
  const cleanName = cleanText(name);
  if (!cleanName) return null;

  const existing = await findByName(Brand, cleanName);
  if (existing) return existing;

  return Brand.create({
    name: cleanName,
    description: cleanName,
    image: IMPORT_PLACEHOLDER_IMAGE,
    isPublished: true,
  });
};

const ensureCompany = async (name) => {
  const cleanName = cleanText(name);
  if (!cleanName) return null;

  const existing = await findByName(Company, cleanName);
  if (existing) return existing;

  return Company.create({
    name: cleanName,
    image: IMPORT_PLACEHOLDER_IMAGE,
  });
};

const ensureSkuAttribute = async (values) => {
  const uniqueValues = [...new Set(values.map(cleanText).filter(Boolean))];
  let attribute = await Attribute.findOne({ title: "sku" });

  if (!attribute) {
    return Attribute.create({
      title: "sku",
      displayName: "SKU",
      variants: uniqueValues.length ? uniqueValues : ["Default"],
    });
  }

  const merged = [...new Set([...(attribute.variants || []), ...uniqueValues])];
  if (merged.length !== attribute.variants.length) {
    attribute.variants = merged;
    await attribute.save();
  }

  return attribute;
};

const parseImportRows = async (filePath, originalName = "") => {
  const ext = originalName.split(".").pop()?.toLowerCase();

  if (["xlsx", "xls"].includes(ext)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames.find((name) => {
      const preview = XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: "", raw: false, range: 0, header: 1 });
      return preview.some((row) =>
        row.some((cell) => ["title", "product name"].includes(cleanText(cell).toLowerCase()))
      );
    }) || workbook.SheetNames[0];

    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "", raw: false });
  }

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("error", reject)
      .on("end", () => resolve(results));
  });
};

const normalizeImportRow = (row) => {
  const rawPrice = getCell(row, ["price", "MRP"]);
  const rawSalePrice = getCell(row, ["salePrice", "sale_price", "NEW RATE"]);
  const skuValues = splitSkuVariants(getCell(row, ["sku", "SKU"]));
  const title = cleanText(getCell(row, ["title", "Product Name", "productName", "name"]));
  const hasVariants = skuValues.length > 0;

  return {
    sourceId: cleanText(getCell(row, ["id", "_id"])),
    title,
    description: cleanText(getCell(row, ["description", "Description"])) || title,
    metaTitle: cleanText(getCell(row, ["metaTitle", "metatitle"])),
    metaDescription: cleanText(getCell(row, ["metaDescription", "metadescription"])),
    price: toNumber(rawPrice),
    salePrice: toNumber(rawSalePrice),
    variantPrices: splitNumberValues(rawPrice),
    variantSalePrices: splitNumberValues(rawSalePrice),
    quantity: toNumber(getCell(row, ["quantity", "stock"])),
    fsn: cleanText(getCell(row, ["fsn", "FSN"])),
    hsn: toNumber(getCell(row, ["hsn"])),
    gst: toNumber(getCell(row, ["gst"])),
    moq: toNumber(getCell(row, ["moq"]), 1),
    packing: cleanText(getCell(row, ["packing"])),
    deliveryCharge: toNumber(getCell(row, ["deliveryCharge", "DeliveryCharge"])),
    referenceNo: cleanText(getCell(row, ["referenceNo", "product Refrence No", "productRefrenceNo"])),
    images: splitList(getCell(row, ["images"])),
    category: cleanText(getCell(row, ["category"])),
    subcategory: cleanText(getCell(row, ["subcategory", "Subcategory", "categories"])),
    brand: cleanText(getCell(row, ["brand", "BRAND"])),
    company: cleanText(getCell(row, ["company", "Company"])),
    codAvailable: toBoolean(getCell(row, ["codAvailable", "isCodAvaialble"]), true),
    isPublished: getCell(row, ["isPublished", "status"], "true") === "hide" ? false : toBoolean(getCell(row, ["isPublished", "status"], true), true),
    hasVariants,
    skuValues,
  };
};

const importProductRows = async (rows) => {
  const stats = {
    total: rows.length,
    imported: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    variantsCreated: 0,
    errors: [],
  };

  for (const rawRow of rows) {
    const row = normalizeImportRow(rawRow);
    if (!row.title) {
      stats.skipped += 1;
      continue;
    }

    try {
      const categoryDoc = await ensureCategory(row.category);
      const subcategoryDoc = await ensureSubcategory(row.subcategory, categoryDoc._id);
      const brandDoc = await ensureBrand(row.brand);
      const companyDoc = await ensureCompany(row.company);

      let existingProduct = null;
      if (row.sourceId && mongoose.Types.ObjectId.isValid(row.sourceId)) {
        existingProduct = await Product.findById(row.sourceId);
      } else if (row.referenceNo) {
        existingProduct = await Product.findOne({ referenceNo: row.referenceNo });
      } else {
        existingProduct = await Product.findOne({
          title: row.title,
          description: row.description,
          price: row.price,
        });
      }

      const productData = {
        title: row.title,
        description: row.description,
        metaTitle: row.metaTitle,
        metaDescription: row.metaDescription,
        price: row.price,
        salePrice: row.salePrice,
        quantity: row.quantity,
        fsn: row.fsn,
        hsn: row.hsn,
        gst: row.gst,
        moq: row.moq,
        packing: row.packing,
        deliveryCharge: row.deliveryCharge,
        referenceNo: row.referenceNo,
        category: [categoryDoc._id],
        subcategory: subcategoryDoc?._id,
        brand: brandDoc?._id,
        company: companyDoc?._id,
        codAvailable: row.codAvailable,
        isPublished: row.isPublished,
        hasVariants: row.hasVariants,
      };

      let product;
      if (existingProduct) {
        product = existingProduct;
        Object.entries(productData).forEach(([key, value]) => {
          if (value !== undefined && value !== "") product[key] = value;
        });
        if (row.images.length > 0) product.images = row.images;
        await product.save();
        stats.updated += 1;
      } else {
        product = await Product.create({
          ...productData,
          ...(row.sourceId && mongoose.Types.ObjectId.isValid(row.sourceId) ? { _id: row.sourceId } : {}),
          slug: await uniqueSlug(Product, `${row.title}-${row.referenceNo || row.sourceId || Date.now()}`),
          images: row.images,
        });
        stats.created += 1;
      }

      if (row.hasVariants) {
        const skuAttribute = await ensureSkuAttribute(row.skuValues);
        await Variant.deleteMany({ productId: product._id });

        const variantDocs = row.skuValues.map((value, index) => {
          const variantPrice = getIndexedValue(row.variantPrices, index, row.price);
          const variantSalePrice = getIndexedValue(row.variantSalePrices, index, row.salePrice);

          return {
            productId: product._id,
            combination: value,
            attributes: [{ attributeId: skuAttribute._id, value }],
            price: variantPrice,
            salePrice: variantSalePrice,
            quantity: row.quantity,
            sku: value,
            isActive: true,
          };
        });

        if (variantDocs.length > 0) {
          const inserted = await Variant.insertMany(variantDocs);
          stats.variantsCreated += inserted.length;
        }
      } else {
        await Variant.deleteMany({ productId: product._id });
      }

      stats.imported += 1;
    } catch (err) {
      stats.errors.push({ title: row.title, message: err.message });
    }
  }

  return stats;
};

export const importProductsCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Import file is required",
      });
    }

    const rows = await parseImportRows(req.file.path, req.file.originalname);
    const limit = Number(req.query.limit || 0);
    const selectedRows = limit > 0 ? rows.slice(0, limit) : rows;
    const stats = await importProductRows(selectedRows);

    res.json({
      success: stats.errors.length === 0,
      message: "Import completed",
      data: stats,
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
        const effective = p.salePrice > 0 ? p.salePrice : p.price;
        return {
          ...p,
          minPrice: p.price,
          maxPrice: p.price,
          minSalePrice: effective,
          maxSalePrice: effective,
          totalStock: p.quantity,
        };
      }
      const prices = variants.map((v) => v.price);
      // Effective (customer-facing) price per variant: its salePrice when
      // actually set, else its regular price — avoids an unset/0 salePrice
      // being wrongly treated as cheaper than every real price.
      const effectivePrices = variants.map((v) => (v.salePrice > 0 ? v.salePrice : v.price));
      return {
        ...p,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        minSalePrice: Math.min(...effectivePrices),
        maxSalePrice: Math.max(...effectivePrices),
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
