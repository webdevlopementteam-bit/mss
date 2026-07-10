import { Link } from "react-router-dom";
import contactbanner from "../assets/contactbanner.jpg";
import { contactinfo } from "../data";
import Emailsubscription from "../sections/Emailsubscription";

const Contact = () => {
  return (
    <>
      {/* Banner Section */}
      <div
        className="relative overflow-hidden py-20 md:py-28 lg:py-32 px-4"
        style={{
          backgroundImage: `url(${contactbanner})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-side">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white">
            Contact Us
          </h2>

          <p className="text-white mt-4 flex flex-wrap items-center gap-2 text-sm md:text-base">
            <Link
              to="/"
              className="hover:text-primaryColor transition-all duration-500"
            >
              <i className="fa-regular fa-house mr-1"></i>
              Home
            </Link>

            <i className="fa-solid fa-angles-right"></i>

            <span>Contact Us</span>
          </p>
        </div>

        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-side py-12 lg:py-16">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="xl:col-span-2">
            {contactinfo.map((info, index) => (
              <div key={index}>
                {/* First Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-white shadow-lg shadow-black/10 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="bg-primaryColor rounded-full p-4">
                      <i className="fa-solid fa-map-location-dot text-3xl text-white"></i>
                    </div>

                    <h4 className="font-semibold text-lg mt-4">
                      Office Address
                    </h4>

                    <p className="text-black/60 mt-2">
                      {info.address}
                    </p>
                  </div>

                  <div className="bg-white shadow-lg shadow-black/10 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="bg-primaryColor rounded-full p-4">
                      <i className="fa-regular fa-clock text-3xl text-white"></i>
                    </div>

                    <h4 className="font-semibold text-lg mt-4">
                      Open Time
                    </h4>

                    <p className="text-black/60 mt-2">
                      {info.time}
                    </p>

                    <p className="text-black/60">
                      {info.availability}
                    </p>
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
                  <div className="bg-white shadow-lg shadow-black/10 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="bg-primaryColor rounded-full p-4">
                      <i className="fa-solid fa-headset text-3xl text-white"></i>
                    </div>

                    <h4 className="font-semibold text-lg mt-4">
                      Call Us
                    </h4>

                    <p className="text-black/60 mt-2 break-words">
                      {info.phone}
                    </p>
                  </div>

                  <div className="bg-white shadow-lg shadow-black/10 p-6 rounded-2xl flex flex-col items-center text-center">
                    <div className="bg-primaryColor rounded-full p-4">
                      <i className="fa-regular fa-envelope text-3xl text-white"></i>
                    </div>

                    <h4 className="font-semibold text-lg mt-4">
                      Email Us
                    </h4>

                    <p className="text-black/60 mt-2 break-all">
                      {info.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="xl:col-span-3 bg-white shadow-lg shadow-black/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-semibold">
              Get In Touch
            </h3>

            <p className="mt-3 text-black/60 leading-7">
              It is a long established fact that a reader will be distracted by
              the readable content of a page when looking at its layout.
            </p>

            <form className="mt-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="py-3 px-5 border border-black/15 rounded-xl outline-primaryColor"
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  className="py-3 px-5 border border-black/15 rounded-xl outline-primaryColor"
                />
              </div>

              <input
                type="text"
                placeholder="Your Subject"
                className="w-full py-3 px-5 border border-black/15 rounded-xl outline-primaryColor"
              />

              <textarea
                rows={5}
                placeholder="Write Your Message"
                className="w-full py-3 px-5 border border-black/15 rounded-xl outline-primaryColor resize-none"
              ></textarea>

              <button
                type="submit"
                className="relative overflow-hidden bg-primaryColor px-7 py-3 rounded-xl group"
              >
                <span className="relative z-10 text-white font-medium">
                  Send Message{" "}
                  <i className="fa-regular fa-paper-plane ml-1"></i>
                </span>

                <span className="absolute inset-0 bg-secondaryColor scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 rounded-xl"></span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Email Subscription */}
      <Emailsubscription />

      {/* Google Map */}
      <div className="mt-12 lg:mt-16">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.6512294263116!2d77.30536750946962!3d28.64021332555896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfb3f3d95f0bb%3A0xd06142fa0b7860e5!2sMEDICAL%20%26%20SURGICAL%20SOLUTIONS!5e0!3m2!1sen!2sin!4v1770013271819!5m2!1sen!2sin"
          width="100%"
          height="450"
          loading="lazy"
          title="Google Map"
          className="w-full"
        ></iframe>
      </div>
    </>
  );
};

export default Contact;