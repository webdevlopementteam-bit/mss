import { Link } from "react-router-dom";
import logo from "../assets/home/logo.png";
import razorpay from "../assets/razorpay.png";

const FEATURES = [
  ["fa-shield-heart", "Genuine Products", "Sourced from authorised brands"],
  ["fa-truck-fast", "Pan-India Delivery", "Fast & tracked shipping"],
  ["fa-lock", "Secure Payments", "Razorpay protected checkout"],
  ["fa-headset", "Expert Support", "Call us anytime"],
];

const QUICK_LINKS = [
  ["Home", "/"],
  ["About", "/about"],
  ["Shop", "/shop"],
  ["Blog", "/blog"],
  ["Award", "/award"],
  ["Contact", "/contact"],
  ["Account", "/login"],
];

const SUPPORT_LINKS = [
  ["FAQ's", "/faq"],
  ["Privacy Policy", "/privacy-policy"],
  ["Terms & Conditions", "/terms-conditions"],
  ["Return Policy", "/return-policy"],
  ["Track Your Order", "https://www.dtdc.com/track-your-shipment/"],
  ["Dashboard", "/user-dashboard"],
  ["Recently Viewed", "/recently-viewed"],
];

const SOCIALS = [
  ["fa-facebook-f", "Facebook", "https://www.facebook.com/people/Medical-and-Surgical-Solutions/61571157007880/"],
  ["fa-youtube", "YouTube", "https://www.youtube.com/@MEDICALANDSURGICALSOLUTIONS"],
  ["fa-instagram", "Instagram", "https://www.instagram.com/mssofficial2011/"],
  ["fa-linkedin-in", "LinkedIn", "https://www.linkedin.com/company/medical-surgical-solutions/"],
];

const CONTACTS = [
  ["fa-phone", "Call us", "+91 9643344588", "tel:9643344588"],
  ["fa-envelope", "Email", "care@medicalsurgical.org", "mailto:care@medicalsurgical.org"],
  ["fa-location-dot", "Visit", "402, Ground Floor, Near Bagga Link, Patparganj Industrial Area, Delhi-110092"],
  ["fa-clock", "Hours", "Monday to Saturday · Available 24/7"],
];

const ColumnTitle = ({ children }) => (
  <h4 className="text-[15px] font-bold !text-white mb-5 flex items-center gap-2">
    <span className="w-1.5 h-4 rounded-full bg-primaryColor"></span>
    {children}
  </h4>
);

const FooterLink = ({ label, to }) => {
  const cls =
    "group inline-flex items-center gap-2 text-sm !text-white/65 hover:!text-white transition-colors";
  const inner = (
    <>
      <i className="fa-solid fa-chevron-right text-[8px] !text-primaryColor -ml-3 opacity-0 group-hover:ml-0 group-hover:opacity-100 transition-all duration-300"></i>
      <span className="!text-inherit">{label}</span>
    </>
  );
  return to.startsWith("http") ? (
    <a href={to} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  );
};

const Footer = () => {
  return (
    <footer className="relative bg-[#023350] overflow-hidden pb-20 lg:pb-0">
      {/* Decorative glows + top accent line */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-secondaryColor/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 w-[28rem] h-[28rem] rounded-full bg-primaryColor/15 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primaryColor via-secondaryColor to-primaryColor" />

      <div className="relative px-4 md:px-6 lg:px-side">
        {/* Feature strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-b-2xl overflow-hidden">
          {FEATURES.map(([icon, title, sub]) => (
            <div key={title} className="bg-[#023350] flex items-center gap-3 md:gap-4 px-3 md:px-6 py-5 md:py-6">
              <span className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center">
                <i className={`fa-solid ${icon} text-sm md:text-base !text-[#7fd1c3]`}></i>
              </span>
              <div className="min-w-0">
                <p className="text-[13px] md:text-[15px] font-bold !text-white leading-tight">{title}</p>
                <p className="text-[11px] md:text-xs !text-white/55 mt-0.5 leading-snug">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main columns */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 py-12 md:py-14">
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" className="inline-block bg-white rounded-2xl p-2.5 shadow-lg">
              <img src={logo} alt="MSS logo" className="w-20" />
            </Link>
            <p className="mt-5 text-sm leading-7 !text-white/65 max-w-sm">
              Medical & Surgical Solutions — a trusted partner for healthcare professionals,
              hospitals and institutions, delivering genuine medical and surgical supplies across India.
            </p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map(([icon, label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center hover:bg-primaryColor hover:border-primaryColor hover:-translate-y-0.5 transition-all duration-300"
                >
                  <i className={`fa-brands ${icon} text-sm !text-white`}></i>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <ColumnTitle>Quick Links</ColumnTitle>
            <ul className="space-y-3">
              {QUICK_LINKS.map(([label, to]) => (
                <li key={label}>
                  <FooterLink label={label} to={to} />
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <ColumnTitle>Support</ColumnTitle>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map(([label, to]) => (
                <li key={label}>
                  <FooterLink label={label} to={to} />
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-4">
            <ColumnTitle>Get in Touch</ColumnTitle>
            <ul className="space-y-4">
              {CONTACTS.map(([icon, label, value, href]) => {
                const body = (
                  <>
                    <span className="shrink-0 w-10 h-10 rounded-xl bg-primaryColor/90 flex items-center justify-center">
                      <i className={`fa-solid ${icon} text-sm !text-white`}></i>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-wider !text-white/45">{label}</span>
                      <span className="block text-sm leading-6 !text-white/85">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} className="flex items-start gap-3 hover:opacity-90">
                        {body}
                      </a>
                    ) : (
                      <div className="flex items-start gap-3">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-center md:text-left !text-white/55">
            © {new Date().getFullYear()} <span className="font-semibold !text-white">MSS</span>. All rights reserved ·
            Powered by{" "}
            <a
              href="https://www.cybertricksmedia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold !text-white hover:!text-[#7fd1c3] transition-colors"
            >
              Cybertricksmedia Pvt Ltd
            </a>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs !text-white/45">Secure payments by</span>
            <span className="bg-white rounded-lg px-3 py-1.5">
              <img src={razorpay} alt="Razorpay" className="h-5 w-auto" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
