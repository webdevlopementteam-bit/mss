import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Upload, Plus, ArrowUp, ArrowDown } from "lucide-react";
import API from "../api/axios";

const IMG_BASE = import.meta.env.VITE_IMAGE_BASE_URL;

export const mediaUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${IMG_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

// Same upload endpoint the Home CMS already uses; videos go to /upload/video.
export const uploadFile = async (file, kind = "image") => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${IMG_BASE}/api/upload${kind === "video" ? "/video" : ""}`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.message || "Upload failed");
  return data.url;
};

/* Loads one Site CMS section (GET /cms/site/:key), merges it over `defaults`
 * so every field always exists, and saves it back (PUT, admin token). */
export const useSiteCms = (key, defaults) => {
  const [data, setData] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    API.get(`/cms/site/${key}`)
      .then((res) => {
        if (!cancelled && res.data?.data) setData({ ...defaults, ...res.data.data });
      })
      .catch(() => toast.error("Could not load saved content"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = async (override) => {
    setSaving(true);
    try {
      const res = await API.put(`/cms/site/${key}`, { data: override || data });
      setData({ ...defaults, ...res.data.data });
      toast.success("Saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (field, value) => setData((d) => ({ ...d, [field]: value }));

  return { data, setData, set, loading, saving, save };
};

/* ---------------- UI pieces (match the existing dark admin theme) ---------------- */

export const CmsHeader = ({ title, subtitle }) => (
  <div>
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    {subtitle && <p className="text-white/60 mt-1">{subtitle}</p>}
  </div>
);

export const Card = ({ title, hint, action, children }) => (
  <div className="bg-[var(--surface-container-high)] border border-white/10 rounded-2xl p-6">
    {(title || action) && (
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          {title && <h2 className="text-lg text-white font-semibold">{title}</h2>}
          {hint && <p className="text-white/50 text-sm mt-1">{hint}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

export const Field = ({ label, hint, children }) => (
  <div>
    <label className="label">{label}</label>
    {children}
    {hint && <p className="text-xs text-white/40 mt-1">{hint}</p>}
  </div>
);

export const TextInput = ({ value, onChange, ...rest }) => (
  <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
);

export const TextArea = ({ value, onChange, rows = 3, ...rest }) => (
  <textarea className="input" rows={rows} value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
);

export const AddButton = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--primary)] rounded-lg text-white text-sm"
  >
    <Plus size={15} /> {children}
  </button>
);

export const IconButton = ({ onClick, title, danger, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`p-2 rounded-md text-white ${danger ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}
  >
    {children}
  </button>
);

export const RowControls = ({ index, count, onMove, onRemove }) => (
  <div className="flex gap-1.5">
    <IconButton title="Move up" onClick={() => index > 0 && onMove(index, index - 1)}>
      <ArrowUp size={14} />
    </IconButton>
    <IconButton title="Move down" onClick={() => index < count - 1 && onMove(index, index + 1)}>
      <ArrowDown size={14} />
    </IconButton>
    <IconButton title="Remove" danger onClick={() => onRemove(index)}>
      <Trash2 size={14} />
    </IconButton>
  </div>
);

export const moveItem = (list, from, to) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/* Image (or video) picker with preview; uploads immediately and reports the
 * stored path through onChange. */
export const MediaUpload = ({ value, onChange, kind = "image", label = "Upload image", className = "h-40" }) => {
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadFile(file, kind));
      toast.success(kind === "video" ? "Video uploaded" : "Image uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className={`w-full ${className} rounded-lg overflow-hidden bg-[#121826] border border-white/10 flex items-center justify-center`}>
        {value ? (
          kind === "video" ? (
            <video src={mediaUrl(value)} className="w-full h-full object-cover" muted controls />
          ) : (
            <img src={mediaUrl(value)} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <span className="text-white/30 text-sm">No {kind} yet</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <label className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm">
          <Upload size={14} /> {busy ? "Uploading…" : label}
          <input hidden type="file" accept={kind === "video" ? "video/mp4,video/webm" : "image/*"} onChange={pick} disabled={busy} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-300">
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export const SaveButton = ({ onClick, saving, children = "Save" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={saving}
    className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] text-white font-semibold disabled:opacity-60"
  >
    {saving ? "Saving…" : children}
  </button>
);

export const Loading = () => <div className="p-10 text-center text-white">Loading...</div>;
