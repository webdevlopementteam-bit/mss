import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/home/logo.png";

const FEATURES = [
  { icon: "fa-shield-halved", text: "Genuine, quality-assured medical products" },
  { icon: "fa-truck-fast", text: "Reliable, tracked delivery nationwide" },
  { icon: "fa-headset", text: "Dedicated support for healthcare professionals" },
];

// Shared premium split-screen shell for every auth page (login, register,
// OTP verification, forgot/reset password) so the whole flow feels like one
// cohesive, professional experience rather than five separately-styled forms.
export const AuthShell = ({ title, subtitle, children, footer }) => {
  return (
    <section className="min-h-screen flex bg-[#f6f8f9]">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primaryColor via-primaryColor to-[#7a1619] text-white flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondaryColor/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative z-10 inline-flex items-center gap-3">
          <img src={logo} alt="MSS" className="w-14 bg-white rounded-full p-1" />
          <span className="text-lg font-semibold tracking-wide text-white">
            Medical &amp; Surgical Solutions
          </span>
        </Link>

        <div className="relative z-10 max-w-md">
          <h1 className="text-[34px] leading-[1.15] font-bold mb-4 text-white">
            Trusted supplies for healthcare, delivered with care.
          </h1>
          <p className="text-white/80 text-[15px] leading-relaxed mb-10">
            Sign in to manage your orders, track shipments and reorder your
            essentials in a few clicks.
          </p>

          <div className="space-y-5">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                  <i className={`fa-solid ${f.icon} text-white text-[15px]`}></i>
                </div>
                <p className="text-sm text-white/90">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
          &copy; {new Date().getFullYear()} Medical &amp; Surgical Solutions. All rights reserved.
        </p>
      </div>

      {/* Right form panel. Top-aligned (not centered) on mobile — centering an
          overflowing form fights the site's viewport-fixed bottom nav bar
          (Header.jsx), which then overlaps whatever content lands at the
          bottom of the visible window. Generous bottom padding keeps the
          last field/button clear of that bar once the page is scrolled. */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-4 sm:px-8 pt-10 pb-28 lg:py-10">
        <div className="w-full max-w-[430px]">
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src={logo} alt="MSS" className="w-12" />
            </Link>
          </div>

          <div className="bg-white rounded-[28px] shadow-[0_8px_40px_-12px_rgba(15,23,42,0.15)] border border-black/5 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-[26px] font-bold text-[#0f172a] tracking-tight">{title}</h2>
              {subtitle && <p className="text-[#64748b] text-sm mt-2">{subtitle}</p>}
            </div>

            {children}
          </div>

          {footer && <div className="mt-6 text-center">{footer}</div>}
        </div>
      </div>
    </section>
  );
};

export default AuthShell;
