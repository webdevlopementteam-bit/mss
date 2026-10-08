import { useEffect, useState } from "react";
import API from "./axios";
import { contactinfo } from "../data";
import bannerVideo from "../assets/videobanner.mp4";

/* Admin-managed site content (Store Customization in the admin panel).
 * Every request is cached for the page's lifetime, so the header, footer
 * and page bodies share a single fetch. Whatever the admin never filled in
 * comes back as null and callers fall back to the built-in content. */

const ALL_KEYS = ["about", "faq", "privacy", "terms", "refund", "contact", "seo"];
let sitePromise = null;
let homePromise = null;

const fetchSite = () => {
  if (!sitePromise) {
    sitePromise = API.get(`/cms/site?keys=${ALL_KEYS.join(",")}`)
      .then((res) => res.data || {})
      .catch(() => {
        sitePromise = null; // allow a retry on the next mount
        return {};
      });
  }
  return sitePromise;
};

export const fetchHomeCms = () => {
  if (!homePromise) {
    homePromise = API.get("/cms/home")
      .then((res) => res.data || {})
      .catch(() => {
        homePromise = null;
        return {};
      });
  }
  return homePromise;
};

const useAsync = (loader, pick) => {
  const [state, setState] = useState({ data: null, loading: true });
  useEffect(() => {
    let alive = true;
    loader().then((all) => alive && setState({ data: pick(all) ?? null, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
};

/** { data, loading } for one Site CMS section ("about", "faq", "contact", …). */
export const useSiteContent = (key) => useAsync(fetchSite, (all) => all[key]);

/** { data, loading } for the Home CMS document (banners, video, gallery…). */
export const useHomeCms = () => useAsync(fetchHomeCms, (all) => all);

const DEFAULT_CONTACT = {
  phone: contactinfo[0].phone,
  email: contactinfo[0].email,
  address: contactinfo[0].address,
  hours: contactinfo[0].time,
  availability: contactinfo[0].availability,
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.6512294263116!2d77.30536750946962!3d28.64021332555896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfb3f3d95f0bb%3A0xd06142fa0b7860e5!2sMEDICAL%20%26%20SURGICAL%20SOLUTIONS!5e0!3m2!1sen!2sin!4v1770013271819!5m2!1sen!2sin",
  footerAbout:
    "Medical & Surgical Solutions — a trusted partner for healthcare professionals, hospitals and institutions, delivering genuine medical and surgical supplies across India.",
  facebook: "https://www.facebook.com/people/Medical-and-Surgical-Solutions/61571157007880/",
  youtube: "https://www.youtube.com/@MEDICALANDSURGICALSOLUTIONS",
  instagram: "https://www.instagram.com/mssofficial2011/",
  linkedin: "https://www.linkedin.com/company/medical-surgical-solutions/",
};

/** Business contact details: admin values where filled, built-in otherwise. */
export const useContactInfo = () => {
  const { data } = useSiteContent("contact");
  const merged = { ...DEFAULT_CONTACT };
  if (data) {
    Object.entries(data).forEach(([k, v]) => {
      // Social links may be deliberately blanked (hides the icon); other
      // fields fall back to the default when left empty.
      if (["facebook", "youtube", "instagram", "linkedin"].includes(k)) merged[k] = v ?? "";
      else if (v) merged[k] = v;
    });
  }
  merged.tel = `tel:${String(merged.phone).replace(/[^\d+]/g, "")}`;
  return merged;
};

/** Resolve an uploaded file path ("/uploads/…") to a full URL. */
export const cmsMedia = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_IMAGE_BASE_URL || "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

/* Video uploaded in admin → Store Customization → Home → Home Video Banner;
 * falls back to the bundled video until one is uploaded. */
export const useBannerVideo = () => {
  const { data, loading } = useHomeCms();
  const url = data?.videoBanner?.url;
  return {
    loading,
    src: url ? cmsMedia(url) : bannerVideo,
    poster: data?.videoBanner?.poster ? cmsMedia(data.videoBanner.poster) : undefined,
  };
};
