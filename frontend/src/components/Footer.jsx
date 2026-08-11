import { Link } from "react-router-dom";
import footerbanner from "../assets/home/footerbanner.jpg";
import logo from "../assets/home/logo.png";
import razorpay from "../assets/razorpay.png";
import { categories } from "../data";

const Footer = () => {
  return (
    <>
      <div
        className="bg-primaryColor/60 px-4 md:px-6 lg:px-side py-10 relative overflow-hidden before:content-[' '] before:absolute before:w-96 before:h-96 before:bg-primaryColor/10 before:rounded-full before:-top-40 after:content-[' '] after:absolute after:w-96 after:h-96 after:bg-primaryColor/10 after:rounded-full after:-bottom-40 after:right-10"
        // style={{
        //   backgroundImage: `url(${footerbanner})`,
        //   backgroundPosition: "center center",
        //   backgroundSize: "cover",
        // }}
      >
        <div className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-8 lg:gap-10 pb-10 border-b-[1px] border-gray-500">
            <div className="xl:col-span-2">
              <img src={logo} alt="logo" className="w-28" />
              <p className="text-white mt-3">
                Medical & Surgical Solutions, we take pride in being a trusted
                partner for healthcare professionals, hospitals, and
                institutions.
              </p>
              <img src={razorpay} alt="rupay" className="mt-2 w-[50%]" />
            </div>
            <div className="mt-7">
              <p className="text-white text-lg relative pb-4 before:content-[' '] before:absolute before:w-4 before:h-[2px] before:bg-primaryColor before:bottom-0 before:left-0 after:content-[' '] after:absolute after:w-10 after:h-[2px] after:bg-gray-700 after:bottom-0 after:left-5">
                Quick Links
              </p>
              <ul className="mt-4 flex flex-col justify-center items-start gap-1">
                <Link to="/">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Home{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/about">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    About{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/shop">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Shop{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/blog">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Blog{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/award">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Award{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/contact">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Contact{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/login">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Account{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
              </ul>
            </div>
            <div className="mt-7">
              <p className="text-white text-lg relative pb-4 before:content-[' '] before:absolute before:w-4 before:h-[2px] before:bg-primaryColor before:bottom-0 before:left-0 after:content-[' '] after:absolute after:w-10 after:h-[2px] after:bg-gray-700 after:bottom-0 after:left-5">
                Support Center
              </p>
              <ul className="mt-4 flex flex-col justify-center items-start gap-1">
                <Link to="/faq">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    FAQ's{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/privacy-policy">
                  {" "}
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Privacy Policy{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/terms-conditions">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Terms & Conditions{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="https://www.dtdc.com/track-your-shipment/">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                  Track Your Order{" "}
                  <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                </li>
                </Link>
                
                <Link to="/return-policy">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                    Return Policy{" "}
                    <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                  </li>
                </Link>
                <Link to="/user-dashboard">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                  Dashboard{" "}
                  <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                </li>
                </Link>
                
                <Link to="/recently-viewed">
                  <li className="text-white cursor-pointer translate-x-0 hover:translate-x-2 group transition-all duration-500 hover:text-primaryColor relative ">
                  Recently Viewed{" "}
                  <span className="transition-all duration-500  absolute w-2 h-2 bg-primaryColor rounded-full top-1/3 -left-3 translate-x-0 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"></span>
                </li>
                </Link>
                
              </ul>
            </div>
            <div className="mt-7 xl:col-span-2">
              <p className="text-white text-lg relative pb-4 before:content-[' '] before:absolute before:w-4 before:h-[2px] before:bg-primaryColor before:bottom-0 before:left-0 after:content-[' '] after:absolute after:w-10 after:h-[2px] after:bg-gray-700 after:bottom-0 after:left-5">
                Contact Info
              </p>
              <ul className="mt-4 flex flex-col justify-center items-start gap-4">
                <li>
                  <span className="p-2 bg-primaryColor rounded-full">
                    <i className="fa-solid fa-phone text-white"></i>
                  </span>{" "}
                  <a href="tel:9643344588" className="text-white">
                    +91 9643344588
                  </a>
                </li>
                <li className="flex items-center gap-1">
                  <span className="p-2 bg-primaryColor rounded-full">
                    <i className="fa-solid fa-location-dot text-white"></i>
                  </span>
                  <p className="text-white leading-7">
                    {" "}
                    402, Ground Floor, Near Bagga Link, Patparganj Industrial
                    Area, Delhi-110092
                  </p>
                </li>
                <li>
                  <span className="p-2 bg-primaryColor rounded-full">
                    <i className="fa-regular fa-envelope text-white"></i>
                  </span>{" "}
                  <a
                    href="mailto:care@medicalsurgical.org"
                    className="text-white"
                  >
                    care@medicalsurgical.org
                  </a>
                </li>
                <li className="text-white mt-1">
                  <span className="p-2 bg-primaryColor rounded-full">
                    <i className="fa-regular fa-clock text-white"></i>
                  </span>{" "}
                  Monday to Saturday: Available 24/7
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center pt-7">
            <div>
              <p className="text-white">
                © Copyright 2026{" "}
                <span className="text-primaryColor font-semibold">MSS</span> All
                Right Reserved | Powered by{" "}
                <span className="text-primaryColor font-semibold">
                  <a href="https://www.cybertricksmedia.com/" target="_blank">
                    Cybertricksmedia Pvt Ltd
                  </a>
                </span>
              </p>
            </div>
            <div className="hidden md:flex flex-col sm:flex-row gap-3 items-center">
              <p className="font-semibold text-white">Follow Us: </p>
               <div className="flex gap-2">
              <a
                href="https://www.facebook.com/people/Medical-and-Surgical-Solutions/61571157007880/"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-facebook text-white  transition-all duration-700"></i>
              </a>
              <a
                href="https://www.youtube.com/@MEDICALANDSURGICALSOLUTIONS"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-youtube text-white  transition-all duration-700"></i>
              </a>
              <a
                href="https://www.instagram.com/mssofficial2011/"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-instagram text-white  transition-all duration-700"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/medical-surgical-solutions/"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-linkedin text-white  transition-all duration-700"></i>
              </a>
            </div>
            </div>
          </div>
          <div className="md:hidden flex flex-col gap-3  items-start mt-3">
            <p className="font-semibold text-white">Follow Us: </p>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/people/Medical-and-Surgical-Solutions/61571157007880/"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-facebook text-white  transition-all duration-700"></i>
              </a>
              <a
                href="https://www.youtube.com/@MEDICALANDSURGICALSOLUTIONS"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-youtube text-white  transition-all duration-700"></i>
              </a>
              <a
                href="https://www.instagram.com/mssofficial2011/"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-instagram text-white  transition-all duration-700"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/medical-surgical-solutions/"
                target="_blank"
                className="py-[7px] px-2 rounded-full bg-primaryColor/30 transition-all duration-700 hover:bg-primaryColor"
              >
                <i className="fa-brands fa-linkedin text-white  transition-all duration-700"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
