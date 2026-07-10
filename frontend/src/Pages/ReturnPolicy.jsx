import { Link } from "react-router-dom";
import privacypolicybanner from "../assets/privacypolicybanner.jpg";

const ReturnPolicy = () => {
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
            Exchange & Return Policy
          </h2>
          <p className="text-white mt-3">
            <span className="text-white hover:text-primaryColor transition-all duration-500 group">
              <Link to="/">
                <i className="fa-regular fa-house text-white group-hover:text-primaryColor transition-all duration-500"></i>{" "}
                Home
              </Link>
            </span>{" "}
            <i className="fa-solid fa-angles-right text-white"></i> Exchange & Return Policy
          </p>
        </div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Exchange & Return Policy content */}
      <div className="px-side py-16">
        <h3 className="text-xl font-semibold">
          Medical Surgical Solutions Return, Replacement, and Cancellation Policy
        </h3>
        <p className="text-lg mt-3 font-semibold">Introduction</p>
        <p className="mt-3">
          At Medical Surgical Solutions, we strive to provide high-quality products and excellent customer service. This policy outlines our procedures for returns, replacements, and cancellations.
        </p>
        <p className="text-lg mt-3 font-semibold">Return Policy</p>
        
        <ol className="mt-3 list-decimal">
          <li>
            <b> Eligibility: </b>Products must be in original packaging, unused, and in resalable condition.
          </li>
          <li className="mt-2">
            <b>Timeframe: </b>Returns accepted within 30 days of delivery.
          </li>
          <li className="mt-2">
            <b>Process: </b>
          </li>
        <p className="mt-3">- Contact us via phone/email with order number and reason for return.</p>
        <p className="mt-3">- Obtain Return Merchandise Authorization (RMA) number.</p>
        <p className="mt-3">- Ship product back to us within 7 days of RMA issuance.</p>
         <li className="mt-2">
            <b>Refund: </b>
          </li>
        <p className="mt-3">- Full refund for original purchase price (minus shipping).</p>
        <p className="mt-3"> - Refund processed within 7-10 business days.</p>
        </ol>
        
        <p className="text-lg mt-3 font-semibold">Replacement Policy</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Defective or Damaged Products: </b>Contact us within 7 days of delivery.
          </li>
          <li className="mt-2">
            <b>Incorrect Order: </b>Contact us within 7 days of delivery.
          </li>
          <li className="mt-2">
            <b>Process: </b>
          </li>
        </ol>
         <p className="mt-3">- Contact us via phone/email with order number and reason for replacement.</p>
        <p className="mt-3">- Ship defective/incorrect product back to us.</p>
        <p className="mt-3">- Replacement shipped within 7-10 business days.</p>
        <p className="text-lg mt-3 font-semibold">Cancellation Policy</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Order Cancellation: </b>Contact us before shipment.
          </li>
          <li className="mt-2">
            <b>Partial Cancellation: </b>Contact us before shipment; partial refunds processed accordingly.
          </li>
          <li className="mt-2">
            <b>Restocking Fee: </b>10% of original purchase price (if product already shipped).
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Exceptions</p>
        <ol className="mt-3 list-decimal">
          <li>
            <b>Custom Orders: </b>Non-returnable, non-refundable.
          </li>
          <li className="mt-2">
            <b>Special Orders: </b>Non-returnable, non-refundable.
          </li>
          <li className="mt-2">
            <b>Hygienic Products: </b>Non-returnable due to health and safety regulations.
          </li>
        </ol>
        <p className="text-lg mt-3 font-semibold">Contact Us</p>
        <p className="mt-3">For returns, replacements, or cancellations, please contact:</p>
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
         By placing an order, you acknowledge that you have read, understood, and agree to this Return, Replacement, and Cancellation Policy.
        </p>
      </div>
    </>
  )
}

export default ReturnPolicy
