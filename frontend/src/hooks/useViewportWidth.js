import { useEffect, useState } from "react";

// react-slick's own `responsive` breakpoints don't reliably apply in this app
// (sliders kept their desktop slidesToShow on phones), so sliders derive their
// settings from this width instead and remount when the bucket changes.
export const useViewportWidth = () => {
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1280));

  useEffect(() => {
    let frame;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setWidth(window.innerWidth));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return width;
};

export default useViewportWidth;
