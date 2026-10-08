import SiteCMS from "../models/siteCMS.js";

export const SITE_CMS_KEYS = ["about", "faq", "privacy", "terms", "refund", "contact", "seo"];

// GET /api/cms/site?keys=contact,seo  → { contact: {...}, seo: {...} }
// Keys that were never saved come back as null so the storefront can fall
// back to its built-in content.
export const getSiteCmsMany = async (req, res) => {
  try {
    const requested = String(req.query.keys || "")
      .split(",")
      .map((k) => k.trim())
      .filter((k) => SITE_CMS_KEYS.includes(k));
    const keys = requested.length ? requested : SITE_CMS_KEYS;

    const docs = await SiteCMS.find({ key: { $in: keys } }).lean();
    const out = Object.fromEntries(keys.map((k) => [k, null]));
    docs.forEach((d) => {
      out[d.key] = d.data;
    });
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/cms/site/:key → saved data or null
export const getSiteCms = async (req, res) => {
  try {
    const { key } = req.params;
    if (!SITE_CMS_KEYS.includes(key)) {
      return res.status(404).json({ message: "Unknown CMS section" });
    }
    const doc = await SiteCMS.findOne({ key }).lean();
    res.json({ key, data: doc ? doc.data : null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cms/site/:key  body: { data: {...} }  (admin only)
export const saveSiteCms = async (req, res) => {
  try {
    const { key } = req.params;
    if (!SITE_CMS_KEYS.includes(key)) {
      return res.status(404).json({ message: "Unknown CMS section" });
    }
    const data = req.body?.data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({ message: "`data` must be an object" });
    }

    const doc = await SiteCMS.findOneAndUpdate(
      { key },
      { key, data },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({ key, data: doc.data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
