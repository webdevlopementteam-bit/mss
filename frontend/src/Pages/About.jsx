import { Link } from "react-router-dom";
import aboutbanner from "../assets/about/aboutbanner.png";
import about1 from "../assets/about/about1.png";
import bg from "../assets/about/bg.png";
import about2 from "../assets/about/about2.jpg";
import quotes from "../assets/home/quote.png";
import banner1 from "../assets/home/banner1.jpg";
import experience from "../assets/about/experience.svg";
import Slider from "react-slick";
import { categories, instapost, stats, team, testimonials } from "../data";
import NextArrow from "../components/NextArrow";
import PrevArrow from "../components/PrevArrow";
import Testimonial from "../sections/Testimonial";
import Policies from "../sections/Policies";
import Instagrammedion from "../sections/Instagrammedion";
import { useState, useEffect, useRef } from "react";
import API from "../api/axios";
import bannerVideo from "../assets/videobanner.mp4";

const About = () => {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  // Tracks whether we're on a mobile-width viewport so the team & company
  // sliders can be forced to an exact slide count, independent of
  // react-slick's own breakpoint matching (which was not reliably kicking in).
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // NOTE: if your `API` axios instance already has `baseURL` set to
        // something like "http://localhost:5000/api", then this path
        // should be just "/company" (not "/api/company"), otherwise the
        // request hits ".../api/api/company" and 404s.
        const res = await API.get(`/company?limit=30`);
        console.log("companies response:", res.data);
        if (res.data.success) {
          setCompanies(res.data.data);
        } else {
          console.warn("companies fetch: success=false", res.data);
        }
      } catch (error) {
        console.error(
          "Failed to fetch companies:",
          error?.response?.status,
          error?.response?.data || error.message,
        );
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    // Forced to 2 on mobile-width viewports instead of relying solely on
    // react-slick's breakpoint matching.
    slidesToShow: isMobile ? 2 : 5,
    slidesToScroll: 1,
    arrows: !isMobile,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, arrows: false },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 2, arrows: false },
      },
    ],
  };

  var testimonialsettings = {
    dots: true,
    infinite: true,
    speed: 500,
    // Forced to 1 on mobile-width viewports instead of relying solely on
    // react-slick's breakpoint matching.
    slidesToShow: isMobile ? 1 : 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <>
      {/* banner section */}
      <div
        className="p-5 relative overflow-hidden py-16 md:py-28"
        style={{
          backgroundImage: `url(${aboutbanner})`,
          backgroundPosition: "center center",
          backgroundSize: "contain",
        }}
      >
        <div className="relative z-10 flex flex-col justify-center items-center px-4 md:px-side">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            About Us
          </h2>
          <p className="text-white mt-3 text-sm md:text-base">
            <span className="text-white hover:text-primaryColor transition-all duration-500 group">
              <Link to="/">
                <i className="fa-regular fa-house text-white group-hover:text-primaryColor transition-all duration-500"></i>{" "}
                Home
              </Link>
            </span>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> About Us
          </p>
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* about section */}
      <div className="px-4 md:px-side py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-7 justify-center items-center">
        {/* Image block — hidden on mobile, shown on lg+ */}
        <div className="hidden lg:flex gap-5 relative">
          <div className="flex justify-center items-center gap-3 p-3 rounded-full bg-white absolute w-[220px] left-1/2 top-14 shadow-[0px_0px_5px] shadow-black/10 z-10">
            <div className="rounded-full w-28 h-[70px] flex flex-col justify-center items-center bg-secondaryColor">
              <img src={experience} alt="experience" className="invert h-14" />
            </div>
            <div className="text-[15px]">30 Years Of Experience</div>
          </div>
          <div>
            <img
              src={about1}
              alt="about1"
              className="h-[550px] object-cover w-full rounded-[100px]"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <img src={bg} alt="background" className="h-40" />
            <img
              src={about2}
              alt="about2"
              className="h-[370px] rounded-[100px]"
            />
          </div>
        </div>

        {/* Text block */}
        <div className="pr-0 lg:pr-14">
          {/* Experience badge — visible only on mobile */}
          <div className="flex lg:hidden justify-center items-center gap-3 p-3 rounded-full bg-white w-full max-w-xs mx-auto mb-6 shadow-md">
            <div className="rounded-full w-16 h-14 flex flex-col justify-center items-center bg-secondaryColor">
              <img src={experience} alt="experience" className="invert h-10" />
            </div>
            <div className="text-sm font-medium">30 Years Of Experience</div>
          </div>

          <p className="font-semibold uppercase tracking-wider text-base md:text-lg text-primaryColor">
            About Us
          </p>
          <h3 className="text-2xl md:text-3xl font-bold mt-3">
            OUR TRUSTED PARTNER IN{" "}
            <span className="text-primaryColor">HEALTHCARE</span>{" "}
            EXCELLENCE{" "}
          </h3>
          <p className="mt-4 text-black/60 text-sm md:text-base">
            Medical & Surgical Solutions delivers trusted, high-quality medical
            equipment and products to healthcare professionals. Our innovative
            range ensures precision, reliability, and safety, empowering
            excellence in patient care across hospitals and institutions.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4 md:gap-5">
            {[
              { icon: "fa-users", label: "Worldwide Clients" },
              { icon: "fa-tags", label: "Special Discounts" },
              { icon: "fa-gift", label: "Seasonal Offers" },
              { icon: "fa-earth-asia", label: "International Supply" },
              { icon: "fa-envira", label: "Eco Friendly", brand: true },
              { icon: "fa-headset", label: "24/7 Customer Support" },
            ].map(({ icon, label, brand }) => (
              <div key={label} className="flex gap-3 items-center">
                <p className="py-1 px-2 rounded-full bg-secondaryColor flex-shrink-0">
                  <i
                    className={`${brand ? "fa-brands" : "fa-solid"} ${icon} text-white`}
                  ></i>
                </p>
                <p className="font-semibold text-sm md:text-base">{label}</p>
              </div>
            ))}
          </div>
          <button className="relative overflow-hidden px-5 md:px-6 py-2.5 md:py-3 mt-7 font-semibold text-white bg-primaryColor rounded-xl group">
            <Link
              to="/shop"
              className="relative z-10 text-white transition-colors duration-300 text-sm md:text-base"
            >
              Shop Now <i className="fa-solid fa-arrow-right text-white"></i>
            </Link>
            <span className="absolute inset-0 rounded-xl scale-0 opacity-0 bg-secondaryColor group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-in-out"></span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 md:px-20 py-10 md:py-10 grid grid-cols-2 lg:grid-cols-4 bg-primaryColor gap-5 md:gap-7 justify-center items-center">
        {stats.map((stat) => (
          <div key={stat.id}>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-3 md:p-5 border-[2px] border-white flex flex-col justify-center items-center rounded-full bg-secondaryColor flex-shrink-0">
                <img src={stat.image} alt="stat" className="h-8 md:h-14" />
              </div>
              <div>
                <p className="text-white text-2xl md:text-4xl font-extrabold">
                  {stat.number}
                  <sup className="text-white ml-1">{stat.sup}</sup>
                </p>
                <p className="text-white font-semibold text-sm md:text-lg mt-1 md:mt-3">
                  {stat.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <Testimonial />

      {/* Video banner */}
       <div className=" relative overflow-hidden flex justify-center items-center h-[150px] md:h-[500px]">
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

      {/* Team */}
      <div className="bg-[#F5F7FA] px-4 sm:px-6 md:px-8 lg:px-side pt-10 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20 text-center">
        {/* Heading */}
        <p className="text-primaryColor text-xs sm:text-sm md:text-base font-semibold uppercase tracking-[0.2em]">
          Our Team
        </p>

        <h3 className="mt-2 sm:mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
          Meet Our Expert <span className="text-primaryColor">Team</span>
        </h3>

        {/* Team Slider */}
        <div className="mt-6 sm:mt-8 md:mt-10">
          <Slider key={isMobile ? "mobile" : "desktop"} {...testimonialsettings}>
            {team.map((member) => (
              <div key={member.id} className="px-1.5 sm:px-2 md:px-3">
                <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm">
                  {/* Image */}
                  <img
                    src={member.image}
                    className="w-full h-64 object-cover rounded-lg sm:rounded-xl"
                    alt={member.name}
                  />

                  {/* Details */}
                  <div className="mt-2.5 sm:mt-3 text-center">
                    <p className="font-semibold text-sm sm:text-base md:text-lg leading-tight">
                      {member.name}
                    </p>

                    <p className="mt-1 font-semibold text-primaryColor text-xs sm:text-sm md:text-base leading-tight">
                      {member.position}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Policies */}
      <Policies />
      {/* Instagram */}
      <Instagrammedion />
      {/* Trusted companies */}
      {/* Trusted companies */}
      <div className="py-10 md:py-16 px-4 md:px-side text-center bg-[#F5F7FA]">
        <p className="uppercase text-primaryColor font-semibold tracking-widest text-sm md:text-base">
          Our Partners
        </p>
        <h3 className="mt-3 text-2xl md:text-4xl font-bold">
          Trusted by over <span className="text-primaryColor">3.2k+</span>{" "}
          companies
        </h3>

        <div className="mt-8 md:mt-10">
          {loadingCompanies ? (
            <p className="text-black/50">Loading...</p>
          ) : companies.length === 0 ? (
            <p className="text-black/50">No companies found</p>
          ) : (
            <Slider key={isMobile ? "mobile" : "desktop"} {...settings}>
              {companies.map((company) => (
                <div key={company._id} className="px-2 md:px-3">
                  <div className="bg-white border border-black/5 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 py-4 md:py-6 px-3 md:px-5 flex justify-center items-center h-24 md:h-28">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${company.image}`}
                      alt={company.name}
                      className="max-h-12 md:max-h-14 max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>

        <button className="relative overflow-hidden px-5 md:px-6 py-2.5 md:py-3 mt-10 font-semibold text-white bg-primaryColor rounded-xl group">
          <Link
            to="/shop"
            className="relative z-10 text-white transition-colors duration-300 text-sm md:text-base"
          >
            Shop Now <i className="fa-solid fa-arrow-right text-white"></i>
          </Link>
          <span className="absolute inset-0 rounded-xl scale-0 opacity-0 bg-secondaryColor group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-in-out"></span>
        </button>
      </div>
    </>
  );
};

export default About;