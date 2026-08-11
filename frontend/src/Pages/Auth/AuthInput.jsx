import React, { useState } from "react";

// Shared input for every auth form: leading icon, inline error text, and a
// built-in show/hide toggle when type="password" (used by Signup + Reset).
export const AuthInput = ({ icon, error, type = "text", className = "", ...props }) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className={className}>
      <div
        className={`flex items-center gap-3 rounded-2xl border px-4 h-[52px] transition-colors bg-[#f8fafc] focus-within:bg-white focus-within:border-primaryColor ${
          error ? "border-red-400" : "border-[#e2e8f0]"
        }`}
      >
        {icon && <i className={`fa-solid ${icon} text-[#94a3b8] text-[15px]`}></i>}
        <input
          type={resolvedType}
          className="flex-1 bg-transparent outline-none border-none text-[15px] text-[#0f172a] placeholder:text-[#94a3b8]"
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="text-[#94a3b8] hover:text-[#475569] transition-colors"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            <i className={`fa-solid ${visible ? "fa-eye-slash" : "fa-eye"} text-[15px]`}></i>
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  );
};

export default AuthInput;
