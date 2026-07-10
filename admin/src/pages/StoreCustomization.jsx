import { useState } from 'react'
import HomeCMS from '../CMSPages/HomeCMS';
import AboutCMS from '../CMSPages/AboutCMS';
import FaqCMS from '../CMSPages/FaqCMS';
import PolicyCMS from '../CMSPages/PolicyCMS';
import SeoCMS from '../CMSPages/SeoCMS';
import CheckoutCMS from '../CMSPages/CheckoutCMS';
import FooterCMS from '../CMSPages/FooterCMS';

const StoreCustomization = () => {
    const tabs = [
  { name: "Home", key: "home" },
  { name: "About", key: "about" },
  { name: "FAQ", key: "faq" },
  { name: "Footer", key: "footer" },
  { name: "Privacy Policy", key: "privacy" },
  { name: "SEO Settings", key: "seo" },
  { name: "Checkout Form", key: "checkout" },
];

const [activeTab, setActiveTab] = useState("home");
  return (
    <>
        <div className="flex gap-3 border-b pb-3 overflow-x-auto mt-10">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap
        ${
          activeTab === tab.key
            ? "bg-[var(--primary-container)] text-white"
            : "bg-[var(--surface)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-high)]"
        }`}
    >
      {tab.name}
    </button>
  ))}
</div>

<div className="mt-6">
  {activeTab === "home" && <HomeCMS/> }
  {activeTab === "about" && <AboutCMS/>}
  {activeTab === "faq" && <FaqCMS/>}
  {activeTab === "footer" && <FooterCMS/>}
  {activeTab === "privacy" && <PolicyCMS/>}
  {activeTab === "seo" && <SeoCMS/>}
  {activeTab === "checkout" && <CheckoutCMS/>}
</div>
    </>
  )
}

export default StoreCustomization