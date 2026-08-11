import { useEffect, useRef, useState } from "react";
import logo from "../assets/home/logo.png";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";

const IMG_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Header = () => {
  const { cart, wishlist } = useShop();
  const { user } = useAuth();
  const navigate = useNavigate();
  const accountLink = user ? "/user-dashboard" : "/login";
  const [open, setOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);
  const categoryRef = useRef(null);
const desktopCategoryRef = useRef(null); // desktop search bar "All Category"
const mobileCategoryRef = useRef(null); // mobile bottom bar "Categories"

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await API.get("/category?limit=200");
      setCategories(res.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };
  fetchCategories();
}, []);

// Search-box "All Category" dropdown: last 10 categories.
const searchCategories = categories.slice(-10);

// Image-based "All Categories" dropdown (desktop navbar + mobile bottom
// bar): first 10 categories, with a "View More" link to /shop below.
const navCategories = categories.slice(0, 10);

const handleCategoryClick = (e, category) => {
  e.stopPropagation();
  setOpen(false);
  setCategoryOpen(false);
  navigate(`/shop?category=${category._id}`);
};

const handleViewMoreCategories = () => {
  setCategoryOpen(false);
  navigate("/shop");
};

const handleSearchSubmit = (e) => {
  e.preventDefault();
  const q = searchQuery.trim();
  navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
};

useEffect(() => {
  const handleClick = (e) => {
    const insideOpenArea =
      (dropdownRef.current && dropdownRef.current.contains(e.target)) ||
      (desktopCategoryRef.current && desktopCategoryRef.current.contains(e.target));
    if (!insideOpenArea) {
      setOpen(false);
    }

    const insideCategoryArea =
      (categoryRef.current && categoryRef.current.contains(e.target)) ||
      (mobileCategoryRef.current && mobileCategoryRef.current.contains(e.target));
    if (!insideCategoryArea) {
      setCategoryOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClick);
  return () => document.removeEventListener("mousedown", handleClick);
}, []);

  return (
    <>
      {/* ================= TOP BAR ================= */}
      <div className="border-b">
        <div className="px-4 lg:px-side py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-sm">
              <div>
                <i className="fa-regular fa-envelope text-primaryColor"></i>{" "}
                <a
                  href="mailto:care@medicalsurgical.org"
                  className="font-medium"
                >
                  care@medicalsurgical.org
                </a>
              </div>

              <div>
                <i className="fa-solid fa-headset text-primaryColor"></i>{" "}
                <a href="tel:9643344588" className="font-medium">
                  +91 9643344588
                </a>
              </div>
              <div className="hidden md:flex items-center gap-2 ">
                <i class="fa-regular fa-comment text-primaryColor"></i>

                <a href="/contact" className="font-medium">
                  need help?
                </a>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <p className="font-semibold text-sm text-primaryColor">
                Follow Us:
              </p>

              <div className="flex gap-3">
               <a href="https://www.facebook.com/people/Medical-and-Surgical-Solutions/61571157007880/"> <i className="fa-brands fa-facebook text-primaryColor hover:text-black transition-all duration-300 cursor-pointer"></i></a>

                <a href="https://www.youtube.com/@MEDICALANDSURGICALSOLUTIONS"><i className="fa-brands fa-youtube text-primaryColor hover:text-black transition-all duration-300 cursor-pointer"></i></a>

                <a href="https://www.instagram.com/mssofficial2011/"><i className="fa-brands fa-instagram text-primaryColor hover:text-black transition-all duration-300 cursor-pointer"></i></a>

                <a href="https://www.linkedin.com/company/medical-surgical-solutions/"><i className="fa-brands fa-linkedin text-primaryColor hover:text-black transition-all duration-300 cursor-pointer"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOGO + HAMBURGER ================= */}
      <div className="px-4 lg:px-side py-3">
        <div className="flex items-center justify-between">
          <Link to="/">
          <img
            src={logo}
            alt="Logo"
            className="w-20 md:w-24"
          /></Link>
          <div
            ref={desktopCategoryRef}
            className="mt-4 hidden md:flex items-center rounded-full border-2 border-primaryColor h-12 md:h-14 px-4 md:px-5"
          >
            {/* Desktop Category */}
            <div
              className="hidden md:flex border-r pr-4 py-2 text-[#757F95] font-medium relative cursor-pointer"
              onClick={() => setOpen(!open)}
            >
              <p>
                All Category{" "}
                <i
                  className={`fa-solid fa-angle-down transition-all duration-300 ${open ? "rotate-180" : ""
                    }`}
                ></i>
              </p>

              {open && (
                <div className="absolute top-12 left-0 bg-white rounded-xl shadow-lg p-3 min-w-[220px] z-50">
                  {searchCategories.map((category) => (
                    <div key={category._id} onClick={(e) => handleCategoryClick(e, category)}>
                      <p className="hover:bg-primaryColor hover:text-white px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer">
                        {category.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 flex items-center ml-2 md:ml-4"
            >
              <input
                type="text"
                placeholder="Search Here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none border-none text-sm md:text-base"
              />

              <button type="submit" aria-label="Search">
                <i className="fa-solid fa-magnifying-glass text-[#757F95]"></i>
              </button>
            </form>
          </div>
          {/* Desktop Right Section */}
          <div className="hidden lg:flex gap-7">
            <Link to={accountLink} className="flex gap-2 items-center cursor-pointer">
              <div className="py-2 px-[10px] bg-primaryColor/20 rounded-full">
                <i className="fa-regular fa-circle-user text-xl text-primaryColor"></i>
              </div>

              <div className="text-sm">
                {user ? (
                  <>
                    <p className="font-medium">Hello, {user.name?.split(" ")[0] || "there"}</p>
                    <p className="font-semibold">My Account</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Sign In</p>
                    <p className="font-semibold">Account</p>
                  </>
                )}
              </div>
            </Link>

            <Link
  to="/wishlist"
  className="flex gap-2 items-center cursor-pointer"
>
 <div className="relative py-2 px-[10px] bg-primaryColor/20 rounded-full">
  <i className="fa-regular fa-heart text-xl text-primaryColor"></i>

  {wishlist.length > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold">
      {wishlist.length}
    </span>
  )}
</div>
</Link>

            <Link
  to="/cart"
  className="flex gap-2 items-center cursor-pointer"
>
 <div className="relative py-2 px-[10px] bg-primaryColor/20 rounded-full">
  <i className="fa-solid fa-bag-shopping text-xl text-primaryColor"></i>

  {cart.length > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold">
      {cart.length}
    </span>
  )}
</div>
</Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden text-2xl"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <i
              className={`fa-solid ${mobileMenu ? "fa-xmark" : "fa-bars"
                }`}
            ></i>
          </button>
        </div>

        {/* ================= SEARCH BAR ================= */}
        <div
          ref={dropdownRef}
          className="mt-4 md:hidden flex items-center rounded-full border-2 border-primaryColor h-12 md:h-14 px-4 md:px-5"
        >
          {/* Desktop Category */}
          <div
            className="hidden md:flex border-r pr-4 py-2 text-[#757F95] font-medium relative cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <p>
              All Category{" "}
              <i
                className={`fa-solid fa-angle-down transition-all duration-300 ${open ? "rotate-180" : ""
                  }`}
              ></i>
            </p>

            {open && (
              <div className="absolute top-12 left-0 bg-white rounded-xl shadow-lg p-3 min-w-[220px] z-50">
                {searchCategories.map((category) => (
                  <div key={category._id} onClick={(e) => handleCategoryClick(e, category)}>
                    <p className="hover:bg-primaryColor hover:text-white px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer">
                      {category.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 flex items-center ml-2 md:ml-4"
          >
            <input
              type="text"
              placeholder="Search Here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none border-none text-sm md:text-base"
            />

            <button type="submit" aria-label="Search">
              <i className="fa-solid fa-magnifying-glass text-[#757F95]"></i>
            </button>
          </form>
        </div>
      </div>

      {/* ================= DESKTOP NAVBAR ================= */}
      <div className="hidden lg:flex items-center justify-between px-side bg-primaryColor">
        {/* Categories */}
        <div
          ref={categoryRef}
          className="relative px-5 py-4 bg-secondaryColor text-white font-semibold cursor-pointer"
          onClick={() => setCategoryOpen(!categoryOpen)}
        >
          <i className="fa-solid fa-list"></i>
          &nbsp; All Categories

          {categoryOpen && (
            <div className="absolute left-0 top-full bg-white rounded-xl shadow-lg w-64 p-4 z-50">
              {navCategories.map((category) => (
                <div
                  key={category._id}
                  onClick={(e) => handleCategoryClick(e, category)}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                >
                  <img
                    src={`${IMG_URL}/${category.image}`}
                    alt={category.name}
                    className="w-5"
                  />

                  <p className="font-medium hover:text-secondaryColor">
                    {category.name}
                  </p>
                </div>
              ))}

              <div
                onClick={handleViewMoreCategories}
                className="mt-2 pt-2 border-t border-gray-100 text-center text-sm font-semibold text-primaryColor hover:text-secondaryColor cursor-pointer"
              >
                View More
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ul className="flex gap-8 text-[17px]">
          <Link to="/">
            <li className="text-white">Home</li>
          </Link>

          <Link to="/about">
            <li className="text-white">About</li>
          </Link>

          <Link to="/shop">
            <li className="text-white">Shop</li>
          </Link>

          <Link to="/blog">
            <li className="text-white">Blog</li>
          </Link>

          <Link to="/contact">
            <li className="text-white">Contact</li>
          </Link>

        </ul>

        {/* Right */}
        <div className="flex gap-7">
          <Link to="/recently-viewed"className="text-white">
            <i className="fa-regular fa-star mr-2 text-white"></i>
            Recently Viewed
          </Link>

         <Link to="https://www.dtdc.com/track-your-shipment/" target="_blank" className="text-white">
  <i className="fa-solid fa-truck-fast mr-2 text-white"></i>
  Track My Order
</Link>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${mobileMenu ? "max-h-[500px]" : "max-h-0"
          }`}
      >
        <div className="bg-primaryColor">
          <ul className="flex flex-col p-5 gap-5">
            <Link to="/" onClick={() => setMobileMenu(false)}>
              <li className="text-white">Home</li>
            </Link>

            <Link to="/about" onClick={() => setMobileMenu(false)}>
              <li className="text-white">About</li>
            </Link>

            <Link to="/shop" onClick={() => setMobileMenu(false)}>
              <li className="text-white">Shop</li>
            </Link>

            <Link to="/blog" onClick={() => setMobileMenu(false)}>
              <li className="text-white">Blog</li>
            </Link>

            <Link to="/contact" onClick={() => setMobileMenu(false)}>
              <li className="text-white">Contact</li>
            </Link>

            <Link to={accountLink} onClick={() => setMobileMenu(false)}>
              <li className="text-white">Account</li>
            </Link>
          </ul>
        </div>
      </div>
      {/* ================= MOBILE BOTTOM BAR ================= */}
<div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-2 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">

  {/* Categories */}
  <div
    ref={mobileCategoryRef}
    className="relative flex flex-col items-center gap-1 cursor-pointer"
    onClick={() => setCategoryOpen(!categoryOpen)}
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${categoryOpen ? "bg-primaryColor/20" : "bg-gray-100"}`}>
      <i className={`fa-solid fa-list text-lg ${categoryOpen ? "text-primaryColor" : "text-gray-500"}`}></i>
    </div>
    <span className="text-[10px] font-medium text-gray-500">Categories</span>

    {categoryOpen && (
      <div className="absolute bottom-16 left-0 bg-white rounded-xl shadow-lg w-56 p-3 z-50 border border-gray-100">
        {navCategories.map((category) => (
          <div
            key={category._id}
            onClick={(e) => handleCategoryClick(e, category)}
            className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-primaryColor/10 transition-colors duration-200 cursor-pointer"
          >
            <img src={`${IMG_URL}/${category.image}`} alt={category.name} className="w-5 h-5" />
            <p className="font-medium text-sm">{category.name}</p>
          </div>
        ))}

        <div
          onClick={handleViewMoreCategories}
          className="mt-1 pt-2 border-t border-gray-100 text-center text-sm font-semibold text-primaryColor cursor-pointer"
        >
          View More
        </div>
      </div>
    )}
  </div>

  {/* Wishlist */}
  <Link to="/wishlist" className="flex flex-col items-center gap-1 cursor-pointer">
    <div className="relative py-2 px-[10px] bg-gray-100 rounded-full">
  <i className="fa-regular fa-heart text-xl text-gray-500"></i>

  {wishlist.length > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold">
      {wishlist.length}
    </span>
  )}
</div>
  </Link>

  {/* Cart */}
  <Link
  to="/cart" className="flex flex-col items-center gap-1 cursor-pointer">
   <div className="relative py-2 px-[10px] bg-gray-100 rounded-full">
  <i className="fa-solid fa-bag-shopping text-xl text-gray-500"></i>

  {cart.length > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-semibold">
      {cart.length}
    </span>
  )}
</div>
</Link>

  {/* Account */}
  <Link to={accountLink} className="flex flex-col items-center gap-1 cursor-pointer">
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
      <i className="fa-regular fa-circle-user text-lg text-gray-500"></i>
    </div>
    <span className="text-[10px] font-medium text-gray-500">Account</span>
  </Link>

</div>
    </>
  );
};

export default Header;