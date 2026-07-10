import { useState } from "react";

// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  red: "#b52327", redDark: "#8a1a1d", redLight: "#fdf1f1", redMid: "#f5d0d1",
  bg: "#f6f7f9", white: "#ffffff", border: "#e5e7eb",
  text: "#111827", muted: "#6b7280", subtle: "#9ca3af",
  success: "#16a34a", successBg: "#dcfce7",
  warn: "#b45309", warnBg: "#fef3c7",
  info: "#1d4ed8", infoBg: "#dbeafe",
  purple: "#6b21a8", purpleBg: "#f3e8ff",
};

// ── Icons ─────────────────────────────────────────────────────────────────────
export function Ico({ d, size = 18, color = "currentColor", style: s }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={s}>
      <path d={d} />
    </svg>
  );
}
export const I = {
  user:    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  orders:  "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2",
  truck:   "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  logout:  "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  edit:    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  check:   "M20 6L9 17l-5-5",
  x:       "M18 6L6 18M6 6l12 12",
  menu:    "M3 12h18M3 6h18M3 18h18",
  link:    "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3",
  alert:   "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  eye:     "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff:  "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  save:    "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8",
  tag:     "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  pkg:     "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  lock:    "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  refresh: "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
};

// ── Status config (matches backend Order.orderStatus enum) ────────────────────
export const STATUS_CFG = {
  pending:           { label: "Pending",           bg: C.warnBg,    color: C.warn,    dot: C.warn },
  confirmed:         { label: "Confirmed",         bg: C.infoBg,    color: C.info,    dot: C.info },
  processing:        { label: "Processing",        bg: C.infoBg,    color: C.info,    dot: C.info },
  packed:            { label: "Packed",            bg: C.infoBg,    color: C.info,    dot: C.info },
  shipped:           { label: "Shipped",           bg: C.infoBg,    color: C.info,    dot: C.info },
  out_for_delivery:  { label: "Out For Delivery",  bg: C.warnBg,    color: C.warn,    dot: C.warn },
  delivered:         { label: "Delivered",         bg: C.successBg, color: C.success, dot: C.success },
  cancelled:         { label: "Cancelled",         bg: "#f3f4f6",   color: C.muted,   dot: C.subtle },
};

// ── Status timeline steps ─────────────────────────────────────────────────────
export const STEPS = ["Order Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];
export const STEP_INDEX = {
  pending: 0, confirmed: 0,
  processing: 1, packed: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

export function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || { label: status, bg: "#f3f4f6", color: C.muted };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
      padding: "4px 10px", borderRadius: 99, letterSpacing: ".03em", whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

// ── Progress stepper ──────────────────────────────────────────────────────────
export function OrderStepper({ status }) {
  if (status === "cancelled") return null;
  const activeIdx = STEP_INDEX[status] ?? 0;
  return (
    <div style={{ padding: "16px 0 4px", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 380 }}>
        {STEPS.map((step, i) => {
          const done = i <= activeIdx;
          const active = i === activeIdx;
          return (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: done ? C.red : "#f3f4f6",
                  border: active ? `3px solid ${C.redMid}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: active ? `0 0 0 3px ${C.redLight}` : "none",
                  transition: "all .2s",
                }}>
                  {done ? <Ico d={I.check} size={13} color="#fff" /> :
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#d1d5db" }} />}
                </div>
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500,
                  color: active ? C.red : done ? C.muted : "#d1d5db",
                  textAlign: "center", whiteSpace: "nowrap", lineHeight: 1.3, maxWidth: 68 }}>
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: "0 6px", marginBottom: 22,
                  background: i < activeIdx ? C.red : "#e5e7eb", transition: "background .2s" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, onClose }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: "#1a1a2e", color: "#fff", borderRadius: 12, padding: "13px 22px",
      fontSize: 13, fontWeight: 600, zIndex: 9999, display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 8px 32px rgba(0,0,0,.22)", whiteSpace: "nowrap" }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: C.successBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ico d={I.check} size={12} color={C.success} />
      </span>
      {msg}
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
        padding: 2, marginLeft: 6, opacity: .6 }}>
        <Ico d={I.x} size={14} color="#fff" />
      </button>
    </div>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
export function ConfirmModal({ title, body, confirmLabel, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 18, padding: "28px 28px 24px", maxWidth: 420,
        width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,.22)" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.redLight,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Ico d={I.alert} size={22} color={C.red} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</div>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 24px", lineHeight: 1.65 }}>{body}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ background: "#f3f4f6", border: "none", borderRadius: 10,
            padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: C.text }}>
            Go back
          </button>
          <button onClick={onConfirm} style={{ background: C.red, border: "none", borderRadius: 10,
            padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Form field ────────────────────────────────────────────────────────────────
export function Field({ label, value, onChange, type = "text", disabled, half }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5,
      gridColumn: half ? "span 1" : "span 2" }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: C.muted,
        textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={isPass ? (show ? "text" : "password") : type}
          value={value} onChange={onChange} disabled={disabled}
          style={{ width: "100%", padding: "10px 14px", paddingRight: isPass ? 40 : 14,
            borderRadius: 9, border: `1.5px solid ${disabled ? "#f3f4f6" : C.border}`,
            fontSize: 14, color: disabled ? C.muted : C.text,
            background: disabled ? "#fafafa" : C.white, outline: "none",
            boxSizing: "border-box", transition: "border .15s", fontFamily: "inherit" }}
          onFocus={e => { if (!disabled) e.target.style.borderColor = C.red; }}
          onBlur={e => { e.target.style.borderColor = disabled ? "#f3f4f6" : C.border; }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", padding: 2 }}>
            <Ico d={show ? I.eyeOff : I.eye} size={16} color={C.subtle} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
export function Section({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.border}`,
      padding: "20px 22px", marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16,
        paddingBottom: 12, borderBottom: `1px solid #f3f4f6` }}>{title}</div>
      {children}
    </div>
  );
}
