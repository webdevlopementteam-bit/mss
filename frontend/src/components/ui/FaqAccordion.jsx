import { useState } from "react";

/* FAQ accordion + its FAQPage JSON-LD, both built from the same `faqs`
 * list ({ question, answer, steps? }) so the schema always matches what's
 * on the page. Answers stay in the DOM when collapsed so crawlers can read them. */

const schemaText = (f) =>
  f.steps?.length ? `${f.answer} ${f.steps.map((s, i) => `${i + 1}) ${s}`).join(" ")}` : f.answer;

export const buildFaqSchema = (faqs) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: schemaText(f) },
  })),
});

export const FaqAccordion = ({ faqs, className = "space-y-3" }) => {
  const [open, setOpen] = useState(0);
  if (!faqs?.length) return null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqs)) }} />

      <div className={className}>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={`${i}-${f.question}`}
              className={`bg-white rounded-2xl border transition-all duration-300 ${
                isOpen ? "border-primaryColor/30 shadow-[0_18px_40px_-25px_rgba(181,35,39,0.45)]" : "border-gray-200/80 hover:border-gray-300"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
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
                <h3 className={`flex-1 text-[15px] md:text-base font-semibold leading-snug ${isOpen ? "!text-primaryColor" : "!text-[#023350]"}`}>
                  {f.question}
                </h3>
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
                  <div className="px-4 md:px-6 pb-5 md:pl-[4.75rem] text-[14.5px] leading-7 !text-gray-600">
                    <p className="!text-gray-600 whitespace-pre-line">{f.answer}</p>
                    {f.steps?.length > 0 && (
                      <ol className="mt-2 list-decimal pl-5 space-y-1">
                        {f.steps.map((s) => (
                          <li key={s} className="!text-gray-600">{s}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
