import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import faqs from "../assets/faqs.png";
import { faq, contactinfo } from "../data";
import { PageHeader } from "../components/ui/PageHeader";

const Faq = () => {
  const [open, setOpen] = useState(faq[0]?.id ?? null);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? faq.filter((f) => `${f.question} ${f.answer}`.toLowerCase().includes(q)) : faq;
  }, [query]);

  const info = contactinfo[0];

  return (
    <div className="bg-[#F6F7F9] pb-14 md:pb-20">
      <PageHeader title="Frequently Asked Questions" crumb="FAQs" icon="fa-circle-question" subtitle="Quick answers about accounts, orders, delivery and more.">
        <div className="relative w-full sm:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm !text-white/50"></i>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions…"
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-sm !text-white placeholder:text-white/50 outline-none focus:bg-white/15 focus:border-white/40 transition"
          />
        </div>
      </PageHeader>

      <div className="px-4 md:px-6 lg:px-side pt-6 md:pt-10 grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
        {/* Accordion */}
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center">
              <p className="font-semibold !text-gray-700">No questions match "{query}".</p>
              <p className="mt-1 text-sm !text-gray-500">Try another word, or contact us directly.</p>
            </div>
          )}
          {items.map((f, i) => {
            const isOpen = open === f.id;
            return (
              <div
                key={f.id}
                className={`bg-white rounded-2xl border transition-all duration-300 ${
                  isOpen ? "border-primaryColor/30 shadow-[0_18px_40px_-25px_rgba(181,35,39,0.45)]" : "border-gray-200/80 hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : f.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 text-left px-4 md:px-6 py-4 md:py-5"
                >
                  <span
                    className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                      isOpen ? "bg-primaryColor !text-white" : "bg-[#F1F3F6] !text-[#023350]"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`flex-1 text-[15px] md:text-base font-semibold leading-snug ${isOpen ? "!text-primaryColor" : "!text-[#023350]"}`}>
                    {f.question}
                  </span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isOpen ? "rotate-45 border-primaryColor bg-primaryColor/5" : "border-gray-200"
                    }`}
                  >
                    <i className={`fa-solid fa-plus text-xs ${isOpen ? "!text-primaryColor" : "!text-gray-500"}`}></i>
                  </span>
                </button>

                <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-4 md:px-6 pb-5 md:pl-[4.75rem] text-[14.5px] leading-7 !text-gray-600">{f.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help card */}
        <aside className="lg:sticky lg:top-6 bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
          <div className="bg-gradient-to-b from-secondaryColor/10 to-transparent px-6 pt-6">
            <img src={faqs} alt="" className="w-full max-w-[260px] mx-auto" />
          </div>
          <div className="p-6 pt-4">
            <h2 className="text-lg font-bold !text-[#023350]">Still have questions?</h2>
            <p className="mt-1 text-sm leading-relaxed !text-gray-500">
              Can't find the answer you're looking for? Our team is happy to help.
            </p>
            <div className="mt-4 space-y-2.5">
              <a href={`tel:${info.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 rounded-xl bg-[#F6F7F9] px-4 py-3 hover:bg-primaryColor/5 transition">
                <i className="fa-solid fa-phone text-sm !text-primaryColor"></i>
                <span className="text-sm font-semibold !text-[#023350]">{info.phone}</span>
              </a>
              <a href={`mailto:${info.email}`} className="flex items-center gap-3 rounded-xl bg-[#F6F7F9] px-4 py-3 hover:bg-primaryColor/5 transition">
                <i className="fa-solid fa-envelope text-sm !text-primaryColor"></i>
                <span className="text-sm font-semibold !text-[#023350] break-all">{info.email}</span>
              </a>
            </div>
            <Link
              to="/contact"
              className="mt-4 w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-primaryColor hover:bg-[#9e1d21] text-sm font-semibold !text-white transition-colors"
            >
              Contact Support <i className="fa-solid fa-arrow-right text-[11px] !text-white"></i>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Faq;
