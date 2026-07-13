// Razorpay has no npm package for browser checkout — integration is via their
// hosted script exposing a global `window.Razorpay` constructor. Loaded once
// and cached so repeated checkout attempts don't re-inject the script tag.
let loadPromise = null;

export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadPromise;
};
