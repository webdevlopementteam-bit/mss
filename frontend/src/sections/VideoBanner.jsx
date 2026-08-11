import React, { useRef, useState } from "react";
import bannerVideo from "../assets/videobanner.mp4";

export const VideoBanner = () => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div className="lg:mt-16 relative overflow-hidden flex justify-center items-center h-[150px] md:h-[500px]">
      <video
        ref={videoRef}
        src={bannerVideo}
        autoPlay
        muted={muted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />



    </div>
  );
};

export default VideoBanner;