import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

const getImage = (img) => {
  if (!img) return "";
  return img.startsWith("http") ? img : `${import.meta.env.VITE_IMAGE_BASE_URL}${img}`;
};

const MAX_TILT = 8; // degrees

/* Offer card with a pointer-driven 3D tilt and a glare highlight that
 * follows the cursor. Touch devices never fire mousemove, so they simply
 * get the flat card. */
const TiltCard = ({ banner, index, ratio, onImageLoad }) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState(null);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * MAX_TILT * 2,
      ry: (px - 0.5) * MAX_TILT * 2,
      gx: px * 100,
      gy: py * 100,
    });
  };

  return (
    <div className="[perspective:1000px] snap-center shrink-0 w-[84%] sm:w-[60%] md:w-auto">
      <Link
        ref={ref}
        to="/shop"
        onMouseMove={handleMove}
        onMouseLeave={() => setTilt(null)}
        style={{
          transform: tilt
            ? `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`
            : "rotateX(0deg) rotateY(0deg)",
          transition: tilt ? "transform 0.08s linear" : "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="group relative block rounded-[22px] p-[2px] bg-gradient-to-br from-primaryColor/70 via-white to-secondaryColor/70 shadow-[0_22px_45px_-22px_rgba(2,51,80,0.55)] [transform-style:preserve-3d] will-change-transform"
      >
        <div className="relative rounded-[20px] overflow-hidden bg-white">
          <img
            src={getImage(banner.image)}
            alt={`Offer ${index + 1}`}
            loading="lazy"
            onLoad={onImageLoad}
            style={{ aspectRatio: ratio }}
            className="w-full object-cover block"
          />

          {/* Cursor-following glare */}
          <span
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              opacity: tilt ? 1 : 0,
              background: tilt
                ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.45), transparent 55%)`
                : "none",
            }}
          />
        </div>

        {/* Floating tag + CTA sit "above" the card in 3D space */}
        <span className="absolute -top-3 left-5 [transform:translateZ(40px)] inline-flex items-center gap-1.5 bg-[#023350] rounded-full px-3 py-1 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-primaryColor animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase !text-white">
            Offer {String(index + 1).padStart(2, "0")}
          </span>
        </span>

        <span className="absolute -bottom-4 right-5 [transform:translateZ(50px)] w-11 h-11 rounded-full bg-primaryColor flex items-center justify-center shadow-[0_10px_25px_-8px_rgba(181,35,39,0.9)] ring-4 ring-white transition-transform duration-300 group-hover:rotate-[-45deg]">
          <i className="fa-solid fa-arrow-right text-sm !text-white"></i>
        </span>
      </Link>
    </div>
  );
};

export const Productbanner = () => {
  const [salesBanners, setSalesBanners] = useState([]);
  // Every card uses the first banner's natural aspect ratio (object-cover),
  // so all three line up at the same height even if uploads differ slightly.
  const [ratio, setRatio] = useState("16 / 9");

  const handleFirstLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    if (w && h) setRatio(`${w} / ${h}`);
  };

  useEffect(() => {
    API.get("/cms/home")
      .then((res) => setSalesBanners(res.data?.salesBanners || []))
      .catch((error) => console.log(error));
  }, []);

  const items = salesBanners.slice(0, 3).filter((b) => b.image);
  if (items.length === 0) return null;

  return (
    <section className="relative mt-14 md:mt-20 py-10 md:py-14 overflow-hidden">
      {/* Diagonal brand band + dot texture behind the cards */}
      <div className="pointer-events-none absolute inset-0 -skew-y-2 origin-top-left bg-gradient-to-r from-[#023350]/[0.04] via-secondaryColor/[0.08] to-primaryColor/[0.06]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(2,51,80,0.18)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />

      <div className="relative px-4 md:px-6 lg:px-side">
        <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] !text-primaryColor mb-2">
              <i className="fa-solid fa-bolt text-[11px] !text-primaryColor"></i>
              Exclusive Deals
            </p>
            <h2 className="text-[22px] md:text-[30px] font-bold !text-[#023350] leading-tight">
              Offers You Can't Miss
            </h2>
          </div>
          <Link
            to="/shop"
            className="group hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold !text-[#023350] hover:!text-primaryColor transition-colors"
          >
            <span className="!text-inherit">Shop all deals</span>
            <i className="fa-solid fa-arrow-right text-[11px] !text-inherit transition-transform group-hover:translate-x-1"></i>
          </Link>
        </div>

        {/* Mobile: swipeable snap row with the next card peeking. md+: grid. */}
        <div
          className={`flex md:grid gap-5 md:gap-7 overflow-x-auto md:overflow-visible snap-x snap-mandatory pt-3 pb-6 -mx-4 px-4 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-start ${
            items.length === 3 ? "md:grid-cols-3" : items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1 md:max-w-3xl md:mx-auto"
          }`}
        >
          {items.map((banner, index) => (
            <TiltCard
              key={index}
              banner={banner}
              index={index}
              ratio={ratio}
              onImageLoad={index === 0 ? handleFirstLoad : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
