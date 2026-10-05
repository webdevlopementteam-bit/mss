import { Link } from "react-router-dom";
import { useShop, getCartLineId, getLineUnitPrice, getProductId } from "../context/ShopContext";
import { PageHeader, EmptyState } from "../components/ui/PageHeader";
import { formatINR } from "../components/ui/productUtils";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const getImage = (item) => {
  const img = item.images?.[0] || item.image;
  if (!img) return "/no-image.png";
  return img.startsWith("http") ? img : `${IMG_URL}/${img}`;
};

const TRUST = [
  ["fa-lock", "Secure payment"],
  ["fa-shield-heart", "Genuine products"],
  ["fa-truck-fast", "Fast delivery"],
];

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useShop();

  const subtotal = cart.reduce((total, item) => total + getLineUnitPrice(item) * item.quantity, 0);
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  // Delivery charge is a flat per-product handling fee set in the admin panel
  // (not multiplied by quantity — it's the cost to ship that product type),
  // summed across the distinct products in the cart.
  const shipping = cart.reduce((total, item) => total + (Number(item.deliveryCharge) || 0), 0);
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="bg-[#F6F7F9]">
        <PageHeader title="Shopping Cart" icon="fa-cart-shopping" />
        <EmptyState
          icon="fa-cart-shopping"
          title="Your cart is empty"
          text="Looks like you haven't added anything yet. Explore our range of genuine medical and surgical supplies."
        />
      </div>
    );
  }

  return (
    <div className="bg-[#F6F7F9] pb-14">
      <PageHeader
        title="Shopping Cart"
        icon="fa-cart-shopping"
        subtitle={`${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`}
      />

      <div className="px-4 md:px-6 lg:px-side pt-6 md:pt-8 grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
        {/* Items */}
        <div className="min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
            <div className="hidden md:grid grid-cols-[1fr_140px_110px_40px] gap-4 px-5 py-3 bg-[#FAFBFC] border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider !text-gray-400">
              <span className="!text-gray-400">Product</span>
              <span className="!text-gray-400 text-center">Quantity</span>
              <span className="!text-gray-400 text-right">Total</span>
              <span />
            </div>

            {cart.map((item) => {
              const lineId = getCartLineId(item, item.variant);
              const unit = getLineUnitPrice(item);
              const url = `/product/${item.slug || getProductId(item)}`;
              return (
                <div
                  key={lineId}
                  className="grid grid-cols-[72px_1fr_auto] md:grid-cols-[1fr_140px_110px_40px] gap-x-3 md:gap-4 gap-y-3 items-center px-4 md:px-5 py-4 border-b border-gray-100 last:border-0"
                >
                  {/* Product */}
                  <div className="contents md:flex md:items-center md:gap-4 md:min-w-0">
                    <Link to={url} className="row-span-2 md:row-span-1 shrink-0 w-[72px] h-[72px] md:w-20 md:h-20 rounded-xl bg-[#F6F7F9] overflow-hidden">
                      <img
                        src={getImage(item)}
                        alt={item.title ?? item.name}
                        onError={(e) => {
                          e.currentTarget.src = "/no-image.png";
                        }}
                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link to={url}>
                        <h3 className="text-sm md:text-[15px] font-semibold !text-gray-800 leading-snug line-clamp-2 hover:!text-primaryColor transition-colors">
                          {item.title ?? item.name}
                        </h3>
                      </Link>
                      {item.variant?.combination && (
                        <span className="inline-block mt-1 text-[11px] font-medium !text-gray-600 bg-gray-100 rounded px-1.5 py-0.5">
                          {item.variant.combination}
                        </span>
                      )}
                      <p className="mt-1 text-xs !text-gray-500">₹{formatINR(unit)} each</p>
                    </div>
                  </div>

                  {/* Remove — top-right on mobile, last column on desktop */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(lineId)}
                    aria-label="Remove item"
                    className="md:order-last self-start md:self-center w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 transition group/rm"
                  >
                    <i className="fa-regular fa-trash-can text-sm !text-gray-400 group-hover/rm:!text-red-500"></i>
                  </button>

                  {/* Quantity + line total (share a row on mobile) */}
                  <div className="col-start-2 col-span-2 md:col-span-1 md:col-start-auto flex md:justify-center items-center justify-between gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg h-9">
                      <button
                        type="button"
                        onClick={() => (item.quantity === 1 ? removeFromCart(lineId) : updateQuantity(lineId, item.quantity - 1))}
                        className="w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-l-lg"
                        aria-label="Decrease quantity"
                      >
                        <i className="fa-solid fa-minus text-[10px] !text-gray-600"></i>
                      </button>
                      <span className="w-9 text-center text-sm font-bold tabular-nums !text-gray-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(lineId, item.quantity + 1)}
                        className="w-9 h-full flex items-center justify-center hover:bg-gray-50 rounded-r-lg"
                        aria-label="Increase quantity"
                      >
                        <i className="fa-solid fa-plus text-[10px] !text-gray-600"></i>
                      </button>
                    </div>
                    <p className="md:hidden text-base font-bold !text-gray-900">₹{formatINR(unit * item.quantity)}</p>
                  </div>

                  <p className="hidden md:block text-right text-base font-bold !text-gray-900">
                    ₹{formatINR(unit * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>

          <Link
            to="/shop"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold !text-[#023350] hover:!text-primaryColor transition-colors"
          >
            <i className="fa-solid fa-arrow-left text-xs !text-inherit"></i>
            <span className="!text-inherit">Continue Shopping</span>
          </Link>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-6 bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
          <h2 className="px-5 py-4 border-b border-gray-100 bg-[#FAFBFC] text-base font-bold !text-[#023350]">Order Summary</h2>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="!text-gray-600">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
              <span className="font-semibold !text-gray-900">₹{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="!text-gray-600">Delivery</span>
              {shipping === 0 ? (
                <span className="font-semibold !text-green-600">Free</span>
              ) : (
                <span className="font-semibold !text-gray-900">₹{formatINR(shipping)}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="!text-gray-600">GST</span>
              <span className="text-xs !text-gray-500">Calculated at checkout</span>
            </div>
            <div className="pt-3 mt-1 border-t border-dashed border-gray-200 flex justify-between items-baseline">
              <span className="font-bold !text-gray-900">Estimated Total</span>
              <span className="text-xl font-extrabold !text-[#023350]">₹{formatINR(total)}</span>
            </div>

            <Link
              to="/checkout"
              className="!mt-5 flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primaryColor hover:bg-[#9e1d21] font-bold !text-white shadow-[0_10px_25px_-10px_rgba(181,35,39,0.7)] transition-colors"
            >
              Proceed to Checkout <i className="fa-solid fa-arrow-right text-xs !text-white"></i>
            </Link>

            <div className="pt-4 grid grid-cols-3 gap-2">
              {TRUST.map(([icon, label]) => (
                <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-[#F6F7F9] px-1 py-3 text-center">
                  <i className={`fa-solid ${icon} text-sm !text-secondaryColor`}></i>
                  <span className="text-[10.5px] font-medium leading-tight !text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
