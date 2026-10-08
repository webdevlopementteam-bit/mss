import { useState } from "react";
import RichTextEditor from "../components/RichTextEditor";
import { useSiteCms, CmsHeader, Card, Field, TextInput, SaveButton, Loading } from "./cmsShared";

const POLICIES = [
  { key: "privacy", name: "Privacy Policy", page: "/privacy-policy" },
  { key: "terms", name: "Terms & Conditions", page: "/terms-conditions" },
  { key: "refund", name: "Refund / Return Policy", page: "/return-policy" },
];

const DEFAULTS = { title: "", content: "" };

const PolicyEditor = ({ policy }) => {
  const { data, set, loading, saving, save } = useSiteCms(policy.key, DEFAULTS);
  if (loading) return <Loading />;

  const isEmpty = !String(data.content || "").replace(/<[^>]*>/g, "").trim();

  return (
    <div className="space-y-6">
      <Card
        title={policy.name}
        hint={`Shown on ${policy.page}. While the content below is empty, the website keeps showing its current text. Use Heading 1 / Heading 2 for section titles — they become the “On this page” index.`}
      >
        <div className="space-y-5">
          <Field label="Document title (optional)" hint="Shown at the top of the content, e.g. “Medical Surgical Solutions Privacy Policy”.">
            <TextInput value={data.title} onChange={(v) => set("title", v)} />
          </Field>
          <Field label="Content">
            <div className="mt-1.5">
              <RichTextEditor
                value={data.content}
                onChange={(html) => set("content", html)}
                placeholder={`Write the ${policy.name.toLowerCase()} here…`}
              />
            </div>
          </Field>
          {data.updatedAt && (
            <p className="text-xs text-white/40">Last updated: {new Date(data.updatedAt).toLocaleString("en-IN")}</p>
          )}
        </div>
      </Card>

      <SaveButton
        saving={saving}
        onClick={() => save({ ...data, content: isEmpty ? "" : data.content, updatedAt: new Date().toISOString() })}
      >
        Save {policy.name}
      </SaveButton>
    </div>
  );
};

const PolicyCMS = () => {
  const [active, setActive] = useState(POLICIES[0].key);
  const policy = POLICIES.find((p) => p.key === active);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <CmsHeader title="Policies" subtitle="Privacy policy, terms & conditions and refund policy." />

      <div className="flex gap-2 flex-wrap">
        {POLICIES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setActive(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              active === p.key ? "bg-[var(--primary)] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* keyed so switching tabs loads that policy fresh */}
      <PolicyEditor key={policy.key} policy={policy} />
    </div>
  );
};

export default PolicyCMS;
