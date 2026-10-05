import { Link } from "react-router-dom";

/* Navy page header shared by the storefront's inner pages (Cart, Wishlist,
 * Recently Viewed, Contact) so they match the Shop page header. */
export const PageHeader = ({ title, subtitle, crumb, icon, children }) => (
  <div className="relative overflow-hidden bg-[#023350]">
    <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-secondaryColor/25 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 left-10 w-72 h-72 rounded-full bg-primaryColor/20 blur-3xl" />
    <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:18px_18px]" />

    <div className="relative px-4 md:px-6 lg:px-side py-8 md:py-10">
      <nav className="text-xs mb-3 flex items-center gap-2">
        <Link to="/" className="!text-white/60 hover:!text-white transition">Home</Link>
        <i className="fa-solid fa-chevron-right text-[8px] !text-white/40"></i>
        <span className="!text-white font-medium">{crumb || title}</span>
      </nav>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          {icon && (
            <span className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
              <i className={`fa-solid ${icon} text-base md:text-lg !text-white`}></i>
            </span>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-[34px] font-bold !text-white leading-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm !text-white/65">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, text, cta = "Browse Products", to = "/shop" }) => (
  <div className="px-4 py-16 md:py-24 flex justify-center">
    <div className="text-center max-w-sm">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <span className="absolute inset-0 rounded-full bg-primaryColor/10 animate-ping opacity-40" />
        <span className="relative w-24 h-24 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          <i className={`fa-solid ${icon} text-3xl !text-primaryColor`}></i>
        </span>
      </div>
      <h2 className="text-xl md:text-2xl font-bold !text-[#023350]">{title}</h2>
      <p className="mt-2 text-sm md:text-[15px] !text-gray-500 leading-relaxed">{text}</p>
      <Link
        to={to}
        className="mt-7 inline-flex items-center gap-2 bg-primaryColor hover:bg-[#9e1d21] px-7 py-3 rounded-xl font-semibold !text-white shadow-[0_10px_25px_-10px_rgba(181,35,39,0.7)] transition-colors"
      >
        {cta} <i className="fa-solid fa-arrow-right text-xs !text-white"></i>
      </Link>
    </div>
  </div>
);

export default PageHeader;
