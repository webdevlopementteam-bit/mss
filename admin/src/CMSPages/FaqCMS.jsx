import {
  useSiteCms,
  CmsHeader,
  Card,
  Field,
  TextInput,
  TextArea,
  AddButton,
  RowControls,
  SaveButton,
  Loading,
  moveItem,
} from "./cmsShared";

const DEFAULTS = { items: [] };

const FaqCMS = () => {
  const { data, set, loading, saving, save } = useSiteCms("faq", DEFAULTS);
  if (loading) return <Loading />;

  const items = data.items || [];
  const update = (i, patch) => set("items", items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const handleSave = () =>
    save({ ...data, items: items.filter((it) => it.question?.trim() && it.answer?.trim()) });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <CmsHeader title="FAQ" subtitle="Questions shown on the FAQ page." />

      <Card
        title={`Questions (${items.length})`}
        hint="While this list is empty the website keeps showing its current FAQs. Empty rows are skipped on save."
        action={<AddButton onClick={() => set("items", [...items, { question: "", answer: "" }])}>Add question</AddButton>}
      >
        <div className="space-y-4">
          {items.map((it, i) => (
            <div key={i} className="bg-[#121826] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm font-semibold">#{i + 1}</span>
                <RowControls
                  index={i}
                  count={items.length}
                  onMove={(from, to) => set("items", moveItem(items, from, to))}
                  onRemove={(idx) => set("items", items.filter((_, x) => x !== idx))}
                />
              </div>
              <Field label="Question">
                <TextInput value={it.question} onChange={(v) => update(i, { question: v })} />
              </Field>
              <Field label="Answer">
                <TextArea rows={4} value={it.answer} onChange={(v) => update(i, { answer: v })} />
              </Field>
            </div>
          ))}
          {items.length === 0 && <p className="text-white/40 text-sm">No questions added yet.</p>}
        </div>
      </Card>

      <SaveButton saving={saving} onClick={handleSave}>Save FAQs</SaveButton>
    </div>
  );
};

export default FaqCMS;
