import { useState } from "react";
import { X, Plus } from "lucide-react";

// Free-form spec-sheet editor: `rows` is an array of arrays of strings
// (e.g. [["Brand", "Sound Boss"], ["Type", "Audio & Video"]]) — admin can
// add/remove rows AND columns, or bulk-paste tab/comma-separated data
// copied from a spreadsheet.
export default function SpecTable({ rows, onChange }) {
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const safeRows = rows && rows.length > 0 ? rows : [["", ""]];
  const columnCount = Math.max(2, ...safeRows.map((r) => r.length));

  // Every row is padded out to columnCount so cells always line up, even
  // right after a column was added to a row that didn't have it yet.
  const paddedRows = safeRows.map((r) => {
    const padded = [...r];
    while (padded.length < columnCount) padded.push("");
    return padded;
  });

  const updateCell = (rowIndex, colIndex, val) => {
    const copy = paddedRows.map((r) => [...r]);
    copy[rowIndex][colIndex] = val;
    onChange(copy);
  };

  const addRow = () => {
    onChange([...paddedRows, Array(columnCount).fill("")]);
  };

  const addColumn = () => {
    onChange(paddedRows.map((r) => [...r, ""]));
  };

  const removeRow = (rowIndex) => {
    const next = paddedRows.filter((_, i) => i !== rowIndex);
    onChange(next.length > 0 ? next : [["", ""]]);
  };

  const removeColumn = (colIndex) => {
    if (columnCount <= 1) return;
    onChange(paddedRows.map((r) => r.filter((_, i) => i !== colIndex)));
  };

  const applyBulkPaste = () => {
    const parsed = bulkText
      .split("\n")
      .map((line) => line.replace(/\r$/, ""))
      .filter((line) => line.trim() !== "")
      .map((line) => (line.includes("\t") ? line.split("\t") : line.split(",")).map((c) => c.trim()));

    if (parsed.length === 0) {
      setBulkOpen(false);
      return;
    }

    onChange(parsed);
    setBulkText("");
    setBulkOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="label !text-white/50 uppercase tracking-wide text-xs">
          Technical Specifications
        </label>
        <button
          type="button"
          onClick={() => setBulkOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 border border-emerald-400/30 hover:bg-emerald-400/10 rounded-full px-3 py-1.5 transition"
        >
          <Plus size={13} /> Bulk paste
        </button>
      </div>

      {bulkOpen && (
        <div className="mb-3 border border-white/10 rounded-lg p-3 bg-[#111827]">
          <textarea
            className="input text-xs font-mono"
            rows={4}
            placeholder={"Paste rows copied from a spreadsheet — one row per line, columns separated by Tab or comma.\nBrand\tSound Boss\nType\tAudio & Video"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={applyBulkPaste}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium"
            >
              Apply (replaces current rows)
            </button>
            <button
              type="button"
              onClick={() => {
                setBulkOpen(false);
                setBulkText("");
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr>
              {Array.from({ length: columnCount }).map((_, colIndex) => (
                <th key={colIndex} className="p-2 w-1/2">
                  <button
                    type="button"
                    onClick={() => removeColumn(colIndex)}
                    disabled={columnCount <= 1}
                    className="mx-auto flex items-center justify-center text-red-400 hover:text-red-300 disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Remove this column"
                  >
                    <X size={16} />
                  </button>
                </th>
              ))}
              <th className="p-2 text-white/40 text-[11px] uppercase tracking-wide font-medium">
                Row
              </th>
            </tr>
          </thead>

          <tbody>
            {paddedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-white/5">
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="p-2">
                    <input
                      className="input-sm"
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="text-red-400 hover:text-red-300"
                    title="Remove this row"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={addRow}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition"
        >
          + Row
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition"
        >
          + Column
        </button>
      </div>
    </div>
  );
}
