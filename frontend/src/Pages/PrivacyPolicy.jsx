import { Link } from "react-router-dom";
import privacypolicybanner from "../assets/privacypolicybanner.jpg";

const PrivacyPolicy = () => {
  return (
    <>
      {/* banner section */}
      <div
        className="p-5 relative overflow-hidden py-28"
        style={{
          backgroundImage: `url(${privacypolicybanner})`,
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10 flex flex-col justify-center items-center px-side">
          <h2 className="text-3xl font-semibold text-white">Privacy Policy</h2>
          <p className="text-white mt-3">
            <span className="text-white hover:text-primaryColor transition-all duration-500 group">
              <Link to="/">
                <i className="fa-regular fa-house text-white group-hover:text-primaryColor transition-all duration-500"></i>{" "}
                Home
              </Link>
            </span>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> Privacy
            Policy
          </p>
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* privacy content */}
      <div className="px-side py-16">
        <h3 className="text-xl font-semibold">
          Medical Surgical Solutions Privacy Policy
        </h3>
        <p className="text-lg mt-3 font-semibold">Introduction</p>
        <p className="mt-3">
          At Medical Surgical Solutions, we value your trust and commitment to
          protecting your personal information. This Privacy Policy explains how
          we collect, use, disclose, and protect your information when you visit
          our website.
        </p>
        <p className="text-lg mt-3 font-semibold">Information Collection</p>
        <p className="text-lg mt-3 font-semibold">
          We collect information from you in various ways:
        </p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Contact Information: </b>When you contact us through our website,
            we collect your name, email address, phone number, and message.
          </li>
          <li className="mt-2">
            <b>Order Information: </b>When you place an order, we collect your
            name, address, phone number, email address, and payment information.
          </li>
          <li className="mt-2">
            <b>Browsing Information: </b>We collect information about your
            website usage, such as pages visited, browser type, and device used.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Use of Information</p>
        <p className="mt-3">We use your information for:</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Order Processing: </b>To process and fulfill your orders.
          </li>
          <li className="mt-2">
            <b>Customer Service: </b>To respond to your inquiries and provide
            support.
          </li>
          <li className="mt-2">
            <b>Marketing: </b>To send newsletters, promotional emails, and
            special offers (with your consent).
          </li>
          <li className="mt-2">
            <b>Improving Services: </b>To analyze website usage and enhance your
            experience.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Disclosure of Information</p>
        <p className="mt-3">We may share your information with:</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Service Providers: </b>To process payments, ship orders, and
            provide customer service.
          </li>
          <li className="mt-2">
            <b>Business Partners: </b>To offer joint promotions or services.
          </li>
          <li className="mt-2">
            <b>Law Enforcement: </b>As required by law or to protect our rights.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Security Measures</p>
        <p className="mt-3">
          We implement industry-standard security measures to protect your
          information, including:
        </p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Encryption: </b>Secure Sockets Layer (SSL) encryption.
          </li>
          <li className="mt-2">
            <b>Firewalls: </b>To prevent unauthorized access.
          </li>
          <li className="mt-2">
            <b>Access Controls: </b>Limited access to authorized personnel.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Your Rights</p>
        <p className="text-lg mt-3 font-semibold">You have the right to:</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Access: </b>Request access to your information.
          </li>
          <li className="mt-2">
            <b>Correction: </b>Update or correct your information.
          </li>
          <li className="mt-2">
            <b>Deletion: </b>Request deletion of your information.
          </li>
          <li className="mt-2">
            <b>Opt-out: </b>Unsubscribe from marketing communications.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Changes to Privacy Policy</p>
        <p className="mt-3">
          We reserve the right to update this Privacy Policy. Changes will be
          posted on this page.
        </p>
        <p className="mt-3">Contact Us</p>
        <p className="mt-3">
          For questions or concerns about this Privacy Policy, please contact:
        </p>
        <p className="text-lg mt-3 font-semibold underline">
          Medical Surgical Solutions
        </p>
        <p className="text-lg mt-3 font-semibold underline">
          402, Ground Floor, Near Bagga Link, Patparganj Industrial Area,
          Delhi-110092{" "}
        </p>
        <p className="text-lg mt-3 font-semibold underline">+91 7982508578</p>
        <p className="text-lg mt-3 font-semibold underline">
          care@medicalsurgical.org
        </p>
        <p className="mt-3">Acceptance</p>
        <p className="mt-3">
          By using our website, you acknowledge that you have read, understood,
          and agree to this Privacy Policy.
        </p>
      </div>
    </>
  );
};

export default PrivacyPolicy;
