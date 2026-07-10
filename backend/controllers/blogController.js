import Blog from "../models/blogModel.js";
import fs from "fs";

// 🔹 slug generator
const slugify = (text) =>
  text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

// 🔹 CREATE
export const createBlog = async (req, res) => {
  try {
    const { name, description, metaTitle, metaDescription, isPublished } =
      req.body;

    if (
      !name ||
      !description ||
      !metaTitle ||
      !metaDescription ||
      typeof isPublished === "undefined" ||
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const slug = slugify(name);

    // duplicate slug check
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Blog already exists",
      });
    }

    const blog = await Blog.create({
      name,
      slug,
      description,
      metaTitle,
      metaDescription,
      isPublished,
      image: req.file.path.replace(/\\/g, "/"),
    });

    res.status(201).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 GET ALL
export const getAllBlog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      name: { $regex: search, $options: "i" },
    };

    const total = await Blog.countDocuments(query);

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlog: total,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 GET ONE
export const getOneBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY SLUG
export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 🔹 UPDATE
export const updateBlog = async (req, res) => {
  try {
    const { name, description, metaTitle, metaDescription, isPublished } =
      req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // image update
    if (req.file) {
      if (blog.image && fs.existsSync(blog.image)) {
        fs.unlinkSync(blog.image);
      }
      blog.image = req.file.path.replace(/\\/g, "/");
    }

    if (name) {
      blog.name = name;
      blog.slug = slugify(name);
    }

    if (description) blog.description = description;
    if (metaTitle) blog.metaTitle = metaTitle;
    if (metaDescription) blog.metaDescription = metaDescription;
    if (typeof isPublished !== "undefined") blog.isPublished = isPublished;

    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// 🔹 DELETE
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // delete image
    if (blog.image && fs.existsSync(blog.image)) {
      fs.unlinkSync(blog.image);
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
