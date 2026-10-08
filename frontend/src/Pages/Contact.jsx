import { useState } from "react";
import { useContactInfo } from "../api/siteContent";
import Emailsubscription from "../sections/Emailsubscription";
import { PageHeader } from "../components/ui/PageHeader";

const inputCls =
  "w-full h-12 px-4 rounded-xl border border-gray-200 bg-[#FAFBFC] text-sm !text-gray-800 placeholder:text-gray-400 outline-none focus:border-primaryColor focus:bg-white focus:ring-4 focus:ring-primaryColor/10 transition";

const Contact = () => {
  // Details come from admin → Store Customization → Contact & Footer.
  const info = useContactInfo();
  const SUPPORT_EMAIL = info.email;
  const CARDS = [
    { icon: "fa-phone", title: "Call Us", lines: [info.phone], href: info.tel, cta: "Call now" },
    { icon: "fa-envelope", title: "Email Us", lines: [info.email], href: `mailto:${info.email}`, cta: "Send email" },
    { icon: "fa-location-dot", title: "Visit Us", lines: [info.address] },
    { icon: "fa-clock", title: "Working Hours", lines: [info.hours, info.availability].filter(Boolean) },
  ];

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // No contact-form endpoint exists on the backend yet, so the form opens the
  // visitor's mail app with everything pre-filled instead of silently
  // reloading the page.
  const handleSubmit = (e) => {
    e.preventDefault();
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
      form.subject || "Website enquiry"
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="bg-[#F6F7F9]">
      <PageHeader title="Contact Us" icon="fa-headset" subtitle="We're here to help with orders, bulk enquiries and product questions." />

      <section className="px-4 md:px-6 lg:px-side py-8 md:py-12">
        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="group bg-white rounded-2xl border border-gray-200/80 p-5 md:p-6 flex items-start gap-4 hover:shadow-[0_18px_40px_-20px_rgba(2,51,80,0.35)] hover:border-transparent transition-all duration-300"
            >
              <span className="shrink-0 w-12 h-12 rounded-xl bg-primaryColor/10 flex items-center justify-center group-hover:bg-primaryColor transition-colors">
                <i className={`fa-solid ${c.icon} !text-primaryColor group-hover:!text-white transition-colors`}></i>
              </span>
              <div className="min-w-0">
                <h3 className="font-bold !text-[#023350]">{c.title}</h3>
                {c.lines.map((l) => (
                  <p key={l} className="mt-1 text-sm leading-relaxed !text-gray-600 break-words">
                    {l}
                  </p>
                ))}
                {c.href && (
                  <a href={c.href} className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold !text-primaryColor hover:underline">
                    {c.cta} <i className="fa-solid fa-arrow-right text-[9px] !text-primaryColor"></i>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Form + map */}
        <div className="mt-6 md:mt-8 grid lg:grid-cols-5 gap-5 md:gap-6 items-stretch">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/80 p-5 md:p-8">
            <p className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] !text-primaryColor">
              <span className="w-6 h-[2px] bg-primaryColor rounded-full"></span>
              Get in touch
            </p>
            <h2 className="mt-2 text-2xl md:text-[28px] font-bold !text-[#023350]">Send us a message</h2>
            <p className="mt-2 text-sm md:text-[15px] !text-gray-500 leading-relaxed">
              Questions about a product, a bulk or institutional order, or an existing delivery? Drop us a
              line and our team will get back to you.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Your name" value={form.name} onChange={set("name")} className={inputCls} />
                <input required type="email" placeholder="Your email" value={form.email} onChange={set("email")} className={inputCls} />
              </div>
              <input type="text" placeholder="Subject" value={form.subject} onChange={set("subject")} className={inputCls} />
              <textarea
                required
                rows={5}
                placeholder="Write your message"
                value={form.message}
                onChange={set("message")}
                className={`${inputCls} h-auto py-3 resize-none`}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-primaryColor hover:bg-[#9e1d21] font-semibold !text-white shadow-[0_10px_25px_-10px_rgba(181,35,39,0.7)] transition-colors"
              >
                Send Message <i className="fa-regular fa-paper-plane text-sm !text-white"></i>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 overflow-hidden flex flex-col min-h-[320px]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-secondaryColor/10 flex items-center justify-center">
                <i className="fa-solid fa-map-location-dot text-sm !text-secondaryColor"></i>
              </span>
              <div className="min-w-0">
                <p className="font-bold text-sm !text-[#023350]">Find us on the map</p>
                <p className="text-xs !text-gray-500 truncate">{info.address}</p>
              </div>
            </div>
            <iframe
              src={info.mapEmbedUrl}
              loading="lazy"
              title="Google Map"
              className="w-full flex-1 min-h-[280px] border-0"
            ></iframe>
          </div>
        </div>
      </section>

      <Emailsubscription />
      <div className="h-12 md:h-16" />
    </div>
  );
};

export default Contact;
