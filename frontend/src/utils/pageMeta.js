// No SEO/meta-tag library exists in this app yet (plain Vite SPA, no SSR) —
// this sets document.title and upserts <meta name="description"> directly
// rather than adding a new dependency (e.g. react-helmet) for a single page.
const DEFAULT_TITLE = "Medical Surgical Solutions";

export const setPageMeta = ({ title, description }) => {
  document.title = title || DEFAULT_TITLE;

  let tag = document.querySelector('meta[name="description"]');
  if (description) {
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", description);
  } else if (tag) {
    tag.remove();
  }
};

// Called on unmount so navigating away from a product page doesn't leave its
// title/description stuck on whatever page comes next.
export const resetPageMeta = () => {
  document.title = DEFAULT_TITLE;
  const tag = document.querySelector('meta[name="description"]');
  if (tag) tag.remove();
};
