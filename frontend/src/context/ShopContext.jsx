import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const ShopContext = createContext();

// Canonical product identifier. Real (MongoDB-backed) products only ever carry
// `_id` over the API — Mongoose's `.id` virtual is stripped by `res.json()`
// unless the schema opts into `toJSON({ virtuals: true })`, which this project's
// productModel does not. Only the legacy local `data.js` dummy products carry a
// plain `id`. Every cart/wishlist comparison must resolve through this helper so
// two different real products (both otherwise missing `.id`) are never treated
// as the same item.
export const getProductId = (product) => product?._id ?? product?.id ?? null;

// Cart line identifier. For a variable product, different variants of the
// SAME product must land in different cart lines (e.g. 10gm and 50gm of the
// same protein powder), so the line id combines product id + variant id.
// Simple products (no variant) key off the product id alone, unchanged.
export const getCartLineId = (product, variant) =>
  variant ? `${getProductId(product)}::${variant._id || variant.combination}` : getProductId(product);

// A cart line's unit price always comes from its variant (if any) first —
// the base product's price/salePrice are meaningless for variable products.
export const getLineUnitPrice = (item) =>
  item.variant
    ? Number(item.variant.salePrice || item.variant.price || 0)
    : Number(item.salePrice ?? item.price ?? 0);

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const data = localStorage.getItem("wishlist");
    return data ? JSON.parse(data) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // `variant` is optional — omitted (or undefined) for simple products, which
  // keeps every existing call site (product grids, etc.) working unchanged.
  const addToCart = (product, variant) => {
    const lineId = getCartLineId(product, variant);
    const exists = cart.find((item) => getCartLineId(item, item.variant) === lineId);
    if (exists) {
      setCart(
        cart.map((item) =>
          getCartLineId(item, item.variant) === lineId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`${product.title ?? product.name} quantity updated 🛒`);
    } else {
      setCart([...cart, { ...product, variant, quantity: 1 }]);
      toast.success(`${product.title ?? product.name} added to cart 🛒`);
    }
  };

  const removeFromCart = (lineId) => {
    setCart(cart.filter((item) => getCartLineId(item, item.variant) !== lineId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // ✅ Added: update quantity directly from Cart page
  const updateQuantity = (lineId, newQty) => {
    if (newQty < 1) return; // safety guard
    setCart(
      cart.map((item) =>
        getCartLineId(item, item.variant) === lineId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const addToWishlist = (product) => {
    const productId = getProductId(product);
    const exists = wishlist.find((item) => getProductId(item) === productId);
    if (!exists) {
      setWishlist([...wishlist, product]);
      toast.success(`${product.title ?? product.name} added to wishlist ❤️`);
    } else {
      toast.info("This product is already in your wishlist.");
    }
  };

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter((item) => getProductId(item) !== id));
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
