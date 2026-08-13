import Product from "../models/productModel.js";
import Blog from "../models/blogModel.js";

// Single place to change if the storefront ever moves domains.
const SITE_URL = (process.env.SITE_URL || "https://medicalsurgicalsolutions.com").replace(/\/$/, "");

// Every public, indexable frontend route that isn't generated from the DB
// (cart/checkout/login/dashboard/etc. are personalized — no SEO value, so
// they're intentionally left out, same as they're excluded in robots.txt).
const STATIC_PAGES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/blog", changefreq: "daily", priority: "0.7" },
  { path: "/about", changefreq: "monthly", priority: "0.5" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/award", changefreq: "monthly", priority: "0.4" },
  { path: "/faq", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms-conditions", changefreq: "yearly", priority: "0.2" },
  { path: "/return-policy", changefreq: "yearly", priority: "0.2" },
];

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDateStamp = (date) => (date ? new Date(date).toISOString().split("T")[0] : undefined);

const urlEntry = ({ loc, lastmod, changefreq, priority }) =>
  [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

// 🔹 GET /api/sitemap.xml — regenerated fresh on every request from live
// published products + blogs, so it's never stale like a build-time file.
export const generateSitemap = async (req, res) => {
  try {
    const [products, blogs] = await Promise.all([
      Product.find({ isPublished: true }).select("slug updatedAt").lean(),
      Blog.find({ isPublished: true }).select("slug updatedAt").lean(),
    ]);

    const entries = [
      ...STATIC_PAGES.map((page) =>
        urlEntry({
          loc: `${SITE_URL}${page.path}`,
          changefreq: page.changefreq,
          priority: page.priority,
        })
      ),
      ...products
        .filter((p) => p.slug)
        .map((p) =>
          urlEntry({
            loc: `${SITE_URL}/product/${p.slug}`,
            lastmod: toDateStamp(p.updatedAt),
            changefreq: "weekly",
            priority: "0.8",
          })
        ),
      ...blogs
        .filter((b) => b.slug)
        .map((b) =>
          urlEntry({
            loc: `${SITE_URL}/blog/${b.slug}`,
            lastmod: toDateStamp(b.updatedAt),
            changefreq: "monthly",
            priority: "0.6",
          })
        ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>`;

    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
