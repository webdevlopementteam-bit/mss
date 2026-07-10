import API from "./axios";

// Blogs
export const getBlogs = () => API.get("/blog"); 
export const getOneBlog = (slug) =>
  API.get(`/blog/slug/${slug}`);

export const getAwards = () => API.get("/award");

// PRODUCTS
export const getProducts = () => API.get("/products");
export const getProductById = (idOrSlug) => API.get(`/product/${idOrSlug}`);

// CATEGORIES (agar hai)
export const getCategories = () => API.get("/categories");