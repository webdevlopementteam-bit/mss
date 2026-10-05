import { useCallback, useEffect, useState } from "react";
import gallery1 from "../assets/gallery/gallery1.jpeg";
import gallery2 from "../assets/gallery/gallery2.jpeg";
import gallery3 from "../assets/gallery/gallery3.jpeg";
import gallery4 from "../assets/gallery/gallery4.jpeg";
import gallery5 from "../assets/gallery/gallery5.jpeg";
import gallery6 from "../assets/gallery/gallery6.jpeg";

const IMAGES = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];
const ROWS = [
  { items: [0, 1, 2, 3, 4, 5], reverse: false },
  { items: [3, 5, 0, 4, 2, 1], reverse: true },
];

/* Two infinite marquee rows drifting in opposite directions. Posters keep
 * their natural aspect ratio (fixed row height, auto width) so nothing is
 * cropped. Hovering a row pauses it; clicking a poster opens a lightbox. */
const MarqueeRow = ({ items, reverse, onOpen }) => (
  <div className="group/row relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
    {[0, 1].map((copy) => (
      <div
        key={copy}
        aria-hidden={copy === 1}
        className={`flex shrink-0 gap-3 md:gap-6 pr-3 md:pr-6 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        } group-hover/row:[animation-play-state:paused]`}
      >
        {items.map((imgIndex) => (
          <button
            key={`${copy}-${imgIndex}`}
            type="button"
            tabIndex={copy === 1 ? -1 : 0}
            onClick={() => onOpen(imgIndex)}
            className="group/item relative shrink-0 h-[120px] sm:h-[180px] md:h-[240px] lg:h-[260px] rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-black/5 shadow-[0_15px_35px_-20px_rgba(2,51,80,0.5)]"
          >
            <img
              src={IMAGES[imgIndex]}
              alt={`Gallery ${imgIndex + 1}`}
              loading="lazy"
              className="h-full w-auto max-w-none block transition-transform duration-700 group-hover/item:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-[#023350]/70 via-[#023350]/0 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
            <span className="absolute left-1/2 bottom-4 -translate-x-1/2 translate-y-3 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 bg-white rounded-full px-3.5 py-1.5 shadow-lg">
              <i className="fa-solid fa-expand text-[11px] !text-primaryColor"></i>
              <span className="text-xs font-semibold !text-[#023350]">View</span>
            </span>
          </button>
        ))}
      </div>
    ))}
  </div>
);

export const Gallery = () => {
  const [open, setOpen] = useState(null);

  const step = useCallback(
    (delta) => setOpen((i) => (i === null ? i : (i + delta + IMAGES.length) % IMAGES.length)),
    []
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  return (
    <section className="mt-12 md:mt-20 py-10 md:py-16 bg-[#F6F7F9] overflow-hidden">
      <div className="px-4 md:px-6 lg:px-side text-center mb-8 md:mb-10">
        <p className="inline-flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] !text-primaryColor">
          <span className="w-6 h-[2px] bg-primaryColor rounded-full"></span>
          Our Gallery
          <span className="w-6 h-[2px] bg-primaryColor rounded-full"></span>
        </p>
        <h2 className="mt-2 text-[22px] md:text-[30px] font-bold !text-[#023350] leading-tight">
          A Glimpse of What We Deliver
        </h2>
        <p className="mt-1.5 text-sm md:text-[15px] !text-gray-500 max-w-xl mx-auto">
          Trusted brands and quality healthcare products — tap any image to take a closer look.
        </p>
      </div>

      <div className="space-y-3 md:space-y-6">
        {ROWS.map((row, i) => (
          <MarqueeRow key={i} items={row.items} reverse={row.reverse} onOpen={setOpen} />
        ))}
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-[#021c2c]/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(null)}
        >
          <img
            src={IMAGES[open]}
            alt={`Gallery ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-xl shadow-2xl object-contain"
          />

          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-lg !text-white"></i>
          </button>

          {["prev", "next"].map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir === "next" ? "Next image" : "Previous image"}
              onClick={(e) => {
                e.stopPropagation();
                step(dir === "next" ? 1 : -1);
              }}
              className={`absolute top-1/2 -translate-y-1/2 ${
                dir === "next" ? "right-3 md:right-6" : "left-3 md:left-6"
              } w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition`}
            >
              <i className={`fa-solid ${dir === "next" ? "fa-chevron-right" : "fa-chevron-left"} !text-white`}></i>
            </button>
          ))}

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm font-semibold !text-white/80">
            {open + 1} / {IMAGES.length}
          </span>
        </div>
      )}
    </section>
  );
};

export default Gallery;
