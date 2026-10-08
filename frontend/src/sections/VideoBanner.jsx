import { useBannerVideo } from "../api/siteContent";

export const VideoBanner = ({ className = "lg:mt-16" }) => {
  const { loading, src, poster } = useBannerVideo();

  return (
    <div className={`${className} relative overflow-hidden flex justify-center items-center h-[150px] md:h-[500px] bg-[#023350]`}>
      {/* Wait for the CMS answer so the old video never flashes before the new one */}
      {!loading && (
        <video
          key={src}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default VideoBanner;
