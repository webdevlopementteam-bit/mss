import {
  useSiteCms,
  CmsHeader,
  Card,
  Field,
  TextInput,
  TextArea,
  AddButton,
  RowControls,
  MediaUpload,
  SaveButton,
  Loading,
  moveItem,
} from "./cmsShared";

// Defaults mirror what the About page shows today, so the form opens
// pre-filled. Images/stats/team left empty keep the website's current ones.
const DEFAULTS = {
  experienceBadge: "30 Years Of Experience",
  eyebrow: "About Us",
  heading: "OUR TRUSTED PARTNER IN HEALTHCARE EXCELLENCE",
  highlight: "HEALTHCARE",
  description:
    "Medical & Surgical Solutions delivers trusted, high-quality medical equipment and products to healthcare professionals. Our innovative range ensures precision, reliability, and safety, empowering excellence in patient care across hospitals and institutions.",
  features: [
    "Worldwide Clients",
    "Special Discounts",
    "Seasonal Offers",
    "International Supply",
    "Eco Friendly",
    "24/7 Customer Support",
  ],
  image1: "",
  image2: "",
  stats: [
    { number: "11", suffix: "k+", title: "Happy Customers" },
    { number: "15", suffix: "k+", title: "Premium Products" },
    { number: "150", suffix: "+", title: "Customer Support Team" },
    { number: "750", suffix: "+", title: "Global Clients" },
  ],
  teamHeading: "Meet Our Expert Team",
  team: [],
};

const AboutCMS = () => {
  const { data, set, loading, saving, save } = useSiteCms("about", DEFAULTS);
  if (loading) return <Loading />;

  const updateList = (field, index, patch) =>
    set(field, data[field].map((item, i) => (i === index ? (typeof item === "string" ? patch : { ...item, ...patch }) : item)));
  const removeFrom = (field, index) => set(field, data[field].filter((_, i) => i !== index));
  const move = (field) => (from, to) => set(field, moveItem(data[field], from, to));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      <CmsHeader title="About Page" subtitle="Content for the About Us page — same layout as the live page." />

      <Card title="About Section">
        <div className="grid lg:grid-cols-2 gap-5">
          <Field label="Small heading (eyebrow)">
            <TextInput value={data.eyebrow} onChange={(v) => set("eyebrow", v)} />
          </Field>
          <Field label="Experience badge">
            <TextInput value={data.experienceBadge} onChange={(v) => set("experienceBadge", v)} />
          </Field>
          <Field label="Main heading">
            <TextInput value={data.heading} onChange={(v) => set("heading", v)} />
          </Field>
          <Field label="Highlighted word in heading" hint="This word of the heading is shown in red.">
            <TextInput value={data.highlight} onChange={(v) => set("highlight", v)} />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Description">
              <TextArea rows={4} value={data.description} onChange={(v) => set("description", v)} />
            </Field>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="label">Feature points (with tick icons)</p>
            <AddButton onClick={() => set("features", [...data.features, ""])}>Add point</AddButton>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {data.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <TextInput value={f} onChange={(v) => updateList("features", i, v)} />
                <RowControls index={i} count={data.features.length} onMove={move("features")} onRemove={(idx) => removeFrom("features", idx)} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-5">
          <Field label="Large image (left)" hint="Leave empty to keep the current image.">
            <MediaUpload value={data.image1} onChange={(v) => set("image1", v)} className="h-56" />
          </Field>
          <Field label="Small image (right)" hint="Leave empty to keep the current image.">
            <MediaUpload value={data.image2} onChange={(v) => set("image2", v)} className="h-56" />
          </Field>
        </div>
      </Card>

      <Card
        title="Stats Strip"
        hint="The red counter strip, e.g. 11k+ Happy Customers."
        action={<AddButton onClick={() => set("stats", [...data.stats, { number: "", suffix: "+", title: "" }])}>Add stat</AddButton>}
      >
        <div className="space-y-3">
          {data.stats.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_2fr_auto] gap-3 items-end">
              <Field label="Number">
                <TextInput value={s.number} onChange={(v) => updateList("stats", i, { number: v })} />
              </Field>
              <Field label="Suffix">
                <TextInput value={s.suffix} onChange={(v) => updateList("stats", i, { suffix: v })} />
              </Field>
              <Field label="Label">
                <TextInput value={s.title} onChange={(v) => updateList("stats", i, { title: v })} />
              </Field>
              <RowControls index={i} count={data.stats.length} onMove={move("stats")} onRemove={(idx) => removeFrom("stats", idx)} />
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Team Members"
        hint="Shown in the “Meet Our Expert Team” slider. While this list is empty the website keeps showing the current team."
        action={<AddButton onClick={() => set("team", [...data.team, { name: "", position: "", image: "" }])}>Add member</AddButton>}
      >
        <div className="mb-5 max-w-md">
          <Field label="Section heading">
            <TextInput value={data.teamHeading} onChange={(v) => set("teamHeading", v)} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.team.map((m, i) => (
            <div key={i} className="bg-[#121826] rounded-xl p-4 space-y-3">
              <MediaUpload value={m.image} onChange={(v) => updateList("team", i, { image: v })} label="Photo" className="h-48" />
              <Field label="Name">
                <TextInput value={m.name} onChange={(v) => updateList("team", i, { name: v })} />
              </Field>
              <Field label="Position">
                <TextInput value={m.position} onChange={(v) => updateList("team", i, { position: v })} />
              </Field>
              <RowControls index={i} count={data.team.length} onMove={move("team")} onRemove={(idx) => removeFrom("team", idx)} />
            </div>
          ))}
        </div>
      </Card>

      <SaveButton saving={saving} onClick={() => save()}>Save About Page</SaveButton>
    </div>
  );
};

export default AboutCMS;
