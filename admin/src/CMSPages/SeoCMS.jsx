import { useSiteCms, CmsHeader, Card, Field, TextInput, TextArea, SaveButton, Loading } from "./cmsShared";

// Keys must match frontend/src/components/SeoManager.jsx.
const SEO_PAGES = [
  { key: "home", name: "Home", path: "/" },
  { key: "shop", name: "Shop", path: "/shop" },
  { key: "about", name: "About Us", path: "/about" },
  { key: "contact", name: "Contact", path: "/contact" },
  { key: "blog", name: "Blog", path: "/blog" },
  { key: "faq", name: "FAQ", path: "/faq" },
  { key: "award", name: "Awards", path: "/award" },
  { key: "privacy", name: "Privacy Policy", path: "/privacy-policy" },
  { key: "terms", name: "Terms & Conditions", path: "/terms-conditions" },
  { key: "refund", name: "Return Policy", path: "/return-policy" },
];

const empty = { title: "", description: "", keywords: "" };

const DEFAULTS = {
  defaults: {
    title: "Medical Surgical Solutions",
    description: "",
    keywords: "",
  },
  pages: Object.fromEntries(SEO_PAGES.map((p) => [p.key, { ...empty }])),
};

const Counter = ({ value, max }) => {
  const n = (value || "").length;
  return <span className={`text-xs ${n > max ? "text-amber-400" : "text-white/40"}`}>{n}/{max} characters</span>;
};

const SeoFields = ({ value, onChange, titlePlaceholder }) => (
  <div className="space-y-4">
    <Field label="Meta title">
      <TextInput value={value.title} placeholder={titlePlaceholder} onChange={(v) => onChange({ ...value, title: v })} />
      <Counter value={value.title} max={60} />
    </Field>
    <Field label="Meta description">
      <TextArea rows={2} value={value.description} onChange={(v) => onChange({ ...value, description: v })} />
      <Counter value={value.description} max={160} />
    </Field>
    <Field label="Meta keywords" hint="Comma separated, e.g. surgical gloves, medical supplies, sutures">
      <TextInput value={value.keywords} onChange={(v) => onChange({ ...value, keywords: v })} />
    </Field>
  </div>
);

const SeoCMS = () => {
  const { data, set, loading, saving, save } = useSiteCms("seo", DEFAULTS);
  if (loading) return <Loading />;

  const pages = { ...DEFAULTS.pages, ...(data.pages || {}) };
  const setPage = (key, value) => set("pages", { ...pages, [key]: value });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <CmsHeader
        title="SEO Settings"
        subtitle="Title, description and keywords for each page. The canonical tag is added automatically from the page URL. Products and blog posts use their own SEO fields."
      />

      <Card title="Site defaults" hint="Used for any page that has no SEO of its own.">
        <SeoFields value={{ ...DEFAULTS.defaults, ...data.defaults }} onChange={(v) => set("defaults", v)} />
      </Card>

      {SEO_PAGES.map((p) => (
        <Card key={p.key} title={p.name} hint={p.path}>
          <SeoFields value={{ ...empty, ...pages[p.key] }} onChange={(v) => setPage(p.key, v)} titlePlaceholder="Leave empty to use the site default" />
        </Card>
      ))}

      <SaveButton saving={saving} onClick={() => save({ ...data, pages })}>Save SEO Settings</SaveButton>
    </div>
  );
};

export default SeoCMS;
