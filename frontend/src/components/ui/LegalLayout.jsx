import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import { useSiteContent } from "../../api/siteContent";

/* Shared shell for the policy pages. The legal copy itself stays exactly as
 * written in each page; this only frames it. The "On this page" index is
 * built at runtime from the section headings already in that copy
 * (`p.text-lg.font-semibold`, skipping lead-in lines ending in ":" and the
 * underlined contact lines). When the admin has written this policy in
 * Store Customization → Policies (`cmsKey`), that content is shown instead
 * and its Heading 1/2 titles feed the index. */
export const LegalLayout = ({ title, icon, subtitle, cmsKey, children }) => {
  const contentRef = useRef(null);
  const { data: cms, loading } = useSiteContent(cmsKey);
  const cmsHtml = String(cms?.content || "").replace(/<[^>]*>/g, "").trim() ? cms.content : "";
  const pending = Boolean(cmsKey) && loading;
  const [toc, setToc] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    const heads = [...root.querySelectorAll("p.text-lg.font-semibold, .legal-cms h1, .legal-cms h2")].filter(
      (el) => !el.classList.contains("underline") && !el.textContent.trim().endsWith(":")
    );
    heads.forEach((el, i) => {
      el.id = `section-${i + 1}`;
      el.classList.add("legal-heading");
    });
    setToc(heads.map((el) => ({ id: el.id, label: el.textContent.trim() })));

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px" }
    );
    heads.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pending, cmsHtml]);

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="bg-[#F6F7F9] pb-14 md:pb-20">
      <PageHeader title={title} icon={icon} subtitle={subtitle} />

      <div className="px-4 md:px-6 lg:px-side pt-6 md:pt-10 grid lg:grid-cols-[270px_1fr] gap-6 lg:gap-8 items-start">
        <aside className="lg:sticky lg:top-6 space-y-4">
          {toc.length > 0 && (
            <nav className="hidden lg:block bg-white rounded-2xl border border-gray-200/80 p-4">
              <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] !text-gray-400">On this page</p>
              <ul className="space-y-0.5 max-h-[55vh] overflow-y-auto">
                {toc.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => jump(t.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[13px] leading-snug transition ${
                        active === t.id
                          ? "bg-primaryColor/[0.07] font-semibold !text-primaryColor"
                          : "!text-gray-600 hover:bg-gray-50 hover:!text-[#023350]"
                      }`}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className="relative overflow-hidden bg-[#023350] rounded-2xl p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full bg-secondaryColor/30 blur-2xl" />
            <i className="fa-solid fa-headset text-lg !text-[#7fd1c3]"></i>
            <p className="mt-2 font-bold !text-white">Have a question?</p>
            <p className="mt-1 text-[13px] leading-relaxed !text-white/70">Our support team is happy to clarify anything on this page.</p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 bg-primaryColor hover:bg-[#9e1d21] rounded-lg px-4 py-2 text-sm font-semibold !text-white transition-colors"
            >
              Contact us <i className="fa-solid fa-arrow-right text-[11px] !text-white"></i>
            </Link>
          </div>
        </aside>

        <article ref={contentRef} className="legal-content min-w-0 bg-white rounded-2xl border border-gray-200/80 p-5 md:p-10">
          {pending ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`h-4 rounded bg-gray-100 animate-pulse ${i % 3 === 2 ? "w-2/3" : ""}`} />
              ))}
            </div>
          ) : cmsHtml ? (
            <>
              {cms.title && <h3>{cms.title}</h3>}
              {cms.updatedAt && (
                <p className="!text-xs !text-gray-400 -mt-1 mb-2">
                  Last updated {new Date(cms.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
              <div className="legal-cms" dangerouslySetInnerHTML={{ __html: cmsHtml }} />
            </>
          ) : (
            children
          )}
        </article>
      </div>
    </div>
  );
};

export default LegalLayout;
