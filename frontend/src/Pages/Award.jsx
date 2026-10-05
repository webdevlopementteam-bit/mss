import { useCallback, useEffect, useState } from "react";
import { getAwards } from "../api/services";
import { PageHeader } from "../components/ui/PageHeader";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;
const awardImage = (img) => (!img ? "/no-image.png" : img.startsWith("http") ? img : `${IMG_URL}/${img}`);

const Award = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    getAwards()
      .then((res) => setAwards(res.data.data || []))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  const step = useCallback(
    (d) => setOpen((i) => (i === null ? i : (i + d + awards.length) % awards.length)),
    [awards.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  return (
    <div className="bg-[#F6F7F9] pb-14 md:pb-20">
      <PageHeader
        title="Awards & Achievements"
        crumb="Award"
        icon="fa-trophy"
        subtitle="Celebrating our dedication to quality, innovation and customer satisfaction."
      />

      <div className="px-4 md:px-6 lg:px-side pt-8 md:pt-12">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <p className="inline-flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] !text-primaryColor">
            <span className="w-6 h-[2px] bg-primaryColor rounded-full"></span>
            Recognition
            <span className="w-6 h-[2px] bg-primaryColor rounded-full"></span>
          </p>
          <h2 className="mt-2 text-[22px] md:text-[30px] font-bold leading-tight !text-[#023350]">
            Milestones that reflect our commitment
          </h2>
          <p className="mt-2 text-sm md:text-[15px] !text-gray-500">
            Every recognition is a thank-you to the healthcare professionals and customers who trust us.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-2xl bg-gray-200/70 animate-pulse" />
            ))}
          </div>
        ) : awards.length === 0 ? (
          <p className="text-center py-16 !text-gray-500">Awards will appear here soon.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {awards.map((award, i) => (
              <button
                key={award._id}
                type="button"
                onClick={() => setOpen(i)}
                className="group relative text-left rounded-2xl overflow-hidden bg-white border border-gray-200/80 hover:shadow-[0_25px_50px_-20px_rgba(2,51,80,0.45)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={awardImage(award.image)}
                    alt={award.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#021c2c]/90 via-[#021c2c]/20 to-transparent" />
                  <span className="absolute right-3 top-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
                    <i className="fa-solid fa-expand text-xs !text-[#023350]"></i>
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8B23D] px-2 py-0.5 md:px-2.5 md:py-1">
                      <i className="fa-solid fa-trophy text-[9px] md:text-[10px] !text-[#3b2a00]"></i>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider !text-[#3b2a00]">Award</span>
                    </span>
                    <p className="mt-2 text-sm md:text-lg font-bold leading-snug line-clamp-2 !text-white">{award.name}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {open !== null && awards[open] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] bg-[#021c2c]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-10"
          onClick={() => setOpen(null)}
        >
          <img
            src={awardImage(awards[open].image)}
            alt={awards[open].name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain"
          />
          <p className="mt-4 text-center font-semibold !text-white">{awards[open].name}</p>

          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
            <i className="fa-solid fa-xmark text-lg !text-white"></i>
          </button>
          {awards.length > 1 &&
            ["prev", "next"].map((dir) => (
              <button
                key={dir}
                type="button"
                aria-label={dir === "next" ? "Next" : "Previous"}
                onClick={(e) => {
                  e.stopPropagation();
                  step(dir === "next" ? 1 : -1);
                }}
                className={`absolute top-1/2 -translate-y-1/2 ${dir === "next" ? "right-3 md:right-6" : "left-3 md:left-6"} w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center`}
              >
                <i className={`fa-solid ${dir === "next" ? "fa-chevron-right" : "fa-chevron-left"} !text-white`}></i>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default Award;
