import { Link } from "react-router-dom";
import privacypolicybanner from "../assets/privacypolicybanner.jpg";

const TermsConditions = () => {
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
          <h2 className="text-3xl font-semibold text-white">
            Terms & Conditions
          </h2>
          <p className="text-white mt-3">
            <span className="text-white hover:text-primaryColor transition-all duration-500 group">
              <Link to="/">
                <i className="fa-regular fa-house text-white group-hover:text-primaryColor transition-all duration-500"></i>{" "}
                Home
              </Link>
            </span>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> Terms &
            Conditions
          </p>
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* terms-conditions content */}
      <div className="px-side py-16">
        <h3 className="text-xl font-semibold">
          Medical Surgical Solutions Terms and Conditions
        </h3>
        <p className="text-lg mt-3 font-semibold">Introduction</p>
        <p className="mt-3">
          Welcome to Medical Surgical Solutions! These Terms and Conditions
          ("Terms") govern your use of our website (the "Site") and purchase of
          products from us.
        </p>
        <p className="text-lg mt-3 font-semibold">Definitions</p>
        <p className="mt-3">
          - "We," "Us," or "Our" refers to Medical Surgical Solutions.
        </p>
        <p className="mt-3">
          - "You" or "Customer" refers to the user of the Site or purchaser of
          products.
        </p>
        <p className="mt-3">
          - "Products" refers to medical equipment and supplies sold on the
          Site.
        </p>
        <p className="text-lg mt-3 font-semibold">Using the Site</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Age Restriction: </b>You must be 18+ years old to use the Site.
          </li>
          <li className="mt-2">
            <b>Compliance: </b>You agree to comply with these Terms and all
            applicable laws.
          </li>
          <li className="mt-2">
            <b>Prohibited Activities: </b>You shall not:
          </li>
        </ol>
        <p className="mt-3">- Use the Site for unlawful purposes.</p>
        <p className="mt-3">- Interfere with Site operations.</p>
        <p className="mt-3">- Upload harmful files or content.</p>
        <p className="text-lg mt-3 font-semibold">Ordering and Payment</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Order Acceptance: </b>We reserve the right to accept or decline
            orders.
          </li>
          <li className="mt-2">
            <b>Payment Terms: </b>Payment is due at checkout.
          </li>
          <li className="mt-2">
            <b>Prices: </b>Prices are subject to change without notice.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Product Information</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Product Descriptions: </b>We strive for accuracy, but
            descriptions may vary.
          </li>
          <li className="mt-2">
            <b>Product Availability: </b>Availability is not guaranteed.
          </li>
          <li className="mt-2">
            <b> Product Warranty: </b>Manufacturer warranties apply.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Shipping and Delivery</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Shipping: </b>Shipping costs and estimated delivery times are
            provided at checkout.
          </li>
          <li className="mt-2">
            <b>Delivery: </b>Delivery signatures may be required.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">
          Returns, Refunds, and Cancellations
        </p>
        <ol className="mt-3 list-decimal">
          <li className="mt-2">
            <b>Return Policy: </b>See our Return, Replacement, and Cancellation
            Policy.
          </li>
          <li className="mt-2">
            <b>Refunds: </b>Refunds processed according to our policy.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Intellectual Property</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Copyright: </b>Site content is our property or licensed.
          </li>
          <li className="mt-2">
            <b>Trademarks: </b>Our trademarks and logos are protected.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">
          Disclaimer and Limitation of Liability
        </p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>No Warranties: </b>Site and products are provided "as-is."
          </li>
          <li className="mt-2">
            <b>Limitation of Liability: </b>Our liability is limited to purchase
            price.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Indemnification</p>
        <p className="mt-3">
          You agree to indemnify and hold us harmless from claims, damages, and
          expenses.
        </p>
        <p className="text-lg mt-3 font-semibold">Changes to Terms</p>
        <p className="mt-3">We reserve the right to update these Terms.</p>
        <p className="mt-3">Contact Us</p>
        <p className="mt-3">For questions or concerns, please contact:</p>
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

export default TermsConditions;
