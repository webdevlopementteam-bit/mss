import { X, Plus, ChevronUp, ChevronDown } from "lucide-react";

// Product FAQ editor: `items` is an array of { question, answer }. Rows with
// a blank question or answer are dropped by the backend on save. The
// storefront builds the FAQPage schema from this list automatically.
export default function FaqEditor({ items, onChange }) {
  const list = items || [];

  const update = (i, patch) => onChange(list.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const remove = (i) => onChange(list.filter((_, idx) => idx !== i));
  const move = (from, to) => {
    if (to < 0 || to >= list.length) return;
    const copy = [...list];
    const [row] = copy.splice(from, 1);
    copy.splice(to, 0, row);
    onChange(copy);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label !text-white/50 uppercase tracking-wide text-xs">
          FAQs ({list.length})
        </label>
        <button
          type="button"
          onClick={() => onChange([...list, { question: "", answer: "" }])}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10 rounded-full px-3 py-1.5 transition"
        >
          <Plus size={13} /> Add question
        </button>
      </div>

      <div className="space-y-3">
        {list.map((f, i) => (
          <div key={i} className="border border-white/10 rounded-lg p-3 bg-[#111827] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs font-semibold">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="p-1 text-white/50 hover:text-white disabled:opacity-30" title="Move up">
                  <ChevronUp size={15} />
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} className="p-1 text-white/50 hover:text-white disabled:opacity-30" title="Move down">
                  <ChevronDown size={15} />
                </button>
                <button type="button" onClick={() => remove(i)} className="p-1 text-red-400 hover:text-red-300" title="Remove">
                  <X size={15} />
                </button>
              </div>
            </div>
            <input
              className="input"
              placeholder="Question"
              value={f.question || ""}
              onChange={(e) => update(i, { question: e.target.value })}
            />
            <textarea
              className="input"
              rows={3}
              placeholder="Answer"
              value={f.answer || ""}
              onChange={(e) => update(i, { answer: e.target.value })}
            />
          </div>
        ))}
      </div>

      <p className="text-white/40 text-xs mt-2">
        Shown on the product page. FAQ schema (JSON-LD) is generated automatically. Empty rows are skipped.
      </p>
    </div>
  );
}
