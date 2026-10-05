import { useEffect, useState } from "react";
import { testimonials, stats } from "../data";

const INTERVAL_MS = 6000;

// Position of each card in the deck relative to the active one:
// 0 = front, 1 and 2 peek out behind it, anything further is hidden.
const DECK = [
  "z-30 translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100",
  "z-20 translate-x-4 md:translate-x-8 -translate-y-3 rotate-[3deg] scale-[0.95] opacity-90",
  "z-10 translate-x-8 md:translate-x-16 -translate-y-6 rotate-[6deg] scale-[0.9] opacity-70",
  "z-0 translate-x-10 md:translate-x-20 -translate-y-8 rotate-[8deg] scale-[0.86] opacity-0",
];

export const Testimonial = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = testimonials.length;

  useEffect(() => {
    if (paused || total < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % total), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, total, active]);

  const go = (delta) => setActive((i) => (i + delta + total) % total);

  return (
    <section className="relative mt-12 md:mt-20 py-14 md:py-20 overflow-hidden">
      {/* Theme-matched backdrop: soft brand blobs + oversized quote glyph */}
      <div className="pointer-events-none absolute -left-24 top-10 w-80 h-80 rounded-full bg-secondaryColor/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 w-96 h-96 rounded-full bg-primaryColor/[0.07] blur-3xl" />
      <i className="fa-solid fa-quote-right pointer-events-none absolute right-[4%] top-6 text-[180px] md:text-[260px] leading-none !text-[#023350]/[0.04]"></i>

      <div className="relative px-4 md:px-6 lg:px-side grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: copy, stats, avatar switcher */}
        <div>
          <p className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] !text-primaryColor">
            <span className="w-6 h-[2px] bg-primaryColor rounded-full"></span>
            Testimonials
          </p>
          <h2 className="mt-2 text-[24px] md:text-[34px] font-bold !text-[#023350] leading-tight">
            Trusted by thousands of <span className="!text-primaryColor">happy customers</span>
          </h2>
          <p className="mt-3 text-sm md:text-[15px] !text-gray-500 max-w-md leading-relaxed">
            Healthcare professionals, clinics and families across India rely on us for genuine
            medical and surgical supplies. Here's what they say.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 max-w-sm">
            {stats.slice(0, 2).map((s) => (
              <div key={s.id} className="rounded-2xl bg-white border border-gray-200/80 px-4 py-3.5 shadow-sm">
                <p className="text-2xl md:text-[28px] font-extrabold leading-none !text-[#023350]">
                  {s.number}
                  <span className="!text-primaryColor">{s.sup}</span>
                </p>
                <p className="mt-1.5 text-xs font-medium !text-gray-500">{s.title}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <div className="flex items-center">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show review by ${t.name}`}
                  className={`relative -ml-2 first:ml-0 rounded-full transition-all duration-300 ${
                    active === i ? "z-10 scale-110 ring-[3px] ring-primaryColor ring-offset-2" : "ring-2 ring-white hover:z-10 hover:scale-105"
                  }`}
                >
                  <img src={t.image} alt={t.name} className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {["prev", "next"].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => go(dir === "next" ? 1 : -1)}
                  aria-label={dir === "next" ? "Next review" : "Previous review"}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors group/btn ${
                    dir === "next"
                      ? "bg-[#023350] hover:bg-primaryColor"
                      : "border border-gray-300 bg-white hover:border-[#023350]"
                  }`}
                >
                  <i
                    className={`fa-solid ${dir === "next" ? "fa-arrow-right !text-white" : "fa-arrow-left !text-[#023350]"} text-xs`}
                  ></i>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: stacked card deck — every card shares one grid cell, so the
            deck is as tall as the longest review and no text gets clipped. */}
        <div
          className="relative grid mr-8 md:mr-20 mt-8 lg:mt-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {testimonials.map((t, i) => {
            const offset = (i - active + total) % total;
            const pos = DECK[Math.min(offset, DECK.length - 1)];
            return (
              <article
                key={t.id}
                aria-hidden={offset !== 0}
                className={`[grid-area:1/1] origin-bottom-left rounded-3xl bg-white border border-gray-200/80 p-6 md:p-8 flex flex-col shadow-[0_30px_60px_-30px_rgba(2,51,80,0.45)] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${pos}`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-11 h-11 rounded-2xl bg-primaryColor flex items-center justify-center shadow-[0_10px_20px_-8px_rgba(181,35,39,0.8)]">
                    <i className="fa-solid fa-quote-left !text-white"></i>
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, s) => (
                      <i key={s} className="fa-solid fa-star text-sm !text-[#F0B323]"></i>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-[15px] md:text-[17px] leading-relaxed !text-gray-700 flex-1">
                  “{t.comment}”
                </p>

                <div className="mt-5 pt-5 border-t border-gray-100 flex items-center gap-3">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-secondaryColor/30" />
                  <div className="min-w-0">
                    <p className="font-bold !text-[#023350] leading-tight">{t.name}</p>
                    <p className="text-xs capitalize !text-gray-500 mt-0.5">
                      {t.role}
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-semibold tabular-nums !text-gray-400">
                    {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
