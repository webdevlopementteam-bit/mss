const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

export const resolveImage = (img) => {
  if (!img) return "/no-image.png";
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

export const formatINR = (value) =>
  Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Normalises the three pricing shapes the storefront sees (simple product,
// simple product on sale, variable product) into one object for display.
export const getPricing = (product) => {
  if (product.hasVariants) {
    const from = product.minSalePrice ?? product.minPrice ?? product.price;
    return { isVariable: true, current: Number(from || 0), mrp: 0, discount: 0 };
  }
  const price = Number(product.price || 0);
  const salePrice = Number(product.salePrice || 0);
  const onSale = salePrice > 0 && price > 0 && salePrice < price;
  return {
    isVariable: false,
    current: onSale ? salePrice : price,
    mrp: onSale ? price : 0,
    discount: onSale ? Math.round(((price - salePrice) / price) * 100) : 0,
  };
};

export const getCategoryName = (product) =>
  product.defaultCategory?.name ||
  (Array.isArray(product.category) ? product.category[0]?.name : product.category?.name) ||
  "";
