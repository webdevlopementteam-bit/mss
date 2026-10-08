// No SEO/meta-tag library exists in this app yet (plain Vite SPA, no SSR) —
// this sets document.title and upserts the meta/link tags directly rather
// than adding a new dependency (e.g. react-helmet).
const DEFAULT_TITLE = "Medical Surgical Solutions";

// Upserts <meta name|property="…" content="…">, or removes it when empty.
const setMetaTag = (attr, key, content) => {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (content) {
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, key);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  } else if (tag) {
    tag.remove();
  }
};

export const setPageMeta = ({ title, description, keywords }) => {
  document.title = title || DEFAULT_TITLE;
  setMetaTag("name", "description", description);
  setMetaTag("name", "keywords", keywords);
  setMetaTag("property", "og:title", title || DEFAULT_TITLE);
  setMetaTag("property", "og:description", description);
};

// Called on unmount so navigating away from a product page doesn't leave its
// title/description stuck on whatever page comes next.
export const resetPageMeta = () => {
  setPageMeta({ title: DEFAULT_TITLE });
};

// <link rel="canonical"> — always the clean URL of the current page (no query
// string or hash), so filtered/sorted shop URLs don't compete with the page.
export const setCanonical = (pathname) => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const href = `${window.location.origin}${clean}`;
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
  setMetaTag("property", "og:url", href);
};
