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

const About = () => {
  var settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
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
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  var testimonialsettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
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
        breakpoint: 640,
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
          <h2 className="text-2xl md:text-3xl font-semibold text-white">About Us</h2>
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
                  <i className={`${brand ? "fa-brands" : "fa-solid"} ${icon} text-white`}></i>
                </p>
                <p className="font-semibold text-sm md:text-base">{label}</p>
              </div>
            ))}
          </div>
          <button className="relative overflow-hidden px-5 md:px-6 py-2.5 md:py-3 mt-7 font-semibold text-white bg-primaryColor rounded-xl group">
            <span className="relative z-10 text-white transition-colors duration-300 text-sm md:text-base">
              Shop Now <i className="fa-solid fa-arrow-right text-white"></i>
            </span>
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
      <Testimonial/>

      {/* Video banner */}
      <div
        className="py-24 md:py-44 flex justify-center items-center"
        style={{
          backgroundImage: `url(${banner1})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <a
          href="#"
          className="bg-primaryColor rounded-full w-14 h-14 md:w-16 md:h-16 flex justify-center items-center animate-ringing"
        >
          <i className="fa-solid fa-play text-white text-lg md:text-xl"></i>
        </a>
      </div>

      {/* Team */}
      <div className="pt-10 md:pt-16 pb-16 md:pb-20 px-4 md:px-side text-center bg-[#F5F7FA]">
        <p className="uppercase text-primaryColor font-semibold tracking-widest text-sm md:text-base">
          Our Team
        </p>
        <h3 className="mt-3 text-2xl md:text-3xl font-extrabold">
          Meet Our Expert <span className="text-primaryColor">Team</span>
        </h3>

        <div className="mt-8 md:mt-10">
          <Slider {...testimonialsettings}>
            {team.map((member) => (
              <div key={member.id} className="px-2 md:px-3">
                <div className="bg-white rounded-xl p-3">
                  <img
                    src={member.image}
                    className="w-full h-48 md:h-64 object-cover rounded-xl"
                    alt={member.name}
                  />
                  <div className="mt-3 text-center">
                    <p className="font-semibold text-base md:text-lg">{member.name}</p>
                    <p className="font-semibold text-primaryColor text-sm md:text-base">
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
    <Policies/>
      {/* Instagram */}
      <Instagrammedion/>
      {/* Trusted companies */}
      <div className="py-10 md:py-16 px-4 md:px-side text-center bg-[#F5F7FA]">
        <h3 className="mt-3 text-2xl md:text-4xl font-bold">
          Trusted by over <span className="text-primaryColor">3.2k+</span>{" "}
          companies{" "}
        </h3>

        <div className="flex flex-wrap gap-3 md:gap-4 justify-center mx-0 md:mx-side mt-8 md:mt-10">
          {categories.map((category) => (
            <div key={category.id}>
              <div className="border-[2px] border-primaryColor/20 py-4 md:py-[20px] rounded-3xl transition-all duration-700 group hover:border-primaryColor flex flex-col justify-center items-center text-center">
                <div className="py-2 md:py-3 px-6 md:px-7 flex justify-center items-center text-center">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="group-hover:scale-110 transition-all duration-500 w-10 md:w-14 invert"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="relative overflow-hidden px-5 md:px-6 py-2.5 md:py-3 mt-7 font-semibold text-white bg-primaryColor rounded-xl group">
          <span className="relative z-10 text-white transition-colors duration-300 text-sm md:text-base">
            Shop Now <i className="fa-solid fa-arrow-right text-white"></i>
          </span>
          <span className="absolute inset-0 rounded-xl scale-0 opacity-0 bg-secondaryColor group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 ease-in-out"></span>
        </button>
      </div>
    </>
  );
};

export default About;