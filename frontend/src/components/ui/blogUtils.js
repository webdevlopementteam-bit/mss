const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const blogImage = (img) => {
  if (!img) return "/no-image.png";
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

// blog.description is rich-text HTML from the admin panel.
export const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export const readMinutes = (html) => Math.max(1, Math.round(stripHtml(html).split(" ").length / 200));

export const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
