import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteContent } from "../api/siteContent";
import { setCanonical, setPageMeta } from "../utils/pageMeta";

// Route → SEO key edited in admin → Store Customization → SEO Settings.
const PAGE_KEYS = {
  "/": "home",
  "/shop": "shop",
  "/about": "about",
  "/contact": "contact",
  "/blog": "blog",
  "/faq": "faq",
  "/award": "award",
  "/privacy-policy": "privacy",
  "/terms-conditions": "terms",
  "/return-policy": "refund",
};

// Product and blog-post pages set their own title/description/keywords from
// the product's / post's SEO fields, so only the canonical is handled here.
const OWNS_META = [/^\/product\/[^/]+/, /^\/blog\/[^/]+/];

const SeoManager = () => {
  const { pathname } = useLocation();
  const { data: seo } = useSiteContent("seo");

  useEffect(() => {
    setCanonical(pathname);

    if (OWNS_META.some((re) => re.test(pathname))) return;

    const defaults = seo?.defaults || {};
    const page = seo?.pages?.[PAGE_KEYS[pathname.replace(/\/+$/, "") || "/"]] || {};
    setPageMeta({
      title: page.title || defaults.title,
      description: page.description || defaults.description,
      keywords: page.keywords || defaults.keywords,
    });
  }, [pathname, seo]);

  return null;
};

export default SeoManager;
