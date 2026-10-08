import { useSiteCms, CmsHeader, Card, Field, TextInput, TextArea, SaveButton, Loading } from "./cmsShared";

// Pre-filled with the details currently hard-coded on the website.
const DEFAULTS = {
  phone: "+91 9643344588",
  email: "care@medicalsurgical.org",
  address: "402, Ground Floor, Near Bagga Link, Patparganj Industrial Area, Delhi-110092",
  hours: "Monday to Saturday",
  availability: "Available 24/7",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.6512294263116!2d77.30536750946962!3d28.64021332555896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfb3f3d95f0bb%3A0xd06142fa0b7860e5!2sMEDICAL%20%26%20SURGICAL%20SOLUTIONS!5e0!3m2!1sen!2sin!4v1770013271819!5m2!1sen!2sin",
  footerAbout:
    "Medical & Surgical Solutions — a trusted partner for healthcare professionals, hospitals and institutions, delivering genuine medical and surgical supplies across India.",
  facebook: "https://www.facebook.com/people/Medical-and-Surgical-Solutions/61571157007880/",
  youtube: "https://www.youtube.com/@MEDICALANDSURGICALSOLUTIONS",
  instagram: "https://www.instagram.com/mssofficial2011/",
  linkedin: "https://www.linkedin.com/company/medical-surgical-solutions/",
};

const FooterCMS = () => {
  const { data, set, loading, saving, save } = useSiteCms("contact", DEFAULTS);
  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <CmsHeader
        title="Contact & Footer"
        subtitle="One place for your business details — used on the Contact page, the footer, the top header bar and the FAQ help card."
      />

      <Card title="Contact Details">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Phone number">
            <TextInput value={data.phone} onChange={(v) => set("phone", v)} />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={data.email} onChange={(v) => set("email", v)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address">
              <TextArea rows={2} value={data.address} onChange={(v) => set("address", v)} />
            </Field>
          </div>
          <Field label="Working days / hours" hint="e.g. Monday to Saturday, 10 AM – 7 PM">
            <TextInput value={data.hours} onChange={(v) => set("hours", v)} />
          </Field>
          <Field label="Availability note" hint="Second line, e.g. Available 24/7">
            <TextInput value={data.availability} onChange={(v) => set("availability", v)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Google Maps embed URL" hint="Google Maps → Share → Embed a map → copy only the src=&quot;…&quot; link.">
              <TextArea rows={2} value={data.mapEmbedUrl} onChange={(v) => set("mapEmbedUrl", v)} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Footer">
        <Field label="About text under the logo">
          <TextArea rows={3} value={data.footerAbout} onChange={(v) => set("footerAbout", v)} />
        </Field>
        <div className="grid md:grid-cols-2 gap-5 mt-5">
          {["facebook", "youtube", "instagram", "linkedin"].map((k) => (
            <Field key={k} label={`${k[0].toUpperCase()}${k.slice(1)} URL`} hint="Leave empty to hide this icon.">
              <TextInput value={data[k]} onChange={(v) => set(k, v)} />
            </Field>
          ))}
        </div>
      </Card>

      <SaveButton saving={saving} onClick={() => save()}>Save Contact & Footer</SaveButton>
    </div>
  );
};

export default FooterCMS;
