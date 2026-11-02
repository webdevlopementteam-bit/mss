import { SectionHeader } from "../components/ui/ProductRail";
import { FaqAccordion } from "../components/ui/FaqAccordion";

/* Home-page FAQs. The visible accordion and the FAQPage JSON-LD are built
 * from the same list (see FaqAccordion) so the schema matches the page. */
const HOME_FAQS = [
  {
    question: "Where to buy medical and surgical equipment online in India?",
    answer:
      "You can buy medical and surgical equipment online from Medical & Surgical Solutions (medicalsurgicalsolutions.com). We offer 15,000+ products for hospitals, clinics and healthcare professionals, with pan-India delivery. Browse our online catalog or call +91 9643344588 to place an order.",
  },
  {
    question: "Who is the best supplier of medical and surgical equipment in India?",
    answer:
      "Medical & Surgical Solutions is a trusted supplier of medical and surgical equipment in India, serving 11,000+ happy customers and 750+ global clients. Based in Delhi, we deliver quality products across India to hospitals and institutions.",
  },
  {
    question: "Which is the best website to buy surgical instruments online in India?",
    answer:
      "medicalsurgicalsolutions.com is a reliable website to buy surgical instruments and medical products online. You can browse 15,000+ products, track your order online and get support by phone or email.",
  },
  {
    question: "Where can I buy hospital equipment in bulk in India?",
    answer:
      "You can buy hospital equipment in bulk from Medical & Surgical Solutions. For large or custom orders, call +91 9643344588 or email care@medicalsurgical.org, and our team will assist you personally.",
  },
  {
    question: "Where to buy surgical instruments and medical products in bulk at affordable prices in India?",
    answer:
      "Medical & Surgical Solutions supplies surgical instruments and medical products in bulk to hospitals and clinics at affordable prices. Contact us with your product list and quantity to get a quote.",
  },
  {
    question: "How to find a trusted medical equipment supplier in India?",
    answer:
      "Look for a supplier with a large product range, a proven customer base and responsive support. Medical & Surgical Solutions serves 11,000+ customers, offers 15,000+ products and provides support Monday to Saturday, available 24/7.",
  },
  {
    question: "Which is the best online store for medical disposables and surgical consumables in India?",
    answer:
      "Medical & Surgical Solutions is a dependable online store for medical disposables, surgical consumables and hospital supplies. We deliver genuine products across India, and you can track your order online.",
  },
  {
    question: "Where to buy medical equipment for a new clinic or nursing home in India?",
    answer:
      "Medical & Surgical Solutions can supply the equipment for your new clinic or nursing home. If you need a product that is not on our website, we can source it for you. Call +91 9643344588 to discuss your requirement.",
  },
  {
    question: "Who are the best medical equipment suppliers in Delhi?",
    answer:
      "Medical & Surgical Solutions is a Delhi-based medical equipment supplier located at 402, Ground Floor, Near Bagga Link, Patparganj Industrial Area, Delhi-110092. We supply hospitals and institutions in Delhi and across India.",
  },
  {
    question: "How to get a quotation for medical equipment in bulk in India?",
    answer: "Getting a quote from Medical & Surgical Solutions takes 3 steps:",
    steps: [
      "Visit medicalsurgicalsolutions.com or call +91 9643344588.",
      "Share your product names and quantities, or email care@medicalsurgical.org.",
      "Our team will send you a quotation with price and delivery details.",
    ],
  },
];

export const HomeFaq = () => (
  <section className="px-4 md:px-6 lg:px-side mt-12 md:mt-20">
    <SectionHeader
      eyebrow="FAQs"
      title="Frequently Asked Questions"
      subtitle="Buying medical and surgical equipment online, in bulk and across India."
      viewAllTo="/faq"
      viewAllLabel="All FAQs"
    />
    <FaqAccordion faqs={HOME_FAQS} className="grid lg:grid-cols-2 gap-3 items-start" />
  </section>
);
